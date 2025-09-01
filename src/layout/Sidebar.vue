<template>
  <va-sidebar
    v-model="collapsed"
    :minimized="collapsed"
    :width="280"
    :minimized-width="72"
    color="background-secondary"
    class="modern-sidebar"
  >
    <!-- Заголовок -->
    <div class="sidebar-header">
      <div v-if="!collapsed" class="header-content">
        <va-icon name="admin_panel_settings" size="24px" color="primary" />
        <span class="header-title">WT Admin</span>
      </div>
      <va-icon v-else name="admin_panel_settings" size="24px" color="primary" />
    </div>

    <!-- Навигационные элементы -->
    <div class="sidebar-content">
      <div v-if="!collapsed" class="section-label">Навигация</div>
      
      <div class="nav-items">
        <template v-for="item in flatItems" :key="item.title">
          <va-sidebar-item 
            :to="item.to" 
            :active="isActive(item)"
            class="nav-item"
          >
            <template #icon>
              <va-icon :name="item.icon" size="20px" />
            </template>
            <va-sidebar-item-content>
              <va-sidebar-item-title class="nav-title">
                {{ item.title }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
        </template>

        <!-- Группы с детьми -->
        <template v-for="group in groups" :key="group.title">
          <va-sidebar-item class="nav-group">
            <template #icon>
              <va-icon :name="group.icon" size="20px" />
            </template>
            <va-sidebar-item-content>
              <va-sidebar-item-title class="nav-title">
                {{ group.title }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
          
          <div class="nav-children">
            <va-sidebar-item 
              v-for="child in group.children" 
              :key="child.title" 
              :to="child.to" 
              :active="isActive(child)"
              class="nav-child-item"
            >
              <template #icon>
                <va-icon :name="child.icon" size="18px" />
              </template>
              <va-sidebar-item-content>
                <va-sidebar-item-title class="nav-title">
                  {{ child.title }}
                </va-sidebar-item-title>
              </va-sidebar-item-content>
            </va-sidebar-item>
          </div>
        </template>
      </div>
    </div>

    <!-- Футер -->
    <div class="sidebar-footer">
      <div v-if="!collapsed" class="footer-content">
        <va-chip size="small" color="info" outline>
          v0.1.0
        </va-chip>
      </div>
      <va-icon v-else name="info" size="16px" color="info" />
    </div>
  </va-sidebar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { nav } from '@/nav/nav.config'

const route = useRoute()
const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true')

// Экспортируем collapsed для доступа из родительского компонента
defineExpose({ collapsed })

watch(collapsed, (value) => {
  localStorage.setItem('sidebarCollapsed', value.toString())
})

const groups = computed(() => nav.filter(item => item.children && item.children.length > 0))
const flatItems = computed(() => nav.filter(item => !item.children))

function isActive(item) {
  return item.to?.name && route.name === item.to.name
}
</script>

<style scoped>
.modern-sidebar {
  border-right: 1px solid var(--va-background-element);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid var(--va-background-element);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.sidebar-content {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.section-label {
  padding: 8px 20px 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.nav-items {
  padding: 0 8px;
}

.nav-item {
  margin-bottom: 4px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background-color: var(--va-background-element);
  transform: translateX(2px);
}

.nav-group {
  margin: 16px 0 8px;
  border-radius: 12px;
  opacity: 0.8;
}

.nav-children {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 2px solid var(--va-background-element);
}

.nav-child-item {
  margin-bottom: 2px;
  border-radius: 8px;
  font-size: 14px;
}

.nav-child-item:hover {
  background-color: var(--va-background-element);
}

.nav-title {
  font-weight: 500;
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--va-background-element);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Активные состояния */
:deep(.va-sidebar-item--active) {
  background-color: var(--va-primary) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(var(--va-primary-rgb), 0.3);
}

:deep(.va-sidebar-item--active .va-icon) {
  color: white !important;
}

:deep(.va-sidebar-item--active .nav-title) {
  color: white !important;
  font-weight: 600;
}

/* Анимации */
.nav-item,
.nav-child-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Скроллбар */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--va-background-element);
  border-radius: 2px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--va-text-secondary);
}
</style>