<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Перенаправляем на дашборд если находимся на корневой странице
  if (router.currentRoute.value.path === '/') {
    router.replace('/dashboard')
  }
})
</script>

<template>
  <router-view />
</template>

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
</style>
