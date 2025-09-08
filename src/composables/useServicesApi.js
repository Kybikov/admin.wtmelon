import { db, cfg } from '@/appwrite/client'
import { useQuery } from '@tanstack/vue-query'
import { Query } from 'appwrite'

// Получение всех сервисов
async function listServices() {
    const res = await db.listDocuments(cfg.dbId, cfg.services, [
        Query.equal('isActive', true),
        Query.orderAsc('name')
    ])
    return res.documents
}

// Получение одного сервиса по ID
async function getService(id) {
    return await db.getDocument(cfg.dbId, cfg.services, id)
}

// Хуки для работы с сервисами
export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: listServices
    })
}

export function useService(id) {
    return useQuery({
        queryKey: ['service', id],
        queryFn: () => getService(id),
        enabled: !!id
    })
}