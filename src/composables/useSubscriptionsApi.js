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
    // Создаем подписку
    const subscription = await db.createDocument(cfg.dbId, cfg.subscriptions, ID.unique(), payload)
    
    // Если это membership подписка, обновляем место в аккаунте
    if (payload.account_seats_id) {
        await db.updateDocument(cfg.dbId, cfg.account_seats, payload.account_seats_id, {
            customers_id: payload.customers_id,
            is_occupied: true
        })
        
        // Обновляем счетчики в аккаунте
        const account = await db.getDocument(cfg.dbId, cfg.accounts, payload.accounts_id)
        await db.updateDocument(cfg.dbId, cfg.accounts, payload.accounts_id, {
            seats_taken: (account.seats_taken || 0) + 1,
            seats_free: Math.max(0, (account.seats_free || account.max_seats) - 1)
        })
    }
    
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