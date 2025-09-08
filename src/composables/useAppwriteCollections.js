import { db, cfg } from '@/appwrite/client'
import { useQuery } from '@tanstack/vue-query'
import { Query } from 'appwrite'

// Получение регионов
async function listRegions() {
    const res = await db.listDocuments(cfg.dbId, cfg.regions, [
        Query.equal('isActive', true),
        Query.orderAsc('name')
    ])
    return res.documents
}

// Получение валют
async function listCurrencies() {
    const res = await db.listDocuments(cfg.dbId, cfg.currencies, [
        Query.orderAsc('name')
    ])
    return res.documents
}

// Получение типов планов
async function listPlanKinds() {
    const res = await db.listDocuments(cfg.dbId, cfg.plan_kinds, [
        Query.orderAsc('name')
    ])
    return res.documents
}

// Получение условий планов
async function listPlanTerms() {
    const res = await db.listDocuments(cfg.dbId, cfg.plan_terms, [
        Query.orderAsc('period_months')
    ])
    return res.documents
}

// Получение планов
async function listPlans() {
    const res = await db.listDocuments(cfg.dbId, cfg.plans, [
        Query.orderAsc('name')
    ])
    return res.documents
}

// Получение цен
async function listPrices() {
    const res = await db.listDocuments(cfg.dbId, cfg.prices, [
        Query.orderDesc('$createdAt')
    ])
    return res.documents
}

// Хуки для работы со справочными данными
export function useRegions() {
    return useQuery({
        queryKey: ['regions'],
        queryFn: listRegions
    })
}

export function useCurrencies() {
    return useQuery({
        queryKey: ['currencies'],
        queryFn: listCurrencies
    })
}

export function usePlanKinds() {
    return useQuery({
        queryKey: ['plan-kinds'],
        queryFn: listPlanKinds
    })
}

export function usePlanTerms() {
    return useQuery({
        queryKey: ['plan-terms'],
        queryFn: listPlanTerms
    })
}

export function usePlans() {
    return useQuery({
        queryKey: ['plans'],
        queryFn: listPlans
    })
}

export function usePrices() {
    return useQuery({
        queryKey: ['prices'],
        queryFn: listPrices
    })
}