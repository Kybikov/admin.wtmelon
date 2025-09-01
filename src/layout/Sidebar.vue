<template>
  <va-sidebar
      v-model="collapsed"
      :minimized="collapsed"
      :width="240"
      :minimizedWidth="64"
      color="background-element"
      class="border-r border-[var(--va-background-element)]"
  >
    <div class="px-3 py-3 text-sm opacity-70">Навигация</div>

    <!-- плоские пункты -->
    <template v-for="item in flatItems" :key="item.title">
      <va-sidebar-item :to="item.to" :active="isActive(item)">
        <template #icon><va-icon :name="item.icon" /></template>
        <va-sidebar-item-content>
          <va-sidebar-item-title>{{ item.title }}</va-sidebar-item-title>
        </va-sidebar-item-content>
      </va-sidebar-item>
    </template>

    <!-- группы (если используешь children) -->
    <template v-for="group in groups" :key="group.title">
      <va-sidebar-item>
        <template #icon><va-icon :name="group.icon" /></template>
        <va-sidebar-item-content>
          <va-sidebar-item-title>{{ group.title }}</va-sidebar-item-title>
        </va-sidebar-item-content>
      </va-sidebar-item>
      <div class="ml-2">
        <va-sidebar-item v-for="c in group.children" :key="c.title" :to="c.to" :active="isActive(c)">
          <template #icon><va-icon :name="c.icon" /></template>
          <va-sidebar-item-content>
            <va-sidebar-item-title>{{ c.title }}</va-sidebar-item-title>
          </va-sidebar-item-content>
        </va-sidebar-item>
      </div>
    </template>

    <va-spacer />
    <div class="px-3 py-3 text-xs opacity-60">v0.1</div>
  </va-sidebar>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { nav } from '@/nav/nav.config'

const route = useRoute()
const collapsed = ref(localStorage.getItem('sidebarCollapsed') === '1')

watch(collapsed, v => localStorage.setItem('sidebarCollapsed', v ? '1' : '0'))

const groups  = computed(() => nav.filter(i => i.children))
const flat    = computed(() => nav.filter(i => !i.children))
const flatItems = computed(() => flat.value)

function isActive(item) {
  return item.to?.name && route.name === item.to.name
}
</script>
