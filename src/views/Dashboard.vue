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
            <div class="metric-value">{{ customersCount || 0 }}</div>
            <div class="metric-change positive">{{ customersCount ? '+' + Math.round(customersCount * 0.142) : '0' }}% ЗА МЕСЯЦ</div>
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
            <div class="metric-value">{{ subscriptionsStats?.active || 0 }}</div>
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
            <va-icon name="schedule" size="24px" />
          </div>
          <div class="metric-info">
            <div class="stat-value">{{ expiringSubscriptions?.length || 0 }}</div>
            <div class="metric-value">{{ subscriptionsStats?.expiring || 0 }}</div>
            <div class="metric-change negative">Требуют внимания</div>
          </div>
        </div>
      </va-card>

      <va-card class="metric-card">
        <div class="metric-content">
          <div class="metric-icon red">
            <va-icon name="error" size="24px" />
          </div>
          <div class="metric-info">
            <div class="metric-label">ПРОСРОЧЕНО</div>
            <div class="stat-value">{{ overdueSubscriptions?.length || 0 }}</div>
            <div class="metric-change negative">Критично</div>
          </div>
        </div>
      </va-card>
    </div>

    <!-- Нижние секции -->
    <div class="dashboard-sections">
      <!-- Требуют внимания -->
      <va-card class="attention-card">
        <div class="card-header">
          <h3>Требуют внимания</h3>
          <va-button preset="plain" size="small" @click="$router.push('/subscriptions')">
            Все подписки
          </va-button>
        </div>
        
        <div v-if="expiringLoading || overdueLoading" class="loading-attention">
          <va-progress-circle indeterminate size="small" />
          <span>Загрузка...</span>
        </div>
        <div v-else-if="attentionSubscriptions.length" class="attention-list">
          <div 
            v-for="subscription in attentionSubscriptions" 
            :key="subscription.$id"
            class="attention-item"
          >
            <div class="attention-icon" :class="getStatusClass(subscription.state)">
              <va-icon :name="getStatusIcon(subscription.state)" size="16px" />
            </div>
            <div class="attention-content">
              <div class="attention-text">
                <strong>{{ getCustomerName(subscription.customers_id) }}</strong> - 
                <strong>{{ getServiceName(subscription.services_id) }}</strong>
              </div>
              <div class="attention-time">
                {{ subscription.state === 'overdue' ? 'Просрочено' : 'Истекает' }}: 
                {{ formatDate(subscription.end_date) }}
              </div>
            </div>
            <va-chip 
              :color="getStatusColor(subscription.state)" 
              size="small"
            >
              {{ getStatusText(subscription.state) }}
            </va-chip>
          </div>
        </div>
        <div v-else class="no-attention">
          <va-icon name="check_circle" size="48px" color="success" />
          <p>Все подписки в порядке!</p>
        </div>
      </va-card>

      <!-- Топ сервисы -->
      <va-card class="services-card">
        <div class="card-header">
          <h3>Топ сервисы</h3>
          <va-button preset="plain" size="small" @click="$router.push('/subscriptions')">
            Подробнее
          </va-button>
        </div>
        
        <div v-if="servicesLoading" class="loading-services">
          <va-progress-circle indeterminate size="small" />
          <span>Загрузка сервисов...</span>
        </div>
        <div v-else-if="services?.length" class="services-list">
          <div 
            v-for="service in services.slice(0, 4)" 
            :key="service.$id"
            class="service-item"
          >
            <div class="service-info">
              <div class="service-indicator green"></div>
              <div class="service-details">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-users">{{ getServiceSubscriptionsCount(service.$id) }} подписок</div>
              </div>
            </div>
            <div class="service-revenue">
              <div class="service-amount">{{ getServiceRevenue(service.$id) }} ₴</div>
              <div class="service-change positive">+15.2%</div>
            </div>
          </div>
        </div>
        <div v-else class="no-services">
          <p>Сервисы не найдены</p>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'
