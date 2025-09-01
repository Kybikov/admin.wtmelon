<template>
  <div class="dashboard">
    <!-- Заголовок -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Дашборд</h1>
      <p class="dashboard-subtitle">
        Добро пожаловать в WaterMelon CRM! Обзор ключевых метрик и активности системы.
      </p>
    </div>

    <!-- Метрики -->
    <div class="metrics-grid">
      <va-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon blue">
            <va-icon name="people" size="24px" />
          </div>
          <div class="metric-info">
            <div class="metric-label">ВСЕГО КЛИЕНТОВ</div>
            <div class="metric-value">3 247</div>
            <div class="metric-change positive">+14.2% ЗА МЕСЯЦ</div>
          </div>
        </div>
      </va-card>

      <va-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon red">
            <va-icon name="trending_up" size="24px" />
          </div>
          <div class="metric-info">
            <div class="metric-label">АКТИВНЫЕ ПОДПИСКИ</div>
            <div class="metric-value">2 856</div>
            <div class="metric-change positive">+18.7% ЗА МЕСЯЦ</div>
          </div>
        </div>
      </va-card>

      <va-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon green">
            <va-icon name="attach_money" size="24px" />
          </div>
          <div class="metric-info">
            <div class="metric-label">МЕСЯЧНАЯ ВЫРУЧКА</div>
            <div class="metric-value">1 847 250,00 ₴</div>
            <div class="metric-change positive">+22.3% ЗА МЕСЯЦ</div>
          </div>
        </div>
      </va-card>

      <va-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon orange">
            <va-icon name="percent" size="24px" />
          </div>
          <div class="metric-info">
            <div class="metric-label">CHURN RATE</div>
            <div class="metric-value">2.8%</div>
            <div class="metric-change negative">-1.2% ЗА МЕСЯЦ</div>
          </div>
        </div>
      </va-card>
    </div>

    <!-- Нижние секции -->
    <div class="dashboard-sections">
      <!-- Последняя активность -->
      <va-card class="activity-card">
        <div class="card-header">
          <h3>Последняя активность</h3>
          <va-button preset="plain" size="small">Показать все</va-button>
        </div>
        
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon success">
              <va-icon name="check_circle" size="16px" />
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>Алексей Иванов</strong> оформил подписку <strong>Spotify Premium</strong>
              </div>
              <div class="activity-time">3 мин назад</div>
            </div>
            <div class="activity-amount">499,00 ₴</div>
          </div>

          <div class="activity-item">
            <div class="activity-icon info">
              <va-icon name="info" size="16px" />
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>Мария Петрова</strong> продлил подписку <strong>Apple Music</strong>
              </div>
              <div class="activity-time">8 мин назад</div>
            </div>
            <div class="activity-amount">499,00 ₴</div>
          </div>

          <div class="activity-item">
            <div class="activity-icon danger">
              <va-icon name="cancel" size="16px" />
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>Дмитрий Сидоров</strong> отменил подписку <strong>Deezer Premium</strong>
              </div>
              <div class="activity-time">15 мин назад</div>
            </div>
            <div class="activity-amount">-</div>
          </div>

          <div class="activity-item">
            <div class="activity-icon warning">
              <va-icon name="warning" size="16px" />
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>Ольга Козлова</strong> не удалось списать оплату за <strong>YouTube Premium</strong>
              </div>
              <div class="activity-time">45 мин назад</div>
            </div>
            <div class="activity-amount">399,00 ₴</div>
          </div>
        </div>
      </va-card>

      <!-- Топ сервисы -->
      <va-card class="services-card">
        <div class="card-header">
          <h3>Топ сервисы</h3>
          <va-button preset="plain" size="small">Подробнее</va-button>
        </div>
        
        <div class="services-list">
          <div class="service-item">
            <div class="service-info">
              <div class="service-indicator green"></div>
              <div class="service-details">
                <div class="service-name">Spotify Premium</div>
                <div class="service-users">1247 пользователей</div>
              </div>
            </div>
            <div class="service-revenue">
              <div class="service-amount">622 300,00 ₴</div>
              <div class="service-change positive">+15.2%</div>
            </div>
          </div>

          <div class="service-item">
            <div class="service-info">
              <div class="service-indicator red"></div>
              <div class="service-details">
                <div class="service-name">Apple Music</div>
                <div class="service-users">892 пользователей</div>
              </div>
            </div>
            <div class="service-revenue">
              <div class="service-amount">445 600,00 ₴</div>
              <div class="service-change positive">+12.8%</div>
            </div>
          </div>

          <div class="service-item">
            <div class="service-info">
              <div class="service-indicator red"></div>
              <div class="service-details">
                <div class="service-name">YouTube Premium</div>
                <div class="service-users">654 пользователей</div>
              </div>
            </div>
            <div class="service-revenue">
              <div class="service-amount">261 600,00 ₴</div>
              <div class="service-change negative">-8.7%</div>
            </div>
          </div>

          <div class="service-item">
            <div class="service-info">
              <div class="service-indicator orange"></div>
              <div class="service-details">
                <div class="service-name">Deezer Premium</div>
                <div class="service-users">387 пользователей</div>
              </div>
            </div>
            <div class="service-revenue">
              <div class="service-amount">193 500,00 ₴</div>
              <div class="service-change positive">+3.4%</div>
            </div>
          </div>
        </div>
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
.dashboard {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
}

.dashboard-subtitle {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0;
  opacity: 0.8;
}

/* Метрики */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.metric-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.metric-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
.metric-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.metric-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 8px;
  line-height: 1.2;
}

.metric-change {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-change.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.metric-change.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Нижние секции */
.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.activity-card,
.services-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

/* Активность */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.success { background: #10b981; }
.activity-icon.info { background: #3b82f6; }
.activity-icon.danger { background: #ef4444; }
.activity-icon.warning { background: #f59e0b; }

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.activity-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

/* Сервисы */
.services-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.service-indicator.green { background: #10b981; }
.service-indicator.red { background: #ef4444; }
.service-indicator.orange { background: #f59e0b; }

.service-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 2px;
}

.service-users {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.service-revenue {
  text-align: right;
}

.service-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 2px;
}

.service-change {
  font-size: 12px;
  font-weight: 600;
}

.service-change.positive { color: #10b981; }
.service-change.negative { color: #ef4444; }

/* Адаптивность */
@media (max-width: 1024px) {
  .dashboard-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>