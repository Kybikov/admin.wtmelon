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
        
        <div class="filter-row">
          <va-select
            v-model="selectedService"
            label="Сервис"
            :options="serviceFilterOptions"
            text-by="name"
            value-by="$id"
            clearable
            class="filter-select"
          />
          
          <va-select
            v-model="selectedCountry"
            label="Страна"
            :options="countryFilterOptions"
            text-by="name"
            value-by="$id"
            clearable
            class="filter-select"
          />
          
          <va-select
            v-model="selectedContactType"
            label="Тип связи"
            :options="contactTypeFilterOptions"
            text-by="text"
            value-by="value"
            clearable
            class="filter-select"
          />
        </div>
        
        <div class="status-filters">
          <span class="filter-label">Статус:</span>
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
        @row:click="viewCustomer"
        class="clickable-table"
      >
        <template #cell(name)="{ rowData }">
          <div class="customer-name-cell">
            <div class="customer-info">
              <div class="name">{{ rowData.name }}</div>
            </div>
          </div>
        </template>

        <template #cell(contact)="{ rowData }">
          <div class="contact-cell">
            <a 
              v-if="rowData.contact_url" 
              :href="rowData.contact_url" 
              target="_blank"
              class="contact-link"
              @click.stop
            >
              {{ getContactTypeText(rowData.contact_type) }}
            </a>
            <span v-else class="contact-no-link">
              {{ getContactTypeText(rowData.contact_type) }}
            </span>
          </div>
        </template>

        <template #cell(country)="{ rowData }">
          {{ getRegionName(rowData.regions_id) }}
        </template>

        <template #cell(active_subscriptions)="{ rowData }">
          <div class="subscriptions-cell">
            <div v-if="customerActiveSubscriptions[rowData.$id]?.length" class="subscriptions-list">
              <va-chip 
                v-for="subscription in customerActiveSubscriptions[rowData.$id]" 
                :key="subscription.$id"
                size="small"
                color="success"
                class="subscription-chip"
              >
                {{ getServiceName(subscription.services_id) }}
              </va-chip>
            </div>
            <span v-else class="no-subscriptions">Нет активных</span>
          </div>
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
      </va-data-table>
    </va-card>

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
      hide-default-actions
    >
      <div v-if="selectedCustomer" class="customer-view-content">
        <!-- Основная информация -->
        <div class="customer-view-header">
          <div class="customer-view-info">
            <h2>{{ selectedCustomer.name }}</h2>
            <p v-if="selectedCustomer.contact_handle">
              {{ selectedCustomer.contact_type }}: {{ selectedCustomer.contact_handle }}
            </p>
            <div class="status-actions">
              <va-chip 
                :color="getStatusColor(selectedCustomer.status)" 
                size="small"
              >
                {{ getStatusText(selectedCustomer.status) }}
              </va-chip>
              <va-button 
                size="small" 
                preset="plain"
                @click="toggleCustomerStatus(selectedCustomer)"
                :loading="updatingStatus"
              >
                {{ selectedCustomer.status === 'active' ? 'Деактивировать' : 'Активировать' }}
              </va-button>
            </div>
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
              <a :href="selectedCustomer.contact_url" target="_blank">{{ selectedCustomer.contact_url }}</a>
            </div>
            <div class="info-item" v-if="selectedCustomer.regions_id">
              <va-icon name="location_on" />
              <span>{{ getRegionName(selectedCustomer.regions_id) }}</span>
            </div>
          </div>
        </div>

        <!-- Теги -->
        <div class="info-section" v-if="selectedCustomer.tags?.length">
          <h4>Теги</h4>
          <div class="tags-list">
            <va-chip 
              v-for="tag in selectedCustomer.tags" 
              :key="tag"
              size="small"
              color="info"
              outline
            >
              {{ tag }}
            </va-chip>
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
          <div v-else-if="modalCustomerSubscriptions?.length" class="subscriptions-list">
            <div 
              v-for="subscription in modalCustomerSubscriptions" 
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
          <va-button 
            preset="plain" 
            color="danger"
            @click="deleteCustomer(selectedCustomer)"
          >
            Удалить
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
  useUpdateCustomer
} from '@/composables/useCustomersApi'
import { useCustomerSubscriptions, useSubscriptions } from '@/composables/useSubscriptionsApi'
import { useServices } from '@/composables/useServicesApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import { useOrders } from '@/composables/useOrdersApi'
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
const { data: allSubscriptions } = useSubscriptions()
const { data: allOrders } = useOrders()
const { mutateAsync: deleteCustomerMutation } = useDeleteCustomer()
const { mutateAsync: updateCustomer } = useUpdateCustomer()