import { useCustomers } from '@/composables/useCustomersApi'
import { useServices } from '@/composables/useServicesApi'
import { 
  useSubscriptionsStats, 
  useExpiringSubscriptions, 
  useSubscriptionsByStatus,
  useSubscriptions 
} from '@/composables/useSubscriptionsApi'

const router = useRouter()

// Данные
const { data: customers } = useCustomers()
const { data: services, isLoading: servicesLoading } = useServices()
const { data: subscriptionsStats } = useSubscriptionsStats()
const { data: expiringSubscriptions, isLoading: expiringLoading } = useExpiringSubscriptions(3)
const { data: overdueSubscriptions, isLoading: overdueLoading } = useSubscriptionsByStatus('overdue')
const { data: allSubscriptions } = useSubscriptions()

// Вычисляемые свойства
const customersCount = computed(() => customers.value?.length || 0)

const attentionSubscriptions = computed(() => {
  const expiring = expiringSubscriptions.value || []
  const overdue = overdueSubscriptions.value || []
  return [...overdue, ...expiring].slice(0, 5)
})

// Методы
function getCustomerName(customerId) {
  const customer = customers.value?.find(c => c.$id === customerId)
  return customer?.name || 'Неизвестный клиент'
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getServiceSubscriptionsCount(serviceId) {
  if (!allSubscriptions.value) return 0
  return allSubscriptions.value.filter(sub => sub.services_id === serviceId).length
}

function getServiceRevenue(serviceId) {
  if (!allSubscriptions.value) return '0'
  const revenue = allSubscriptions.value
    .filter(sub => sub.services_id === serviceId)
    .reduce((sum, sub) => sum + (sub.sell_price || 0), 0)
  return revenue.toLocaleString('ru-RU')
}

function getManagerName(managerId) {
  if (!managerId) return 'Не указан'
  // TODO: Интегрировать с Appwrite Teams API для получения реального имени менеджера
  // const teams = new Teams(client);
  // const managers = await teams.listMemberships('manager_team_id');
  // const manager = managers.memberships.find(m => m.userId === managerId);
  // return manager ? manager.userName : `Менеджер ${managerId.slice(-6)}`;
  return `Менеджер ${managerId.slice(-6)}`
}

function getStatusColor(state) {
  const colors = {
    'active': 'success',
    'expiring_soon': 'warning',
    'overdue': 'danger', 
    'awaiting_payment': 'info',
    'cancelled': 'secondary',
    'gift': 'warning'
  }
  return colors[state] || 'secondary'
}

function getStatusText(state) {
  const texts = {
    'active': 'Активна',
    'expiring_soon': 'Истекает',
    'overdue': 'Просрочена',
    'awaiting_payment': 'Ожидает оплаты',
    'cancelled': 'Отменена',
    'gift': 'Подарочная'
  }
  return texts[state] || state
}

function getStatusClass(state) {
  const classes = {
    'overdue': 'danger',
    'expiring_soon': 'warning'
  }
  return classes[state] || 'info'
}

function getStatusIcon(state) {
  const icons = {
    'overdue': 'error',
    'expiring_soon': 'schedule'
  }
  return icons[state] || 'info'
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

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

.attention-card,
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

/* Внимание */
.loading-attention,
.loading-services {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  justify-content: center;
}

.attention-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.attention-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.attention-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.attention-icon.success { background: #10b981; }
.attention-icon.info { background: #3b82f6; }
.attention-icon.danger { background: #ef4444; }
.attention-icon.warning { background: #f59e0b; }

.attention-content {
  flex: 1;
}

.attention-text {
  font-size: 14px;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.attention-time {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.no-attention {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
}

.no-attention p {
  margin: 12px 0 0 0;
  color: var(--va-text-secondary);
}

.no-services {
  text-align: center;
  padding: 20px;
  color: var(--va-text-secondary);
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