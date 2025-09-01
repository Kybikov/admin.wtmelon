<script setup>
import Shell from '@/layout/Shell.vue'
</script>

<template>
  <Shell />
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
