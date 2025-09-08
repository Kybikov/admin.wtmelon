import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

// Получение всех клиентов
async function listCustomers() {
    const res = await db.listDocuments(cfg.dbId, cfg.customers, [
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение одного клиента по ID
async function getCustomer(id) {
    return await db.getDocument(cfg.dbId, cfg.customers, id)
}

// Создание клиента
async function createCustomer(payload) {
    return await db.createDocument(cfg.dbId, cfg.customers, ID.unique(), payload)
}

// Обновление клиента
async function updateCustomer({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.customers, id, payload)
}

// Удаление клиента
async function deleteCustomer(id) {
    return await db.deleteDocument(cfg.dbId, cfg.customers, id)
}

// Получение статистики клиента
async function getCustomerStats(customerId) {
    try {
        // Получаем все подписки клиента
        const subscriptions = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
            Query.equal('customers_id', customerId)
        ])
        
        // Получаем все заказы клиента
        const orders = await db.listDocuments(cfg.dbId, cfg.orders, [
            Query.equal('customers_id', customerId)
        ])
        
        const totalPurchases = orders.documents.length
        const totalSpent = orders.documents.reduce((sum, order) => sum + (order.sell_price || 0), 0)
        const activeSubscriptions = subscriptions.documents.filter(sub => sub.state === 'active').length
        
        return {
            totalPurchases,
            totalSpent,
            activeSubscriptions
        }
    } catch (error) {
        console.error('Error fetching customer stats:', error)
        return {
            totalPurchases: 0,
            totalSpent: 0,
            activeSubscriptions: 0
        }
    }
}

// Хуки для работы с клиентами
export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: listCustomers
    })
}

export function useCustomer(id) {
    return useQuery({
        queryKey: ['customer', id],
        queryFn: () => getCustomer(id),
        enabled: !!id
    })
}

export function useCustomerStats(customerId) {
    return useQuery({
        queryKey: ['customer-stats', customerId],
        queryFn: () => getCustomerStats(customerId),
        enabled: !!customerId
    })
}

export function useCreateCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createCustomer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers'] })
        }
    })
}

export function useUpdateCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateCustomer,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['customers'] })
            qc.invalidateQueries({ queryKey: ['customer', data.$id] })
        }
    })
}

export function useDeleteCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteCustomer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['customers'] })
        }
    })
}