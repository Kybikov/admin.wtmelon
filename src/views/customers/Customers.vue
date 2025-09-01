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
          placeholder="Поиск по имени, email или телефону..."
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

    <!-- Список клиентов -->
    <div class="customers-grid">
      <va-card 
        v-for="customer in filteredCustomers" 
        :key="customer.$id"
        class="customer-card"
        @click="openCustomerModal(customer)"
      >
        <div class="customer-card-content">
          <div class="customer-header">
            <va-avatar 
              :src="customer.avatar" 
              :fallback-text="getInitials(customer.name)"
              size="48px"
              color="primary"
            />
            <div class="customer-info">
              <h3 class="customer-name">{{ customer.name }}</h3>
              <p class="customer-email">{{ customer.email }}</p>
            </div>
            <div class="customer-status">
              <va-chip 
                :color="getStatusColor(customer)" 
                size="small"
                outline
              >
                {{ getStatusText(customer) }}
              </va-chip>
            </div>
          </div>

          <div class="customer-details">
            <div class="detail-item" v-if="customer.phone">
              <va-icon name="phone" size="16px" />
              <span>{{ customer.phone }}</span>
            </div>
            <div class="detail-item" v-if="customer.contact_method && customer.contact">
              <va-icon :name="getContactIcon(customer.contact_method)" size="16px" />
              <span>{{ customer.contact_method }}: {{ customer.contact }}</span>
            </div>
          </div>

          <div class="customer-subscriptions">
            <div class="subscriptions-header">
              <span class="subscriptions-label">Активные подписки</span>
              <va-chip size="small" color="info">{{ getActiveSubscriptionsCount(customer) }}</va-chip>
            </div>
          </div>
        </div>
      </va-card>

      <!-- Состояние загрузки -->
      <div v-if="isLoading" class="loading-state">
        <va-progress-circle indeterminate />
        <p>Загрузка клиентов...</p>
      </div>

      <!-- Пустое состояние -->
      <div v-if="!isLoading && filteredCustomers.length === 0" class="empty-state">
        <va-icon name="people_outline" size="64px" color="secondary" />
        <h3>Клиенты не найдены</h3>
        <p>{{ searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первого клиента' }}</p>
        <va-button v-if="!searchQuery" @click="showCreateModal = true">
          Добавить клиента
        </va-button>
      </div>
    </div>

    <!-- Модальное окно создания клиента -->
    <va-modal 
      v-model="showCreateModal" 
      title="Добавить нового клиента"
      size="large"
      @close="resetCreateForm"
    >
      <div class="create-form">
        <div class="form-row">
          <va-input 
            v-model="createForm.name" 
            label="Имя клиента *" 
            :rules="[v => !!v || 'Имя обязательно']"
            class="form-input"
          />
          <va-input 
            v-model="createForm.email" 
            label="Email" 
            type="email"
            class="form-input"
          />
        </div>
        
        <div class="form-row">
          <va-input 
            v-model="createForm.phone" 
            label="Телефон" 
            class="form-input"
          />
          <va-select
            v-model="createForm.contact_method"
            label="Способ связи"
            :options="contactMethods"
            class="form-input"
          />
        </div>

        <va-input 
          v-model="createForm.contact" 
          label="Контакт (ссылка, username, номер)"
          class="form-input"
        />

        <va-textarea 
          v-model="createForm.comentar" 
          label="Комментарий"
          rows="3"
          class="form-input"
        />
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="showCreateModal = false">
            Отмена
          </va-button>
          <va-button 
            :loading="creating" 
            @click="createCustomer"
            :disabled="!createForm.name"
          >
            Создать клиента
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- Модальное окно просмотра/редактирования клиента -->
    <va-modal 
      v-model="showCustomerModal" 
      :title="selectedCustomer?.name || 'Клиент'"
      size="large"
      @close="closeCustomerModal"
    >
      <div v-if="selectedCustomer" class="customer-modal-content">
        <!-- Основная информация -->
        <div class="customer-modal-header">
          <va-avatar 
            :fallback-text="getInitials(selectedCustomer.name)"
            size="64px"
            color="primary"
          />
          <div class="customer-modal-info">
            <h2>{{ selectedCustomer.name }}</h2>
            <p>{{ selectedCustomer.email }}</p>
            <va-chip 
              :color="getStatusColor(selectedCustomer)" 
              size="small"
            >
              {{ getStatusText(selectedCustomer) }}
            </va-chip>
          </div>
        </div>

        <!-- Контактная информация -->
        <div class="info-section">
          <h4>Контактная информация</h4>
          <div class="info-grid">
            <div class="info-item" v-if="selectedCustomer.phone">
              <va-icon name="phone" />
              <span>{{ selectedCustomer.phone }}</span>
            </div>
            <div class="info-item" v-if="selectedCustomer.contact">
              <va-icon :name="getContactIcon(selectedCustomer.contact_method)" />
              <span>{{ selectedCustomer.contact_method }}: {{ selectedCustomer.contact }}</span>
            </div>
          </div>
        </div>

        <!-- Комментарий -->
        <div class="info-section" v-if="selectedCustomer.comentar">
          <h4>Комментарий</h4>
          <p class="comment-text">{{ selectedCustomer.comentar }}</p>
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
                <span class="subscription-service">{{ getServiceName(subscription.service) }}</span>
                <va-chip 
                  :color="getSubscriptionStatusColor(subscription.state)" 
                  size="small"
                >
                  {{ subscription.state }}
                </va-chip>
              </div>
              <div class="subscription-dates">
                <span v-if="subscription.beginDate">Начало: {{ formatDate(subscription.beginDate) }}</span>
                <span v-if="subscription.endDate">Окончание: {{ formatDate(subscription.endDate) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="no-subscriptions">
            <p>У клиента пока нет подписок</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="showCustomerModal = false">
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
import { ref, computed, reactive, onMounted } from 'vue'
import { 
  useCustomers, 
  useCreateCustomer, 
  useCustomerSubscriptions,
  useServices 
} from './useCustomers'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'

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
const { mutateAsync: createCustomerMutation, isLoading: creating } = useCreateCustomer()

// Состояние поиска и фильтрации
const searchQuery = ref('')
const activeFilter = ref('all')

const statusFilters = [
  { label: 'Все', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Неактивные', value: 'inactive' },
]

// Модальные окна
const showCreateModal = ref(false)
const showCustomerModal = ref(false)
const selectedCustomer = ref(null)

// Форма создания клиента
const createForm = reactive({
  name: '',
  email: '',
  phone: '',
  contact_method: '',
  contact: '',
  comentar: ''
})

const contactMethods = [
  'Telegram',
  'WhatsApp', 
  'Facebook',
  'Instagram',
  'Viber',
  'Другое'
]

// Подписки выбранного клиента
const { 
  data: customerSubscriptions, 
  isLoading: customerSubscriptionsLoading 
} = useCustomerSubscriptions(computed(() => selectedCustomer.value?.$id))

// Вычисляемые свойства
const filteredCustomers = computed(() => {
  if (!customers.value) return []
  
  let filtered = customers.value
  
  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer => 
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по статусу (пока заглушка)
  if (activeFilter.value !== 'all') {
    // Здесь можно добавить логику фильтрации по статусу
  }
  
  return filtered
})

// Методы
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getStatusColor(customer) {
  // Заглушка для определения статуса клиента
  return 'success'
}

function getStatusText(customer) {
  // Заглушка для текста статуса
  return 'Активный'
}

function getContactIcon(method) {
  const icons = {
    'Telegram': 'telegram',
    'WhatsApp': 'whatsapp',
    'Facebook': 'facebook',
    'Instagram': 'instagram',
    'Viber': 'phone',
    'Другое': 'contact_phone'
  }
  return icons[method] || 'contact_phone'
}

function getActiveSubscriptionsCount(customer) {
  // Заглушка - в будущем будет считать реальные активные подписки
  return Math.floor(Math.random() * 5) + 1
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.Service || 'Неизвестный сервис'
}

function getSubscriptionStatusColor(state) {
  const colors = {
    'active': 'success',
    'pending': 'warning',
    'expired': 'danger',
    'cancelled': 'secondary'
  }
  return colors[state] || 'secondary'
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function openCustomerModal(customer) {
  selectedCustomer.value = customer
  showCustomerModal.value = true
}

function closeCustomerModal() {
  showCustomerModal.value = false
  selectedCustomer.value = null
}

function resetCreateForm() {
  Object.assign(createForm, {
    name: '',
    email: '',
    phone: '',
    contact_method: '',
    contact: '',
    comentar: ''
  })
}

async function createCustomer() {
  if (!createForm.name) return
  
  try {
    console.log('Отправка данных клиента:', createForm)
    await createCustomerMutation({
      name: createForm.name,
      email: createForm.email || null,
      phone: createForm.phone || null,
      contact_method: createForm.contact_method || null,
      contact: createForm.contact || null,
      comentar: createForm.comentar || null
    })
    
    showCreateModal.value = false
    resetCreateForm()
  } catch (error) {
    console.error('Ошибка создания клиента:', error)
    // Показываем ошибку пользователю
    alert('Ошибка при создании клиента: ' + (error.message || 'Неизвестная ошибка'))
  }
}

function editCustomer(customer) {
  // Заглушка для редактирования
  console.log('Редактирование клиента:', customer)
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

/* Сетка клиентов */
.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.customer-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15) !important;
  border-color: var(--va-primary);
}

.customer-card-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.customer-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-info {
  flex: 1;
}

.customer-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 4px 0;
}

.customer-email {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin: 0;
}

.customer-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--va-text-secondary);
}

.customer-subscriptions {
  padding-top: 16px;
  border-top: 1px solid var(--va-background-element);
}

.subscriptions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subscriptions-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--va-text-primary);
}

/* Состояния */
.loading-state,
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 16px 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 24px 0;
}

/* Формы */
.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input {
  width: 100%;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Модальное окно клиента */
.customer-modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customer-modal-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--va-background-element);
}

.customer-modal-info h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 4px 0;
}

.customer-modal-info p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 8px 0;
}

.info-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 12px 0;
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
  margin: 0;
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
  
  .customers-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .customer-modal-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>