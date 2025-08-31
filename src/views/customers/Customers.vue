<template>
  <div class="p-4">
    <va-card>
      <div class="flex gap-2 mb-3">
        <va-input v-model="search" placeholder="Поиск..." />
        <va-button @click="showCreate = true">Добавить</va-button>
      </div>
      <va-data-table :items="filtered" :columns="cols" :loading="isLoading" />
    </va-card>

    <va-modal v-model="showCreate" title="Новый клиент">
      <div class="mb-2"><va-input v-model="form.name" label="Имя" /></div>
      <div class="mb-2"><va-input v-model="form.email" label="Email" type="email" /></div>
      <template #footer>
        <va-button :loading="creating" @click="create">Сохранить</va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useCustomers, useCreateCustomer } from './useCustomers'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'
import {VaButtonDropdown} from "vuestic-ui";

const router = useRouter()
onMounted(async ()=>{ try{ await account.get() } catch { router.replace('/login') } })

const cols = [{ key: 'name', label: 'Имя' }, { key: 'email', label: 'Email' }]
const { data, isLoading } = useCustomers()
const search = ref('')
const filtered = computed(()=> (data?.value ?? []).filter(r =>
    [r.name, r.email].some(v => (v||'').toLowerCase().includes(search.value.toLowerCase()))
))

const showCreate = ref(false)
const form = reactive({ name:'', email:'' })
const { mutateAsync, isLoading: creating } = useCreateCustomer()
async function create(){
  await mutateAsync({ name: form.name, email: form.email || null })
  showCreate.value=false; form.name=''; form.email=''
}
</script>
