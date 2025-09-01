<template>
  <va-layout :style="{ height: '100vh' }">
    <template #topbar>
      <div class="topbar">
        <va-button preset="plain" round @click="toggle">
          <va-icon name="menu" />
        </va-button>
        <div class="topbar-title">WT Admin</div>
        <va-spacer />
        <va-button v-if="showLogout" preset="secondary" size="small" round @click="logout">
          <va-icon name="logout" class="mr-1" /> Выход
        </va-button>
      </div>
    </template>

    <template #left>
      <Sidebar ref="sb" />
    </template>

    <div class="main-content">
      <router-view />
    </div>
  </va-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from './Sidebar.vue'
import { account } from '@/appwrite/client'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const sb = ref()

// Показывать кнопку выхода только если не на странице логина
const showLogout = computed(() => route.name !== 'login')

function toggle() {
  // доступ к collapsed через ref на Sidebar
  if (sb.value) sb.value.collapsed = !sb.value.collapsed
}

async function logout() {
  try { await account.deleteSession('current') } catch {}
  router.replace({ name: 'login' })
}
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--va-background-element);
  background-color: var(--va-background-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.main-content {
  padding: 24px;
  background-color: var(--va-background-primary);
  min-height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>
