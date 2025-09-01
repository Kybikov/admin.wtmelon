<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Заказы</h1>
      <p class="page-subtitle">Управление заказами и транзакциями</p>
    </div>

    <div class="stats-grid">
      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon blue">
            <va-icon name="shopping_cart" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">1,247</div>
            <div class="stat-label">Всего заказов</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon green">
            <va-icon name="check_circle" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">1,156</div>
            <div class="stat-label">Выполнено</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orange">
            <va-icon name="pending" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">67</div>
            <div class="stat-label">В обработке</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon red">
            <va-icon name="cancel" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">24</div>
            <div class="stat-label">Отменено</div>
          </div>
        </div>
      </va-card>
    </div>

    <va-card class="orders-table-card">
      <div class="card-header">
        <h3>Последние заказы</h3>
        <va-button size="small">Все заказы</va-button>
      </div>
      <va-alert color="info" class="mt-3">
        Таблица заказов будет добавлена в следующих обновлениях
      </va-alert>
    </va-card>
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--va-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.orders-table-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}
</style>
</template>