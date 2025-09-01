import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

const qkey = ['customers']

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

// Получение подписок клиента
async function getCustomerSubscriptions(customerId) {
    const res = await db.listDocuments(cfg.dbId, cfg.subscriptions, [
        Query.equal('customer', customerId),
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение всех сервисов
async function listServices() {
    const res = await db.listDocuments(cfg.dbId, cfg.services, [])
    return res.documents
}

// Хуки для работы с клиентами
export function useCustomers() { 
    return useQuery({ 
        queryKey: qkey, 
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

export function useCustomerSubscriptions(customerId) {
    return useQuery({
        queryKey: ['customer-subscriptions', customerId],
        queryFn: () => getCustomerSubscriptions(customerId),
        enabled: !!customerId
    })
}

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: listServices
    })
}

// Создание клиента
export function useCreateCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload) => db.createDocument(cfg.dbId, cfg.customers, ID.unique(), payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qkey })
        },
    })
}

// Обновление клиента
export function useUpdateCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, ...payload }) => db.updateDocument(cfg.dbId, cfg.customers, id, payload),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: qkey })
            qc.invalidateQueries({ queryKey: ['customer', data.$id] })
        },
    })
}

// Удаление клиента
export function useDeleteCustomer() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id) => db.deleteDocument(cfg.dbId, cfg.customers, id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: qkey })
        },
    })
}