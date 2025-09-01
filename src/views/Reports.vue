<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Отчеты</h1>
      <p class="page-subtitle">Аналитика и отчетность по всем направлениям</p>
    </div>

    <div class="reports-grid">
      <va-card class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <va-icon name="bar_chart" size="28px" color="primary" />
          </div>
          <h3>Финансовые отчеты</h3>
        </div>
        <p>Выручка, прибыль, расходы и финансовые показатели</p>
        <div class="report-actions">
          <va-button size="small" preset="secondary">Скоро</va-button>
        </div>
      </va-card>

      <va-card class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <va-icon name="people_alt" size="28px" color="info" />
          </div>
          <h3>Клиентская база</h3>
        </div>
        <p>Анализ клиентов, сегментация и поведенческие метрики</p>
        <div class="report-actions">
          <va-button size="small" preset="secondary">Скоро</va-button>
        </div>
      </va-card>

      <va-card class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <va-icon name="trending_up" size="28px" color="success" />
          </div>
          <h3>Продажи</h3>
        </div>
        <p>Отчеты по продажам, конверсии и эффективности</p>
        <div class="report-actions">
          <va-button size="small" preset="secondary">Скоро</va-button>
        </div>
      </va-card>

      <va-card class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <va-icon name="inventory_2" size="28px" color="warning" />
          </div>
          <h3>Продукты</h3>
        </div>
        <p>Анализ популярности продуктов и подписок</p>
        <div class="report-actions">
          <va-button size="small" preset="secondary">Скоро</va-button>
        </div>
      </va-card>
    </div>

    <va-card class="quick-stats-card">
      <h3 class="mb-3">Быстрая статистика</h3>
      <div class="quick-stats-grid">
        <div class="quick-stat">
          <div class="quick-stat-value">₴2,847,250</div>
          <div class="quick-stat-label">Выручка за месяц</div>
        </div>
        <div class="quick-stat">
          <div class="quick-stat-value">3,247</div>
          <div class="quick-stat-label">Активных клиентов</div>
        </div>
        <div class="quick-stat">
          <div class="quick-stat-value">87.3%</div>
          <div class="quick-stat-label">Удержание клиентов</div>
        </div>
        <div class="quick-stat">
          <div class="quick-stat-value">4.2</div>
          <div class="quick-stat-label">Средняя оценка</div>
        </div>
      </div>
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

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.report-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  transition: all 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 51, 102, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.report-card p {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.report-actions {
  display: flex;
  gap: 8px;
}

.quick-stats-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.quick-stats-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.quick-stat {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.quick-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.quick-stat-label {
  font-size: 12px;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>