<template>
  <div id="app">
    <!-- Страница логина отображается без сайдбара -->
    <template v-if="$route.name === 'login'">
      <router-view />
    </template>
    
    <!-- Все остальные страницы отображаются с сайдбаром -->
    <template v-else>
      <va-layout style="height: 100vh;">
        <template #left>
          <Sidebar ref="sidebarRef" />
        </template>

        <template #top>
          <div class="topbar">
            <va-button preset="plain" round @click="toggleSidebar">
              <va-icon name="menu" />
            </va-button>
            <div class="topbar-title">WT Admin</div>
            <va-spacer />
            <va-button preset="secondary" size="small" round @click="logout">
              <va-icon name="logout" class="mr-1" /> Выход
            </va-button>
          </div>
        </template>

        <template #content>
          <div class="main-content">
            <router-view />
          </div>
        </template>
      </va-layout>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/layout/Sidebar.vue'
import { account } from '@/appwrite/client'

const router = useRouter()
const sidebarRef = ref()

function toggleSidebar() {
  if (sidebarRef.value) {
    sidebarRef.value.collapsed = !sidebarRef.value.collapsed
  }
}

async function logout() {
  try { 
    await account.deleteSession('current') 
  } catch {}
  router.replace({ name: 'login' })
}
</script>

<style>
/* Глобальные стили для всего приложения */
* {
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--va-background-primary);
  color: var(--va-text-primary);
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--va-background-element);
  background-color: var(--va-background-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  height: 64px;
}

.topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.main-content {
  padding: 24px;
  background-color: var(--va-background-primary);
  height: 100%;
  overflow-y: auto;
}
</style>