import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID, Query } from 'appwrite'
import { account } from '@/appwrite/client'

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
        Query.equal('accounts_id', accountId),
        Query.orderAsc('seat_number')
    ])
    return res.documents
}

// Получение статистики аккаунта (занятые места)
async function getAccountStats(accountId) {
    const occupiedSeats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
        Query.equal('accounts_id', accountId)
    ])
    
    const accountData = await db.getDocument(cfg.dbId, cfg.accounts, accountId)
    
    return {
        occupiedCount: occupiedSeats.documents.length,
        maxSeats: accountData.max_seats || 0,
        availableSeats: Math.max(0, (accountData.max_seats || 0) - occupiedSeats.documents.length),
        canAddMore: occupiedSeats.documents.length < (accountData.max_seats || 0)
    }
}

// Обновление места в аккаунте
async function updateAccountSeat({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.account_seats, id, payload)
}

// Освобождение места
async function freeSeat(seatId) {
    try {
        // Получаем информацию о месте перед удалением
        const seat = await db.getDocument(cfg.dbId, cfg.account_seats, seatId)
        const accountId = seat.accounts_id
        
        // Удаляем запись о месте
        await db.deleteDocument(cfg.dbId, cfg.account_seats, seatId)
        
        // Получаем обновленное количество занятых мест
        const remainingSeats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
            Query.equal('accounts_id', accountId)
        ])
        
        // Обновляем счетчик в аккаунте
        await db.updateDocument(cfg.dbId, cfg.accounts, accountId, {
            seats_taken: remainingSeats.documents.length
        })
        
        return { success: true, accountId }
    } catch (error) {
        console.error('Error freeing seat:', error)
        throw error
    }
}

// Занятие места в аккаунте
async function occupySeat(accountId, customerId) {
    try {
        // Проверяем доступность мест
        const stats = await getAccountStats(accountId)
        
        if (!stats.canAddMore) {
            throw new Error('В этом аккаунте нет свободных мест')
        }
        
        // Получаем текущие места для определения номера нового места
        const existingSeats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
            Query.equal('accounts_id', accountId),
            Query.orderAsc('seat_number')
        ])
        
        // Определяем номер нового места
        let seatNumber = 1
        const usedNumbers = existingSeats.documents.map(seat => seat.seat_number || 0).sort((a, b) => a - b)
        
        for (let i = 1; i <= stats.maxSeats; i++) {
            if (!usedNumbers.includes(i)) {
                seatNumber = i
                break
            }
        }
        
        // Создаем новое место
        const newSeat = await db.createDocument(cfg.dbId, cfg.account_seats, ID.unique(), {
            accounts_id: accountId,
            customers_id: customerId,
            is_occupied: true,
            seat_number: seatNumber
        })
        
        // Обновляем счетчик занятых мест в аккаунте
        await db.updateDocument(cfg.dbId, cfg.accounts, accountId, {
            seats_taken: stats.occupiedCount + 1
        })
        
        return newSeat
    } catch (error) {
        console.error('Error occupying seat:', error)
        throw error
    }
}

// Создание аккаунта
async function createAccount(payload) {
    // Устанавливаем начальные значения
    payload.seats_taken = 0
    payload.status = payload.status || 'active'
    
    return await db.createDocument(cfg.dbId, cfg.accounts, ID.unique(), payload)
}

// Обновление аккаунта
async function updateAccount({ id, ...payload }) {
    return await db.updateDocument(cfg.dbId, cfg.accounts, id, payload)
}

// Удаление аккаунта (с проверкой занятых мест)
async function deleteAccount(accountId) {
    // Проверяем, есть ли занятые места
    const occupiedSeats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
        Query.equal('accounts_id', accountId)
    ])
    
    if (occupiedSeats.documents.length > 0) {
        throw new Error('Нельзя удалить аккаунт с занятыми местами. Сначала освободите все места.')
    }
    
    return await db.deleteDocument(cfg.dbId, cfg.accounts, accountId)
}

// Получение клиентов в аккаунте
async function getAccountCustomers(accountId) {
    const seats = await db.listDocuments(cfg.dbId, cfg.account_seats, [
        Query.equal('accounts_id', accountId)
    ])
    
    const customerIds = seats.documents.map(seat => seat.customers_id).filter(Boolean)
    
    if (customerIds.length === 0) return []
    
    const customers = await db.listDocuments(cfg.dbId, cfg.customers, [
        Query.equal('$id', customerIds)
    ])
    
    return customers.documents
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

export function useDeleteAccount() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['accounts'] })
        }
    })
}