// Реактивная ссылка для загрузки подписок клиента в модальном окне
const customerIdForModal = ref(null)
const { data: modalCustomerSubscriptions, isLoading: customerSubscriptionsLoading } = useCustomerSubscriptions(customerIdForModal)

// Состояние поиска и фильтрации
const searchQuery = ref('')
const activeFilter = ref('all')
const selectedService = ref('')
const selectedCountry = ref('')
const selectedContactType = ref('')
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
const updatingStatus = ref(false)


// Статистика клиентов - вычисляемое свойство
const customerStats = computed(() => {
  const stats = {}
  if (customers.value && allOrders.value && allSubscriptions.value) {
    customers.value.forEach(customer => {
      const customerOrders = allOrders.value.filter(order => order.customers_id === customer.$id)
      const customerSubscriptions = allSubscriptions.value.filter(sub => sub.customers_id === customer.$id)
      
      stats[customer.$id] = {
        totalPurchases: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, order) => sum + (order.sell_price || 0), 0),
        activeSubscriptions: customerSubscriptions.filter(sub => sub.state === 'active').length
      }
    })
  }
  return stats
})

// Активные подписки клиентов - вычисляемое свойство
const customerActiveSubscriptions = computed(() => {
  const activeSubscriptions = {}
  if (customers.value && allSubscriptions.value) {
    customers.value.forEach(customer => {
      activeSubscriptions[customer.$id] = allSubscriptions.value.filter(sub => 
        sub.customers_id === customer.$id && sub.state === 'active'
      )
    })
  }
  return activeSubscriptions
})

// Колонки таблицы
const columns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'contact', label: 'Контакт', sortable: true },
  { key: 'country', label: 'Страна', sortable: true },
  { key: 'active_subscriptions', label: 'Активные подписки', sortable: false },
  { key: 'total_purchases', label: 'Покупок', sortable: true },
  { key: 'total_spent', label: 'Потрачено', sortable: true },
  { key: 'status', label: 'Статус', sortable: true }
]

// Опции фильтров
const serviceFilterOptions = computed(() => {
  return [
    { $id: '', name: 'Все сервисы' },
    ...(services.value || [])
  ]
})

const countryFilterOptions = computed(() => {
  return [
    { $id: '', name: 'Все страны' },
    ...(regions.value || [])
  ]
})

const contactTypeFilterOptions = computed(() => {
  return [
    { value: '', text: 'Все типы связи' },
    { value: 'telegram', text: 'Telegram' },
    { value: 'instagram', text: 'Instagram' },
    { value: 'facebook', text: 'Facebook' },
    { value: 'whatsapp', text: 'WhatsApp' },
    { value: 'phone', text: 'Телефон' },
    { value: 'Other', text: 'Другое' },
    { value: 'discord', text: 'Discord' }
  ]
})

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
  
  // Фильтр по сервису
  if (selectedService.value) {
    filtered = filtered.filter(customer => {
      const activeSubscriptions = customerActiveSubscriptions.value[customer.$id] || []
      return activeSubscriptions.some(sub => sub.services_id === selectedService.value)
    })
  }
  
  // Фильтр по стране
  if (selectedCountry.value) {
    filtered = filtered.filter(customer => customer.regions_id === selectedCountry.value)
  }
  
  // Фильтр по типу связи
  if (selectedContactType.value) {
    filtered = filtered.filter(customer => customer.contact_type === selectedContactType.value)
  }
  
  return filtered
})

// Автоматическое обновление статуса клиентов
watch([customers, customerActiveSubscriptions], async ([newCustomers, newActiveSubscriptions]) => {
  if (newCustomers && newActiveSubscriptions) {
    for (const customer of newCustomers) {
      try {
        const activeSubscriptions = newActiveSubscriptions[customer.$id] || []
        
        // Автоматически обновляем статус клиента
        const shouldBeActive = activeSubscriptions.length > 0
        const currentStatus = customer.status
        
        if ((shouldBeActive && currentStatus !== 'active') || (!shouldBeActive && currentStatus !== 'inactive')) {
          const newStatus = shouldBeActive ? 'active' : 'inactive'
          await updateCustomer({
            id: customer.$id,
            status: newStatus
          })
        }
        
      } catch (error) {
        console.error('Ошибка загрузки данных клиента:', error)
      }
    }
  }
}, { immediate: true })

