<template>
  <va-layout :style="{ height: '100vh' }">
    <template #topbar>
      <div class="flex items-center gap-2 px-3 py-2 border-b border-[var(--va-background-element)]">
        <va-button preset="plain" round @click="toggle">
          <va-icon name="menu" />
        </va-button>
        <div class="font-semibold">WT Admin</div>
        <va-spacer />
        <va-button preset="secondary" size="small" @click="logout">
          <va-icon name="logout" class="mr-1" /> Выход
        </va-button>
      </div>
    </template>

    <template #left>
      <Sidebar ref="sb" />
    </template>

    <div class="p-4">
      <router-view />
    </div>
  </va-layout>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'
const router = useRouter()
const sb = ref()

function toggle() {
  // доступ к collapsed через ref на Sidebar
  if (sb.value) sb.value.collapsed = !sb.value.collapsed
}
async function logout() {
  try { await account.deleteSession('current') } catch {}
  router.replace({ name: 'login' })
}
</script>
