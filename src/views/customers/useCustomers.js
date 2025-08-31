import { db, cfg } from '@/appwrite/client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ID } from 'appwrite'

const qkey = ['customers']

async function listCustomers () {
    const res = await db.listDocuments(cfg.dbId, cfg.customers, [])
    return res.documents
}
export function useCustomers(){ return useQuery({ queryKey: qkey, queryFn: listCustomers }) }

export function useCreateCustomer(){
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (payload) => db.createDocument(cfg.dbId, cfg.customers, ID.unique(), payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: qkey }),
    })
}
