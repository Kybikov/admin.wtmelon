<template>
  <div class="customers-page">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">База клиентов</h1>
        <p class="page-subtitle">Управление клиентами и их подписками</p>
      </div>
      <va-button @click="showCreateModal = true" size="large">
        <va-icon name="add" class="mr-1" />
        Добавить клиента
      </va-button>
    </div>

    <!-- Поиск и фильтры -->
    <va-card class="filters-card">
      <div class="filters-content">
        <va-input 
          v-model="searchQuery" 
          placeholder="Поиск по имени, контакту или телефону..."
          class="search-input"
        >
          <template #prependInner>
            <va-icon name="search" size="18px" />
          </template>
        </va-input>
        
        <div class="filter-buttons">
          <va-button 
            v-for="filter in statusFilters" 
            :key="filter.value"
            :preset="activeFilter === filter.value ? 'primary' : 'secondary'"
            size="small"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </va-button>
        </div>
      </div>
    </va-card>

    <!-- Таблица клиентов -->
    <va-card class="customers-table-card">
      <va-data-table
        :items="filteredCustomers"
        :columns="columns"
        :loading="isLoading"
        striped
        hoverable
        :per-page="20"
        :current-page="currentPage"
        @update:current-page="currentPage = $event"
      >
        <template #cell(name)="{ rowData }">
          <div class="customer-name-cell">
            <va-avatar 
              :fallback-text="getInitials(rowData.name)"
              size="32px"
              color="primary"
            />
            <div class="customer-info">
              <div class="name">{{ rowData.name }}</div>
              <div class="contact" v-if="rowData.contact_handle">
                {{ rowData.contact_type }}: {{ rowData.contact_handle }}
              </div>
            </div>
          </div>
        </template>

        <template #cell(country)="{ rowData }">
          {{ getRegionName(rowData.regions_id) }}
        </template>

        <template #cell(total_purchases)="{ rowData }">
          {{ customerStats[rowData.$id]?.totalPurchases || 0 }}
        </template>

        <template #cell(total_spent)="{ rowData }">
          {{ formatCurrency(customerStats[rowData.$id]?.totalSpent || 0) }}
        </template>

        <template #cell(status)="{ rowData }">
          <va-chip 
            :color="getStatusColor(rowData.status)" 
            size="small"
          >
            {{ getStatusText(rowData.status) }}
          </va-chip>
        </template>

        <template #cell(actions)="{ rowData }">
          <div class="actions-cell">
            <va-button 
              preset="plain" 
              size="small" 
              @click="viewCustomer(rowData)"
            >
              <va-icon name="visibility" />
            </va-button>
            <va-button 
              preset="plain" 
              size="small" 
              @click="editCustomer(rowData)"
            >
              <va-icon name="edit" />
            </va-button>
            <va-button 
              preset="plain" 
              size="small" 
              color="danger"
              @click="deleteCustomer(rowData)"
            >
              <va-icon name="delete" />
            </va-button>
          </div>
        </template>
      </va-data-table>
    </va-card>

    <!-- Модальное окно создания/редактирования клиента -->
    <CustomerModal
      v-model="showCreateModal"
      :customer="selectedCustomer"
      :is-edit="isEditMode"
      @success="handleCustomerSuccess"
    />

    <!-- Модальное окно просмотра клиента -->
    <va-modal 
      v-model="showViewModal" 
      :title="selectedCustomer?.name || 'Клиент'"
      size="large"
      @close="closeViewModal"
    >
      <div v-if="selectedCustomer" class="customer-view-content">
        <!-- Основная информация -->
        <div class="customer-view-header">
          <va-avatar 
            :fallback-text="getInitials(selectedCustomer.name)"
            size="64px"
            color="primary"
          />
          <div class="customer-view-info">
            <h2>{{ selectedCustomer.name }}</h2>
            <p v-if="selectedCustomer.contact_handle">
              {{ selectedCustomer.contact_type }}: {{ selectedCustomer.contact_handle }}
            </p>
            <va-chip 
              :color="getStatusColor(selectedCustomer.status)" 
              size="small"
            >
              {{ getStatusText(selectedCustomer.status) }}
            </va-chip>
          </div>
        </div>

        <!-- Статистика -->
        <div class="customer-stats-section">
          <h4>Статистика</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ customerStats[selectedCustomer.$id]?.totalPurchases || 0 }}</div>
              <div class="stat-label">Всего покупок</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatCurrency(customerStats[selectedCustomer.$id]?.totalSpent || 0) }}</div>
              <div class="stat-label">Потрачено</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ customerStats[selectedCustomer.$id]?.activeSubscriptions || 0 }}</div>
              <div class="stat-label">Активных подписок</div>
            </div>
          </div>
        </div>

        <!-- Контактная информация -->
        <div class="info-section" v-if="hasContactInfo(selectedCustomer)">
          <h4>Контактная информация</h4>
          <div class="info-grid">
            <div class="info-item" v-if="selectedCustomer.phone">
              <va-icon name="phone" />
              <span>{{ selectedCustomer.phone }}</span>
            </div>
            <div class="info-item" v-if="selectedCustomer.contact_url">
              <va-icon name="link" />
              <span>{{ selectedCustomer.contact_url }}</span>
            </div>
            <div class="info-item" v-if="selectedCustomer.regions_id">
              <va-icon name="location_on" />
              <span>{{ getRegionName(selectedCustomer.regions_id) }}</span>
            </div>
          </div>
        </div>

        <!-- Комментарий -->
        <div class="info-section" v-if="selectedCustomer.comment">
          <h4>Комментарий</h4>
          <p class="comment-text">{{ selectedCustomer.comment }}</p>
        </div>

        <!-- Подписки -->
        <div class="info-section">
          <h4>Подписки</h4>
          <div v-if="customerSubscriptionsLoading" class="loading-subscriptions">
            <va-progress-circle indeterminate size="small" />
            <span>Загрузка подписок...</span>
          </div>
          <div v-else-if="customerSubscriptions?.length" class="subscriptions-list">
            <div 
              v-for="subscription in customerSubscriptions" 
              :key="subscription.$id"
              class="subscription-item"
            >
              <div class="subscription-info">
                <span class="subscription-service">{{ getServiceName(subscription.services_id) }}</span>
                <va-chip 
                  :color="getSubscriptionStatusColor(subscription.state)" 
                  size="small"
                >
                  {{ getSubscriptionStatusText(subscription.state) }}
                </va-chip>
              </div>
              <div class="subscription-dates">
                <span v-if="subscription.start_date">Начало: {{ formatDate(subscription.start_date) }}</span>
                <span v-if="subscription.end_date">Окончание: {{ formatDate(subscription.end_date) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-subscriptions">
            <p>У клиента пока нет подписок</p>
            <va-button size="small" @click="createSubscriptionForCustomer(selectedCustomer)">
              Создать подписку
            </va-button>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="showViewModal = false">
            Закрыть
          </va-button>
          <va-button @click="editCustomer(selectedCustomer)">
            Редактировать
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { account } from '@/appwrite/client'
import { 
  useCustomers, 
  useDeleteCustomer,
  useCustomerStats
} from '@/composables/useCustomersApi'
import { useCustomerSubscriptions } from '@/composables/useSubscriptionsApi'
import { useServices } from '@/composables/useServicesApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import CustomerModal from '@/components/CustomerModal.vue'

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
const { data: customers, isLoading } = useCustomers()
const { data: services } = useServices()
const { data: regions } = useRegions()
const { mutateAsync: deleteCustomerMutation } = useDeleteCustomer()

// Состояние поиска и фильтрации
const searchQuery = ref('')
const activeFilter = ref('all')
const currentPage = ref(1)

const statusFilters = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Неактивные', value: 'inactive' },
]

// Модальные окна
const showCreateModal = ref(false)
const showViewModal = ref(false)
const selectedCustomer = ref(null)
const isEditMode = ref(false)

// Статистика клиентов
const customerStats = ref({})

// Подписки выбранного клиента
const { 
  data: customerSubscriptions, 
  isLoading: customerSubscriptionsLoading 
} = useCustomerSubscriptions(computed(() => selectedCustomer.value?.$id))

// Колонки таблицы
const columns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'country', label: 'Страна', sortable: true },
  { key: 'total_purchases', label: 'Покупок', sortable: true },
  { key: 'total_spent', label: 'Потрачено', sortable: true },
  { key: 'status', label: 'Статус', sortable: true },
  { key: 'actions', label: 'Действия', width: 120 }
]

