import { Client, Account, Databases } from 'appwrite'

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT)

export const account = new Account(client)
export const db = new Databases(client)

export const cfg = {
    dbId: import.meta.env.VITE_APPWRITE_DATABASE,
    customers: 'customer',
    services: 'service', 
    subscriptions: 'subscriptions',
}
