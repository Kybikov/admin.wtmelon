<template>
  <div id="app">
    <!-- Страница логина без сайдбара -->
    <template v-if="$route.name === 'login'">
      <router-view />
    </template>
    
    <!-- Основной лейаут с сайдбаром -->
    <template v-else>
      <va-layout style="height: 100vh;">
        <template #left>
          <va-sidebar
            v-model="sidebarVisible"
            :width="280"
            :minimized-width="64"
            :minimized="sidebarMinimized"
            color="backgroundSecondary"
            class="app-sidebar"
          >
            <!-- Заголовок -->
            <div class="sidebar-header">
              <div class="logo-section">
                <div class="logo-icon">
                  <va-icon name="watermelon" size="24px" color="primary" />
                </div>
                <div v-if="!sidebarMinimized" class="logo-text">
                  <div class="logo-title">WaterMelon</div>
                  <div class="logo-subtitle">CRM v2.0</div>
                </div>
              </div>
            </div>

            <!-- Навигация -->
            <div class="sidebar-nav">
              <va-sidebar-item
                v-for="item in navItems"
                :key="item.name"
                :to="item.to"
                :active="$route.name === item.name"
                class="nav-item"
              >
                <template #icon>
                  <va-icon :name="item.icon" size="20px" />
                </template>
                <va-sidebar-item-content>
                  <va-sidebar-item-title>{{ item.title }}</va-sidebar-item-title>
                </va-sidebar-item-content>
              </va-sidebar-item>
            </div>

            <!-- Футер сайдбара -->
            <div class="sidebar-footer">
              <div class="theme-toggle">
                <va-button preset="plain" size="small" round>
                  <va-icon name="light_mode" size="16px" />
                </va-button>
              </div>
              
              <div class="user-profile">
                <va-avatar size="32px" color="primary">
                  A
                </va-avatar>
                <div v-if="!sidebarMinimized" class="user-info">
                  <div class="user-name">Админ WaterMelon</div>
                  <div class="user-role">Admin</div>
                </div>
              </div>
            </div>
          </va-sidebar>
        </template>

        <template #content>
          <div class="main-content">
            <!-- Топбар -->
            <div class="topbar">
              <va-button
                preset="plain"
                size="small"
                round
                @click="sidebarMinimized = !sidebarMinimized"
              >
                <va-icon name="menu" />
              </va-button>
              
              <va-spacer />
              
              <div class="topbar-actions">
                <va-button preset="plain" size="small" round>
                  <va-icon name="notifications" />
                </va-button>
                <va-button preset="plain" size="small" round @click="logout">
                  <va-icon name="logout" />
                </va-button>
              </div>
            </div>

            <!-- Контент страниц -->
            <div class="page-content">
              <router-view />
            </div>
          </div>
        </template>
      </va-layout>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { account } from '@/appwrite/client'

const router = useRouter()
const sidebarVisible = ref(true)
const sidebarMinimized = ref(false)

const navItems = [
  { name: 'dashboard', title: 'Дашборд', icon: 'dashboard', to: '/dashboard' },
  { name: 'customers', title: 'Клиенты', icon: 'people', to: '/customers' },
  { name: 'analytics', title: 'Аналитика', icon: 'analytics', to: '/analytics' },
  { name: 'invoices', title: 'Подписки', icon: 'subscriptions', to: '/invoices' },
  { name: 'payments', title: 'Настройки', icon: 'settings', to: '/payments' },
]

async function logout() {
  try { 
    await account.deleteSession('current') 
  } catch {}
  router.replace({ name: 'login' })
}
</script>

<style>
/* Глобальные стили */
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

/* Сайдбар */
.app-sidebar {
  border-right: 1px solid var(--va-background-element);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid var(--va-background-element);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--va-primary), #ff6b6b);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  flex: 1;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--va-text-primary);
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  margin-bottom: 4px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--va-background-element);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-toggle {
  display: flex;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

/* Основной контент */
.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--va-background-primary);
}

.topbar {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--va-background-element);
  background-color: var(--va-background-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  min-height: 64px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  background-color: var(--va-background-primary);
}

/* Активные состояния навигации */
:deep(.va-sidebar-item--active) {
  background: linear-gradient(135deg, var(--va-primary), #ff6b6b) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(var(--va-primary-rgb), 0.3);
}

:deep(.va-sidebar-item--active .va-icon) {
  color: white !important;
}

:deep(.va-sidebar-item--active .va-sidebar-item-title) {
  color: white !important;
  font-weight: 600;
}

/* Скроллбар */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--va-background-element);
  border-radius: 2px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--va-text-secondary);
}
</style>