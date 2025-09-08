import { teams } from '@/appwrite/client'
import { useQuery } from '@tanstack/vue-query'

// Получение списка менеджеров из команды
async function getManagersTeam(teamId = 'manager') {
    try {
        const memberships = await teams.listMemberships(teamId)
        return memberships.memberships
    } catch (error) {
        console.error('Ошибка получения команды менеджеров:', error)
        return []
    }
}

// Получение информации о конкретном менеджере
async function getManagerInfo(teamId = 'manager', userId) {
    try {
        const memberships = await teams.listMemberships(teamId)
        return memberships.memberships.find(m => m.userId === userId)
    } catch (error) {
        console.error('Ошибка получения информации о менеджере:', error)
        return null
    }
}

// Хуки для работы с командами
export function useManagersTeam(teamId = 'manager') {
    return useQuery({
        queryKey: ['managers-team', teamId],
        queryFn: () => getManagersTeam(teamId),
        staleTime: 5 * 60 * 1000, // 5 минут
    })
}

export function useManagerInfo(userId, teamId = 'manager') {
    return useQuery({
        queryKey: ['manager-info', teamId, userId],
        queryFn: () => getManagerInfo(teamId, userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 минут
    })
}

// Утилита для получения имени менеджера
export function getManagerDisplayName(managerId, managers = []) {
    if (!managerId) return 'Не указан'
    
    const manager = managers.find(m => m.userId === managerId)
    if (manager) {
        return manager.userName || manager.userEmail || `Менеджер ${managerId.slice(-6)}`
    }
    
    return `Менеджер ${managerId.slice(-6)}`
}