// Вычисляемые свойства
const filteredCustomers = computed(() => {
  if (!customers.value) return []
  
  let filtered = customers.value
  
  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer => 
      customer.name?.toLowerCase().includes(query) ||
      customer.contact_handle?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по статусу
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(customer => customer.status === activeFilter.value)
  }
  
  return filtered
})

// Загружаем статистику для каждого клиента
watch(customers, async (newCustomers) => {
  if (newCustomers) {
    for (const customer of newCustomers) {
      try {
        const { data: stats } = await useCustomerStats(customer.$id)
        if (stats.value) {
          customerStats.value[customer.$id] = stats.value
        }
      } catch (error) {
        console.error('Ошибка загрузки статистики клиента:', error)
      }
    }
  }
}, { immediate: true })

// Методы
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Не указано'
}

function getStatusColor(status) {
  const colors = {
    'active': 'success',
    'inactive': 'secondary'
  }
  return colors[status] || 'secondary'
}

function getStatusText(status) {
  const texts = {
    'active': 'Активный',
    'inactive': 'Неактивный'
  }
  return texts[status] || status
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getSubscriptionStatusColor(state) {
  const colors = {
    'active': 'success',
    'expiring_soon': 'warning',
    'overdue': 'danger',
    'awaiting_payment': 'info'
  }
  return colors[state] || 'secondary'
}

function getSubscriptionStatusText(state) {
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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(amount)
}

function hasContactInfo(customer) {
  return customer.phone || customer.contact_url || customer.regions_id
}

function viewCustomer(customer) {
  selectedCustomer.value = customer
  showViewModal.value = true
}

function editCustomer(customer) {
  selectedCustomer.value = customer
  isEditMode.value = true
  showCreateModal.value = true
  showViewModal.value = false
}

function createSubscriptionForCustomer(customer) {
  router.push({
    name: 'new-subscription',
    query: { customerId: customer.$id }
  })
}

async function deleteCustomer(customer) {
  if (!confirm(`Вы уверены, что хотите удалить клиента "${customer.name}"?`)) return
  
  try {
    await deleteCustomerMutation(customer.$id)
  } catch (error) {
    console.error('Ошибка удаления клиента:', error)
    alert('Ошибка при удалении клиента')
  }
}

function closeViewModal() {
  showViewModal.value = false
  selectedCustomer.value = null
}

function handleCustomerSuccess() {
  showCreateModal.value = false
  selectedCustomer.value = null
  isEditMode.value = false
}
</script>

<style scoped>
.customers-page {
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
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 300px;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Таблица */
.customers-table-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.customer-name-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-info .name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.customer-info .contact {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

/* Модальное окно просмотра */
.customer-view-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-view-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--va-background-element);
}

.customer-view-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 4px 0;
}

.customer-view-info p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 8px 0;
}

.customer-stats-section h4,
.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 12px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--va-background-primary);
  border-radius: 8px;
  font-size: 14px;
}

.comment-text {
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 8px;
  font-size: 14px;
  color: var(--va-text-primary);
  line-height: 1.5;
  margin: 0;
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscription-item {
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.subscription-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.subscription-service {
  font-weight: 600;
  color: var(--va-text-primary);
}

.subscription-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--va-text-secondary);
}

.loading-subscriptions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  justify-content: center;
}

.no-subscriptions {
  text-align: center;
  padding: 20px;
  color: var(--va-text-secondary);
}

.no-subscriptions p {
  margin: 0 0 12px 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Адаптивность */
@media (max-width: 768px) {
  .customers-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .customer-view-header {
    flex-direction: column;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>