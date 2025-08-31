<template>
  <div class="flex items-center justify-center" style="height:100vh">
    <va-card style="min-width:320px">
      <h3 class="mb-2">Вход</h3>
      <va-input v-model="email" type="email" label="Email" class="mb-2" />
      <va-input v-model="password" type="password" label="Пароль" class="mb-3" />
      <va-button :loading="loading" @click="onLogin">Войти</va-button>
      <va-alert v-if="err" color="danger" class="mt-2">{{ err }}</va-alert>
    </va-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'
const router = useRouter()
const email = ref(''); const password = ref(''); const loading = ref(false); const err = ref('')

onMounted(async () => { try { await account.get(); router.replace('/') } catch {} })

async function onLogin () {
  err.value=''; loading.value=true
  try { await account.createEmailPasswordSession(email.value, password.value); router.replace('/') }
  catch(e){ err.value = e?.message || 'Ошибка входа' }
  finally { loading.value=false }
}
</script>
