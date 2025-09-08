import { Client, Account, Databases, Teams } from 'appwrite'

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT)

export const account = new Account(client)
export const db = new Databases(client)
export const teams = new Teams(client)

export const cfg = {
    dbId: import.meta.env.VITE_APPWRITE_DATABASE,
    customers: 'customers',
    services: 'services',
    subscriptions: 'subscriptions',
    accounts: 'accounts',
    account_seats: 'account_seats',
    orders: 'orders',
    plan_kinds: 'plan_kinds',
    plan_terms: 'plan_terms',
    plans: 'plans',
    prices: 'prices',
    regions: 'regions',
    currencies: 'currencies'
}

// Отладка конфигурации
console.log('Appwrite config:', cfg)