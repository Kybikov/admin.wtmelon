<template>
  <va-config-provider :colors-config="{ presets: { dark: true } }">
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
                <va-popover 
                  v-model="showProfileMenu" 
                  placement="top-start"
                  :offset="[0, 8]"
                  class="profile-popover"
                >
                  <template #anchor>
                    <div class="profile-trigger" @click="showProfileMenu = !showProfileMenu">
                      <va-avatar size="32px" color="primary">
                        A
                      </va-avatar>
                      <div v-if="!sidebarMinimized" class="user-info">
                        <div class="user-name">Админ WaterMelon</div>
                        <div class="user-role">Admin</div>
                      </div>
                      <va-icon v-if="!sidebarMinimized" name="expand_less" size="16px" />
                    </div>
                  </template>
                  
                  <va-card class="profile-menu-card">
                    <div class="profile-menu-header">
                      <va-avatar size="40px" color="primary">
                        A
                      </va-avatar>
                      <div class="profile-info">
                        <div class="profile-name">Админ WaterMelon</div>
                        <div class="profile-email">admin@watermelon.com</div>
                      </div>
                    </div>
                    
                    <div class="profile-menu-items">
                      <div class="profile-menu-item" @click="goToProfile">
                        <va-icon name="person" size="18px" />
                        <span>Настройки профиля</span>
                      </div>
                      <div class="profile-menu-item" @click="goToStats">
                        <va-icon name="analytics" size="18px" />
                        <span>Моя статистика</span>
                      </div>
                      <div class="profile-menu-divider"></div>
                      <div class="profile-menu-item profile-menu-item--danger" @click="logout">
                        <va-icon name="logout" size="18px" />
                        <span>Выйти</span>
                      </div>
                    </div>
                  </va-card>
                </va-popover>
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
                <va-button preset="plain" size="small" round @click="showNotifications = !showNotifications">
                  <va-icon name="notifications" />
                  <va-badge v-if="unreadNotifications > 0" :text="unreadNotifications" color="danger" />
                </va-button>
              </div>
              
              <!-- Панель уведомлений -->
              <va-popover 
                v-model="showNotifications" 
                placement="bottom-end"
                :offset="[0, 8]"
                class="notifications-popover"
              >
                <template #anchor>
                  <div></div>
                </template>
                
                <va-card class="notifications-card">
                  <div class="notifications-header">
                    <h4>Уведомления</h4>
                    <va-button preset="plain" size="small" @click="markAllAsRead">
                      Отметить все
                    </va-button>
                  </div>
                  
                  <div class="notifications-list">
                    <div 
                      v-for="notification in notifications" 
                      :key="notification.id"
                      class="notification-item"
                      :class="{ 'notification-item--unread': !notification.read }"
                    >
                      <div class="notification-icon" :class="notification.type">
                        <va-icon :name="getNotificationIcon(notification.type)" size="16px" />
                      </div>
                      <div class="notification-content">
                        <div class="notification-title">{{ notification.title }}</div>
                        <div class="notification-text">{{ notification.text }}</div>
                        <div class="notification-time">{{ notification.time }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="notifications-footer">
                    <va-button preset="plain" size="small">
                      Показать все
                    </va-button>
                  </div>
                </va-card>
              </va-popover>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useColors } from 'vuestic-ui'
import { account } from '@/appwrite/client'

const router = useRouter()
const sidebarVisible = ref(true)
const sidebarMinimized = ref(false)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const { applyPreset, currentPresetName } = useColors()

// Уведомления
const notifications = ref([
  {
    id: 1,
    type: 'success',
    title: 'Новый клиент',
    text: 'Алексей Иванов зарегистрировался в системе',
    time: '2 мин назад',
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: 'Обновление системы',
    text: 'Доступна новая версия CRM v2.0.1',
    time: '1 час назад',
    read: false
  },
  {
    id: 3,
    type: 'warning',
    title: 'Проблема с платежом',
    text: 'Не удалось списать оплату с карты клиента',
    time: '3 часа назад',
    read: true
  }
])

const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.read).length
)

function getNotificationIcon(type) {
  const icons = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
    error: 'error'
  }
  return icons[type] || 'notifications'
}

function markAllAsRead() {
  notifications.value.forEach(n => n.read = true)
  showNotifications.value = false
}

function goToProfile() {
  showProfileMenu.value = false
  router.push({ name: 'profile' })
}

function goToStats() {
  showProfileMenu.value = false
  router.push({ name: 'stats' })
}

function toggleTheme() {
  const newTheme = currentPresetName.value === 'dark' ? 'light' : 'dark'
  applyPreset(newTheme)
}

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
  showProfileMenu.value = false
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
  gap: 8px;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.profile-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
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

/* Меню профиля */
.profile-menu-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 12px !important;
  padding: 0 !important;
  min-width: 280px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

.profile-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--va-background-element);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 2px;
}

.profile-email {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.profile-menu-items {
  padding: 8px 0;
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: var(--va-text-primary);
}

.profile-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.profile-menu-item--danger {
  color: var(--va-danger);
}

.profile-menu-item--danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.profile-menu-divider {
  height: 1px;
  background: var(--va-background-element);
  margin: 8px 0;
}

/* Уведомления */
.notifications-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 12px !important;
  padding: 0 !important;
  min-width: 360px;
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--va-background-element);
}

.notifications-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--va-background-element);
  transition: all 0.2s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.notification-item--unread {
  background-color: rgba(255, 51, 102, 0.05);
}

.notification-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.notification-icon.success { background: #10b981; }
.notification-icon.info { background: #3b82f6; }
.notification-icon.warning { background: #f59e0b; }
.notification-icon.error { background: #ef4444; }

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: var(--va-text-secondary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.notifications-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--va-background-element);
  text-align: center;
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
</style>