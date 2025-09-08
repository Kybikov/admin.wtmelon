import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

// Получение всех подписок
async function listSubscriptions() {
    const res = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение подписок клиента
async function getCustomerSubscriptions(customerId) {
    const res = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
        Query.equal('customers_id', customerId),
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение подписок по статусу
async function getSubscriptionsByStatus(status) {
    const res = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
        Query.equal('state', status),
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение истекающих подписок
async function getExpiringSubscriptions(days = 3) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    const res = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
        Query.lessThanEqual('end_date', futureDate.toISOString()),
        Query.equal('state', 'active'),
        Query.orderAsc('end_date')
    ])
    return res.documents
}

// Создание подписки
async function createSubscription(payload) {
    // Если это membership подписка, создаем место в аккаунте
    if (payload.accounts_id) {
        // Проверяем доступность мест
        const account = await db.getDocument(cfg.dbId, cfg.accounts, payload.accounts_id)
        const occupiedSeats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
            Query.equal('accounts_id', payload.accounts_id)
        ])
        
        const occupiedCount = occupiedSeats.documents.length
        const maxSeats = account.max_seats || 0
        
        if (occupiedCount >= maxSeats) {
            throw new Error('В этом аккаунте нет свободных мест')
        }
        
        // Создаем новое место для клиента
        const newSeat = await db.createDocument(cfg.dbId, cfg.account_seats, ID.unique(), {
            accounts_id: payload.accounts_id,
            customers_id: payload.customers_id,
            is_occupied: true,
            seat_number: occupiedCount + 1 // Присваиваем номер места
        })
        
        // Обновляем счетчик занятых мест в аккаунте
        await db.updateDocument(cfg.dbId, cfg.accounts, payload.accounts_id, {
            seats_taken: occupiedCount + 1
        })
        
        // Добавляем ID созданного места в payload подписки
        payload.account_seats_id = newSeat.$id
    }
    
    // Создаем подписку
    const subscription = await db.createDocument(cfg.dbId, cfg.subscriptions, ID.unique(), payload)
    
    // Обновляем статистику клиента
    if (payload.sell_price) {
        const customer = await db.getDocument(cfg.dbId, cfg.customers, payload.customers_id)
        await db.updateDocument(cfg.dbId, cfg.customers, payload.customers_id, {
            total_spent: (customer.total_spent || 0) + payload.sell_price,
            total_purchases: (customer.total_purchases || 0) + 1
        })
    }
    
    return subscription
}

// Обновление подписки
async function updateSubscription({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.subscriptions, id, payload)
}

// Получение статистики подписок
async function getSubscriptionsStats() {
    const [active, expiring, overdue] = await Promise.all([
        getSubscriptionsByStatus('active'),
        getExpiringSubscriptions(3),
        getSubscriptionsByStatus('overdue')
    ])
    
    return {
        active: active.length,
        expiring: expiring.length,
        overdue: overdue.length,
        total: active.length + expiring.length + overdue.length
    }
}

// Хуки для работы с подписками
export function useSubscriptions() {
    return useQuery({
        queryKey: ['subscriptions'],
        queryFn: listSubscriptions
    })
}

export function useCustomerSubscriptions(customerId) {
    return useQuery({
        queryKey: ['customer-subscriptions', customerId],
        queryFn: () => getCustomerSubscriptions(customerId),
        enabled: !!customerId
    })
}

export function useSubscriptionsByStatus(status) {
    return useQuery({
        queryKey: ['subscriptions', 'status', status],
        queryFn: () => getSubscriptionsByStatus(status),
        enabled: !!status
    })
}

export function useExpiringSubscriptions(days = 3) {
    return useQuery({
        queryKey: ['subscriptions', 'expiring', days],
        queryFn: () => getExpiringSubscriptions(days)
    })
}

export function useSubscriptionsStats() {
    return useQuery({
        queryKey: ['subscriptions-stats'],
        queryFn: getSubscriptionsStats
    })
}

export function useCreateSubscription() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createSubscription,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['subscriptions'] })
            qc.invalidateQueries({ queryKey: ['customers'] })
            qc.invalidateQueries({ queryKey: ['accounts'] })
            qc.invalidateQueries({ queryKey: ['account-seats'] })
        }
    })
}

export function useUpdateSubscription() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateSubscription,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['subscriptions'] })
        }
    })
}