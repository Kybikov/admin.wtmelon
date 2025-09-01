<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Продукты и услуги</h1>
      <p class="page-subtitle">Управление каталогом продуктов и подписок</p>
    </div>

    <div class="content-grid">
      <va-card class="feature-card">
        <div class="feature-icon">
          <va-icon name="inventory" size="32px" color="primary" />
        </div>
        <h3>Каталог продуктов</h3>
        <p>Управление всеми продуктами и услугами компании</p>
        <va-button size="small" preset="secondary">Скоро</va-button>
      </va-card>

      <va-card class="feature-card">
        <div class="feature-icon">
          <va-icon name="subscriptions" size="32px" color="info" />
        </div>
        <h3>Подписки</h3>
        <p>Настройка тарифных планов и подписок</p>
        <va-button size="small" preset="secondary">Скоро</va-button>
      </va-card>

      <va-card class="feature-card">
        <div class="feature-icon">
          <va-icon name="local_offer" size="32px" color="success" />
        </div>
        <h3>Промокоды</h3>
        <p>Создание и управление промокодами</p>
        <va-button size="small" preset="secondary">Скоро</va-button>
      </va-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  try {
    await account.get()
  } catch {
    router.replace('/login')
  }
})
</script>

<style scoped>
.page-container {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0;
  opacity: 0.8;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  text-align: center;
  transition: all 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.feature-icon {
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
}

.feature-card p {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin: 0 0 16px 0;
}
</style>
</template>