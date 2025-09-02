<template>
  <va-config-provider :colors-config="{ presets: { dark: true } }">
    <!-- Показываем загрузку пока проверяем авторизацию -->
    <div v-if="authLoading" class="auth-loading">
      <va-progress-circle indeterminate size="large" />
      <p>Проверка авторизации...</p>
    </div>
    
    <!-- Страница логина -->
    <template v-else-if="!isAuthenticated">
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
                  <span style="font-size: 28px;">🍉</span>
                </div>
                <div v-if="!sidebarMinimized" class="logo-text">
                  <div class="logo-title">WaterMelon</div>
                  <div class="logo-subtitle">CRM v2.0</div>
                </div>
              </div>
            </div>

            <!-- Навигация -->
            <div class="sidebar-nav">
              <div 
                v-for="item in navItems" 
                :key="item.name"
                class="nav-item"
                :class="{ 'nav-item--active': $route.name === item.name }"
                @click="$router.push({ name: item.name })"
              >
                <div class="nav-item-content">
                  <span class="material-icons nav-icon">{{ item.icon }}</span>
                  <span v-if="!sidebarMinimized" class="nav-text">{{ item.title }}</span>
                </div>
              </div>
            </div>

            <!-- Футер сайдбара -->
            <div class="sidebar-footer">
              <div class="theme-toggle">
                <va-button preset="plain" size="small" round @click="toggleTheme">
                  <va-icon name="brightness_6" size="16px" />
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
  </va-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useColors } from 'vuestic-ui'
import { account } from '@/appwrite/client'

const router = useRouter()
const sidebarVisible = ref(true)
const sidebarMinimized = ref(false)
const authLoading = ref(true)
const isAuthenticated = ref(false)
const { applyPreset, currentPresetName } = useColors()

function toggleTheme() {
  const newTheme = currentPresetName.value === 'dark' ? 'light' : 'dark'
  applyPreset(newTheme)
}

// Проверяем авторизацию при загрузке
onMounted(async () => {
  try {
    await account.get()
    isAuthenticated.value = true
    // Если находимся на странице логина, перенаправляем на дашборд
    if (router.currentRoute.value.name === 'login') {
      router.replace({ name: 'dashboard' })
    }
  } catch {
    isAuthenticated.value = false
    router.replace({ name: 'login' })
  } finally {
    authLoading.value = false
  }
})

const navItems = [
  { name: 'dashboard', title: 'Дашборд', icon: 'dashboard' },
  { name: 'customers', title: 'Клиенты', icon: 'people' },
  { name: 'products', title: 'Продукты', icon: 'inventory' },
  { name: 'orders', title: 'Заказы', icon: 'shopping_cart' },
  { name: 'analytics', title: 'Аналитика', icon: 'analytics' },
  { name: 'reports', title: 'Отчеты', icon: 'assessment' },
  { name: 'invoices', title: 'Счета', icon: 'receipt' },
  { name: 'payments', title: 'Платежи', icon: 'payment' },
  { name: 'settings', title: 'Настройки', icon: 'settings' },
]

async function logout() {
  try { 
    await account.deleteSession('current')
    isAuthenticated.value = false
    router.replace({ name: 'login' })
  } catch {}
}

// Следим за изменениями роута для проверки авторизации
router.beforeEach(async (to, from, next) => {
  // Если загружаемся, ждем проверки авторизации
  if (authLoading.value) {
    // Ждем завершения проверки авторизации
    const checkAuth = () => {
      if (!authLoading.value) {
        if (to.name === 'login') {
          next()
        } else if (isAuthenticated.value) {
          next()
        } else {
          next({ name: 'login' })
        }
      } else {
        setTimeout(checkAuth, 50)
      }
    }
    checkAuth()
    return
  }
  
  // Если идем на логин и уже авторизованы
  if (to.name === 'login' && isAuthenticated.value) {
    next({ name: 'dashboard' })
    return
  }
  
  // Если идем на защищенную страницу без авторизации
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'login' })
    return
  }
  
  next()
})
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
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  margin-bottom: 4px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

.nav-item--active {
  background: linear-gradient(135deg, var(--va-primary), #e91e63) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(255, 51, 102, 0.3);
}

.nav-item-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.nav-icon {
  font-size: 20px !important;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
  flex: 1;
  min-width: 0;
}

/* Когда сайдбар свернут */
.va-sidebar--minimized .nav-item-content {
  justify-content: center;
  padding: 12px;
}

.va-sidebar--minimized .nav-text {
  display: none;
}

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
  overflow: hidden;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
}

/* Обеспечиваем правильное отображение иконок */
:deep(.va-sidebar-item) {
  display: flex !important;
  align-items: center !important;
  padding: 12px 16px !important;
}

:deep(.va-sidebar-item__icon) {
  margin-right: 12px !important;
  flex-shrink: 0 !important;
  width: 20px !important;
  height: 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.va-sidebar-item__content) {
  flex: 1 !important;
  min-width: 0 !important;
}

/* Когда сайдбар свернут, скрываем текст но оставляем иконки */
:deep(.va-sidebar--minimized .va-sidebar-item__content) {
  display: none !important;
}

:deep(.va-sidebar--minimized .va-sidebar-item__icon) {
  margin-right: 0 !important;
}

:deep(.va-sidebar--minimized .va-sidebar-item) {
  justify-content: center !important;
  padding: 12px !important;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid var(--va-background-element);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Адаптация футера для свернутого состояния */
:deep(.va-sidebar--minimized) .sidebar-footer {
  padding: 16px 8px;
}

:deep(.va-sidebar--minimized) .user-info {
  display: none;
}

:deep(.va-sidebar--minimized) .logo-text {
  display: none;
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

/* Загрузка авторизации */
.auth-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--va-background-primary);
  gap: 16px;
}
</style>