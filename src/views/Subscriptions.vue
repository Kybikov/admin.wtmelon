<template>
  <div class="subscriptions-page">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Подписки</h1>
        <p class="page-subtitle">Управление подписками клиентов</p>
      </div>
      <va-button @click="$router.push('/subscriptions/new')" size="large">
        <va-icon name="add" class="mr-1" />
        Новая подписка
      </va-button>
    </div>

    <!-- Фильтры -->
    <va-card class="filters-card">
      <div class="filters-content">
        <div class="filters-row">
          <va-input 
            v-model="searchQuery" 
            placeholder="Поиск по клиенту или сервису..."
            class="search-input"
          >
            <template #prependInner>
              <va-icon name="search" size="18px" />
            </template>
          </va-input>
          
          <va-select
            v-model="selectedService"
            label="Сервис"
            :options="serviceOptions"
            text-by="name"
            value-by="$id"
            clearable
            class="filter-select"
          />
        </div>

        <div class="status-filters">
          <span class="filter-label">Статус:</span>
          <va-checkbox 
            v-for="status in statusFilters" 
            :key="status.value"
            v-model="selectedStatuses"
            :array-value="status.value"
            :label="status.label"
            :color="status.color"
            class="status-checkbox"
          />
        </div>

        <div class="date-filters">
          <va-date-input
            v-model="dateFrom"
            label="Истекает с"
            class="date-input"
          />
          <va-date-input
            v-model="dateTo"
            label="Истекает до"
            class="date-input"
          />
        </div>
      </div>
    </va-card>

    <!-- Таблица подписок -->
    <va-card class="subscriptions-table-card">
      <va-data-table
        :items="filteredSubscriptions"
        :columns="columns"
        :loading="isLoading"
        striped
        hoverable
        :per-page="20"
        :current-page="currentPage"
        @update:current-page="currentPage = $event"
      >
        <template #cell(customer)="{ rowData }">
          <div class="customer-cell">
            <va-avatar 
              :fallback-text="getCustomerInitials(rowData.customers_id)"
              size="32px"
              color="primary"
            />
            <div class="customer-info">
              <div class="customer-name">{{ getCustomerName(rowData.customers_id) }}</div>
              <div class="customer-contact">{{ getCustomerContact(rowData.customers_id) }}</div>
            </div>
          </div>
        </template>

        <template #cell(service)="{ rowData }">
          <div class="service-cell">
            <span class="service-name">{{ getServiceName(rowData.services_id) }}</span>
            <span class="plan-name">{{ getPlanName(rowData.plans_id) }}</span>
          </div>
        </template>

        <template #cell(period)="{ rowData }">
          {{ rowData.period_months }} мес.
        </template>

        <template #cell(state)="{ rowData }">
          <va-chip 
            :color="getStatusColor(rowData.state)" 
            size="small"
          >
            {{ getStatusText(rowData.state) }}
          </va-chip>
        </template>

        <template #cell(end_date)="{ rowData }">
          <div class="date-cell">
            <span>{{ formatDate(rowData.end_date) }}</span>
            <span v-if="isExpiringSoon(rowData.end_date)" class="expiring-badge">
              Истекает!
            </span>
          </div>
        </template>

        <template #cell(sell_price)="{ rowData }">
          {{ formatCurrency(rowData.sell_price) }}
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="actions-cell">
            <va-button 
              preset="plain" 
              size="small" 
              @click="viewSubscription(rowData)"
            >
              <va-icon name="visibility" />
            </va-button>
            <va-button 
              preset="plain" 
              size="small" 
              @click="editSubscription(rowData)"
            >
              <va-icon name="edit" />
            </va-button>
            <va-button 
              preset="plain" 
              size="small" 
              color="success"
              @click="renewSubscription(rowData)"
              v-if="rowData.state === 'expiring_soon' || rowData.state === 'overdue'"
            >
              <va-icon name="refresh" />
            </va-button>
          </div>
        </template>
      </va-data-table>
    </va-card>

    <!-- Модальное окно просмотра подписки -->
    <va-modal 
      v-model="showViewModal" 
      :title="`Подписка: ${selectedSubscription?.customers_idx || ''}`"
      size="large"
      @close="closeViewModal"
    >
      <div v-if="selectedSubscription" class="subscription-view-content">
        <!-- Основная информация -->
        <div class="subscription-header">
          <div class="subscription-info">
            <h3>{{ getCustomerName(selectedSubscription.customers_id) }}</h3>
            <p>{{ getServiceName(selectedSubscription.services_id) }} - {{ getPlanName(selectedSubscription.plans_id) }}</p>
            <va-chip 
              :color="getStatusColor(selectedSubscription.state)" 
              size="small"
            >
              {{ getStatusText(selectedSubscription.state) }}
            </va-chip>
          </div>
        </div>

        <!-- Детали подписки -->
        <div class="subscription-details">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Период:</span>
              <span class="detail-value">{{ selectedSubscription.period_months }} месяцев</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Количество:</span>
              <span class="detail-value">{{ selectedSubscription.quantity || 1 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Начало:</span>
              <span class="detail-value">{{ formatDate(selectedSubscription.start_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Окончание:</span>
              <span class="detail-value">{{ formatDate(selectedSubscription.end_date) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Цена закупки:</span>
              <span class="detail-value">{{ formatCurrency(selectedSubscription.cost_price) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Цена продажи:</span>
              <span class="detail-value">{{ formatCurrency(selectedSubscription.sell_price) }}</span>
            </div>
          </div>
        </div>

        <!-- Комментарий -->
        <div v-if="selectedSubscription.comment" class="subscription-comment">
          <h4>Комментарий</h4>
          <p>{{ selectedSubscription.comment }}</p>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="showViewModal = false">
            Закрыть
          </va-button>
          <va-button @click="editSubscription(selectedSubscription)">
            Редактировать
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { account } from '@/appwrite/client'
import { useSubscriptions, useUpdateSubscription } from '@/composables/useSubscriptionsApi'
import { useCustomers } from '@/composables/useCustomersApi'
import { useServices } from '@/composables/useServicesApi'
import { usePlans } from '@/composables/useAppwriteCollections'

const router = useRouter()

// Проверка авторизации
onMounted(async () => {
  try {
    await account.get()
  } catch {
    router.replace('/login')
  }
})

// Данные
const { data: subscriptions, isLoading } = useSubscriptions()
const { data: customers } = useCustomers()
const { data: services } = useServices()
const { data: plans } = usePlans()
const { mutateAsync: updateSubscription } = useUpdateSubscription()

// Состояние фильтров
const searchQuery = ref('')
const selectedService = ref('')
const selectedStatuses = ref(['active', 'expiring_soon', 'overdue', 'awaiting_payment'])
const dateFrom = ref(null)
const dateTo = ref(null)
const currentPage = ref(1)

// Модальные окна
const showViewModal = ref(false)
const selectedSubscription = ref(null)

// Опции фильтров
const statusFilters = [
  { label: 'Активные', value: 'active', color: 'success' },
  { label: 'Истекающие', value: 'expiring_soon', color: 'warning' },
  { label: 'Просроченные', value: 'overdue', color: 'danger' },
  { label: 'Ожидают оплаты', value: 'awaiting_payment', color: 'info' }
]

const serviceOptions = computed(() => {
  return [
    { $id: '', name: 'Все сервисы' },
    ...(services.value || [])
  ]
})

// Колонки таблицы
const columns = [
  { key: 'customer', label: 'Клиент', sortable: true },
  { key: 'service', label: 'Сервис', sortable: true },
  { key: 'period', label: 'Период', sortable: true },
  { key: 'state', label: 'Статус', sortable: true },
  { key: 'end_date', label: 'Оплачено до', sortable: true },
  { key: 'sell_price', label: 'Цена', sortable: true },
  { key: 'actions', label: 'Действия', width: 120 }
]

// Фильтрованные подписки
const filteredSubscriptions = computed(() => {
  if (!subscriptions.value) return []
  
  let filtered = subscriptions.value
  
  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(subscription => {
      const customerName = getCustomerName(subscription.customers_id).toLowerCase()
      const serviceName = getServiceName(subscription.services_id).toLowerCase()
      return customerName.includes(query) || serviceName.includes(query)
    })
  }
  
  // Фильтр по сервису
  if (selectedService.value) {
    filtered = filtered.filter(subscription => subscription.services_id === selectedService.value)
  }
  
  // Фильтр по статусу
  if (selectedStatuses.value.length > 0) {
    filtered = filtered.filter(subscription => selectedStatuses.value.includes(subscription.state))
  }
  
  // Фильтр по дате
  if (dateFrom.value) {
    filtered = filtered.filter(subscription => 
      new Date(subscription.end_date) >= new Date(dateFrom.value)
    )
  }
  
  if (dateTo.value) {
    filtered = filtered.filter(subscription => 
      new Date(subscription.end_date) <= new Date(dateTo.value)
    )
  }
  
  return filtered
})

// Методы
function getCustomerName(customerId) {
  const customer = customers.value?.find(c => c.$id === customerId)
  return customer?.name || 'Неизвестный клиент'
}

function getCustomerInitials(customerId) {
  const name = getCustomerName(customerId)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getCustomerContact(customerId) {
  const customer = customers.value?.find(c => c.$id === customerId)
  if (!customer) return ''
  return customer.contact_handle ? `${customer.contact_type}: ${customer.contact_handle}` : ''
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getPlanName(planId) {
  const plan = plans.value?.find(p => p.$id === planId)
  return plan?.name || ''
}

function getStatusColor(state) {
  const colors = {
    'active': 'success',
    'expiring_soon': 'warning',
    'overdue': 'danger',
    'awaiting_payment': 'info'
  }
  return colors[state] || 'secondary'
}

function getStatusText(state) {
  const texts = {
    'active': 'Активна',
    'expiring_soon': 'Истекает',
    'overdue': 'Просрочена',
    'awaiting_payment': 'Ожидает оплаты'
  }
  return texts[state] || state
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function formatCurrency(amount) {
  if (!amount) return '0 ₴'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(amount)
}

function isExpiringSoon(dateString) {
  if (!dateString) return false
  const endDate = new Date(dateString)
  const now = new Date()
  const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
  return diffDays <= 3 && diffDays >= 0
}

function viewSubscription(subscription) {
  selectedSubscription.value = subscription
  showViewModal.value = true
}

function editSubscription(subscription) {
  // TODO: Реализовать редактирование подписки
  console.log('Edit subscription:', subscription)
}

async function renewSubscription(subscription) {
  if (!confirm('Продлить подписку?')) return
  
  try {
    const newEndDate = new Date(subscription.end_date)
    newEndDate.setMonth(newEndDate.getMonth() + subscription.period_months)
    
    await updateSubscription({
      id: subscription.$id,
      end_date: newEndDate.toISOString(),
      state: 'active'
    })
  } catch (error) {
    console.error('Ошибка продления подписки:', error)
  }
}

function closeViewModal() {
  showViewModal.value = false
  selectedSubscription.value = null
}
</script>

<style scoped>
.subscriptions-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
  gap: 24px;
}

.header-content {
  flex: 1;
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

/* Фильтры */
.filters-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin-bottom: 24px;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.filter-select {
  min-width: 200px;
}

.status-filters {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: var(--va-text-primary);
}

.status-checkbox {
  margin: 0;
}

.date-filters {
  display: flex;
  gap: 16px;
}

.date-input {
  min-width: 200px;
}

/* Таблица */
.subscriptions-table-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-info .customer-name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.customer-info .customer-contact {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.service-cell {
  display: flex;
  flex-direction: column;
}

.service-name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.plan-name {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.expiring-badge {
  font-size: 10px;
  color: var(--va-warning);
  font-weight: 600;
  text-transform: uppercase;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

/* Модальное окно */
.subscription-view-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.subscription-header {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--va-background-element);
}

.subscription-info h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 4px 0;
}

.subscription-info p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 8px 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.detail-label {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.detail-value {
  font-weight: 600;
  color: var(--va-text-primary);
}

.subscription-comment h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 12px 0;
}

.subscription-comment p {
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--va-text-primary);
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Адаптивность */
@media (max-width: 768px) {
  .subscriptions-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .date-filters {
    flex-direction: column;
  }
  
  .date-input {
    min-width: auto;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>