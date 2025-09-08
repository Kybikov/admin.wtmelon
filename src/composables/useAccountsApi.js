import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'

// Получение всех аккаунтов
async function listAccounts() {
    console.log('Fetching accounts from database...')
    console.log('Database ID:', cfg.dbId)
    console.log('Collection ID:', cfg.accounts)
    
    const res = await db.listDocuments(cfg.dbId, cfg.accounts, [
        Query.orderDesc('$createdAt')
    ])
    
    console.log('Accounts response:', res)
    console.log('Accounts documents:', res.documents)
    
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
    // Получаем информацию о месте перед удалением
    const seat = await db.getDocument(cfg.dbId, cfg.account_seats, seatId)
    const accountId = seat.accounts_id
    
    // Удаляем запись о месте
    await db.deleteDocument(cfg.dbId, cfg.account_seats, seatId)
    
    // Обновляем счетчик занятых мест в аккаунте
    const account = await db.getDocument(cfg.dbId, cfg.accounts, accountId)
    await db.updateDocument(cfg.dbId, cfg.accounts, accountId, {
        seats_taken: Math.max(0, (account.seats_taken || 0) - 1)
    })
    
    return { success: true }
}

// Занятие места
async function occupySeat(accountId, customerId) {
    // Создаем новую запись для занятого места
    const newSeat = await db.createDocument(cfg.dbId, cfg.account_seats, ID.unique(), {
        accounts_id: accountId,
        customers_id: customerId,
        is_occupied: true,
        seat_number: null // Будет установлено автоматически или позже
    })
    
    // Обновляем счетчик занятых мест в аккаунте
    const account = await db.getDocument(cfg.dbId, cfg.accounts, accountId)
    await db.updateDocument(cfg.dbId, cfg.accounts, accountId, {
        seats_taken: (account.seats_taken || 0) + 1
    })
    
    return newSeat
}

// Проверка доступности мест в аккаунте
async function checkAvailableSeats(accountId) {
    const [account, occupiedSeats] = await Promise.all([
        db.getDocument(cfg.dbId, cfg.accounts, accountId),
        db.listDocuments(cfg.dbId, cfg.account_seats, [
            Query.equal('accounts_id', accountId)
        ])
    ])
    
    const occupiedCount = occupiedSeats.documents.length
    const maxSeats = account.max_seats || 0
    
    return {
        account,
        occupiedCount,
        maxSeats,
        availableSeats: maxSeats - occupiedCount,
        canAddMore: occupiedCount < maxSeats
    }
}
// Хуки для работы с аккаунтами
export function useAccounts() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: listAccounts
    })
}

// функция создания аккаунта
async function createAccount(payload) {
    return await db.createDocument(cfg.dbId, cfg.accounts, ID.unique(), payload)
}

// хук создания аккаунта
export function useCreateAccount() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: createAccount,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
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
        mutationFn: ({ accountId, customerId }) => occupySeat(accountId, customerId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['account-seats'] })
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
    })
}

export function useCheckAvailableSeats() {
    return useMutation({
        mutationFn: checkAvailableSeats
    })
}