// Методы
function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Не указано'
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getContactTypeText(contactType) {
  const types = {
    'telegram': 'Telegram',
    'instagram': 'Instagram',
    'facebook': 'Facebook',
    'whatsapp': 'WhatsApp',
    'phone': 'Телефон',
    'Other': 'Другое',
    'discord': 'Discord',
    'email': 'Email',
    'other': 'Другое'
  }
  return types[contactType] || contactType
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
    'inactive': 'Неактивный',
    'Blocked': 'Заблокированый',
    'Test': 'Tест'
  }
  return texts[status] || status
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

function viewCustomer({ item: customer }) {
  if (!customer || !customer.$id) {
    console.error('Invalid customer data:', customer)
    return
  }
  
  selectedCustomer.value = customer
  showViewModal.value = true
  
  // Устанавливаем ID клиента для загрузки подписок через composable
  customerIdForModal.value = customer.$id
}

function editCustomer(customer) {
  console.log('Editing customer:', customer)
  console.log('Customer ID:', customer.$id)
  console.log('Is edit mode will be:', true)
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

async function toggleCustomerStatus(customer) {
  if (!customer || !customer.$id) {
    console.error('Customer or customer ID is missing')
    return
  }
  
  updatingStatus.value = true
  try {
    const newStatus = customer.status === 'active' ? 'inactive' : 'active'
    await updateCustomer({
      id: customer.$id,
      status: newStatus
    })
    
    // Обновляем локальные данные
    customer.status = newStatus
    if (selectedCustomer.value) {
      selectedCustomer.value.status = newStatus
    }
  } catch (error) {
    console.error('Ошибка обновления статуса клиента:', error)
  } finally {
    updatingStatus.value = false
  }
}

async function deleteCustomer(customer) {
  const confirmed = await new Promise(resolve => {
    const result = confirm(`Вы уверены, что хотите удалить клиента "${customer.name}"?`)
    resolve(result)
  })
  
  if (!confirmed) return
  
  try {
    await deleteCustomerMutation(customer.$id)
    showViewModal.value = false
    selectedCustomer.value = null
  } catch (error) {
    console.error('Ошибка удаления клиента:', error)
    
    // Проверяем тип ошибки и показываем соответствующее сообщение
    if (error.message?.includes('not authorized') || error.message?.includes('The current user is not authorized')) {
      alert('Ошибка: У вас недостаточно прав для удаления клиентов. Обратитесь к администратору для настройки разрешений в Appwrite.')
    } else {
      alert(`Ошибка при удалении клиента: ${error.message || 'Неизвестная ошибка'}`)
    }
  }
}

function closeViewModal() {
  showViewModal.value = false
  selectedCustomer.value = null
  customerIdForModal.value = null
}

function handleCustomerSuccess() {
  showCreateModal.value = false
  selectedCustomer.value = null
  isEditMode.value = false
  
  // Закрываем модальное окно просмотра если оно открыто
  if (showViewModal.value) {
    showViewModal.value = false
  }
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
  flex-direction: column;
  gap: 20px;
}

.search-input {
  max-width: 400px;
}

.filter-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
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

/* Таблица */
.customers-table-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.clickable-table {
  cursor: pointer;
}

:deep(.clickable-table .va-data-table__table-tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.clickable-table .va-data-table__table-tr:hover) {
  background-color: rgba(255, 255, 255, 0.05) !important;
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

.contact-cell {
  display: flex;
  align-items: center;
}

.contact-link {
  color: var(--va-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.contact-link:hover {
  color: var(--va-primary);
  text-decoration: underline;
}

.contact-no-link {
  color: var(--va-text-secondary);
}

.subscriptions-cell {
  max-width: 200px;
}

.subscriptions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.subscription-chip {
  font-size: 11px !important;
  height: 20px !important;
}

.no-subscriptions {
  color: var(--va-text-secondary);
  font-style: italic;
  font-size: 12px;
}

/* Модальное окно просмотра */
.customer-view-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-view-header {
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

.status-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.info-item a {
  color: var(--va-primary);
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  
  .filter-row {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .customer-view-header {
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .subscriptions-cell {
    max-width: none;
  }
}
</style>