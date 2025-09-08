import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

// Получение всех заказов
async function listOrders() {
    const res = await db.listDocuments(cfg.dbId, cfg.orders, [
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение заказов клиента
async function getCustomerOrders(customerId) {
    const res = await db.listDocuments(cfg.dbId, cfg.orders, [
        Query.equal('customers_id', customerId),
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Создание заказа
async function createOrder(payload) {
    // Получаем текущего пользователя и добавляем его ID как manager_id
    try {
        const currentUser = await account.get()
        payload.manager_id = currentUser.$id
    } catch (error) {
        console.warn('Не удалось получить текущего пользователя для manager_id:', error)
        // Если не удалось получить пользователя, оставляем поле пустым
        payload.manager_id = null
    }
    
    return await db.createDocument(cfg.dbId, cfg.orders, ID.unique(), payload)
}

// Обновление заказа
async function updateOrder({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.orders, id, payload)
}

// Удаление заказа
async function deleteOrder(id) {
    return await db.deleteDocument(cfg.dbId, cfg.orders, id)
}

// Хуки для работы с заказами
export function useOrders() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: listOrders
    })
}

export function useCustomerOrders(customerId) {
    return useQuery({
        queryKey: ['customer-orders', customerId],
        queryFn: () => getCustomerOrders(customerId),
        enabled: !!customerId
    })
}

export function useCreateOrder() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] })
        }
    })
}

export function useUpdateOrder() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateOrder,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['orders'] })
            qc.invalidateQueries({ queryKey: ['order', data.$id] })
        }
    })
}

export function useDeleteOrder() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] })
        }
    })
}