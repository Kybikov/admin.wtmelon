import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

// Получение всех аккаунтов
async function listAccounts() {
    const res = await db.listDocuments(cfg.dbId, cfg.accounts, [
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение аккаунтов по сервису
async function getAccountsByService(serviceId) {
    const res = await db.listDocuments(cfg.dbId, cfg.accounts, [
        Query.equal('services_id', serviceId),
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Получение одного аккаунта по ID
async function getAccount(id) {
    return await db.getDocument(cfg.dbId, cfg.accounts, id)
}

// Получение мест аккаунта
async function getAccountSeats(accountId) {
    const res = await db.listDocuments(cfg.dbId, cfg.account_seats, [
        Query.equal('accounts_id', accountId)
    ])
    return res.documents
}

// Обновление места в аккаунте
async function updateAccountSeat({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.account_seats, id, payload)
}

// Освобождение места
async function freeSeat(seatId) {
    return await db.updateDocument(cfg.dbId, cfg.account_seats, seatId, {
        customers_id: null,
        is_occupied: false
    })
}

// Занятие места
async function occupySeat(seatId, customerId) {
    return await db.updateDocument(cfg.dbId, cfg.account_seats, seatId, {
        customers_id: customerId,
        is_occupied: true
    })
}

// Хуки для работы с аккаунтами
export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: listAccounts
    })
}

export function useAccountsByService(serviceId) {
    return useQuery({
        queryKey: ['accounts', 'service', serviceId],
        queryFn: () => getAccountsByService(serviceId),
        enabled: !!serviceId
    })
}

export function useAccount(id) {
    return useQuery({
        queryKey: ['account', id],
        queryFn: () => getAccount(id),
        enabled: !!id
    })
}

export function useAccountSeats(accountId) {
    return useQuery({
        queryKey: ['account-seats', accountId],
        queryFn: () => getAccountSeats(accountId),
        enabled: !!accountId
    })
}

export function useUpdateAccountSeat() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: updateAccountSeat,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ['account-seats'] })
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
    })
}

export function useFreeSeat() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: freeSeat,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['account-seats'] })
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
    })
}

export function useOccupySeat() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ seatId, customerId }) => occupySeat(seatId, customerId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['account-seats'] })
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
    })
}