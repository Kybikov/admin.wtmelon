<template>
  <div class="new-subscription-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1 class="page-title">Новая подписка</h1>
      <p class="page-subtitle">Пошаговое оформление подписки для клиента</p>
    </div>

    <!-- Прогресс -->
    <va-card class="progress-card">
      <va-stepper 
        v-model="currentStep" 
        :steps="steps"
        class="subscription-stepper"
      />
    </va-card>

    <!-- Контент шагов -->
    <va-card class="step-content-card">
      <!-- Шаг 1: Выбор клиента -->
      <div v-if="currentStep === 1" class="step-content">
        <h3>Выберите клиента</h3>
        
        <div class="client-selection">
          <va-input 
            v-model="clientSearch" 
            placeholder="Поиск клиента по имени или контакту..."
            class="client-search"
          >
            <template #prependInner>
              <va-icon name="search" size="18px" />
            </template>
          </va-input>

          <div v-if="filteredCustomers.length" class="clients-list">
            <div 
              v-for="customer in filteredCustomers" 
              :key="customer.$id"
              class="client-item"
              :class="{ 'client-selected': selectedCustomer?.$id === customer.$id }"
              @click="selectCustomer(customer)"
            >
              <va-avatar 
                :fallback-text="getCustomerInitials(customer.name)"
                size="40px"
                color="primary"
              />
              <div class="client-info">
                <div class="client-name">{{ customer.name }}</div>
                <div class="client-contact">{{ getCustomerContact(customer) }}</div>
              </div>
              <va-icon 
                v-if="selectedCustomer?.$id === customer.$id"
                name="check_circle" 
                color="success" 
                size="20px"
              />
            </div>
          </div>

          <div class="create-new-client">
            <va-divider>или</va-divider>
            <va-button @click="showCreateCustomer = true" preset="secondary" size="large">
              <va-icon name="person_add" class="mr-1" />
              Создать нового клиента
            </va-button>
          </div>
        </div>
      </div>

      <!-- Шаг 2: Выбор сервиса и плана -->
      <div v-if="currentStep === 2" class="step-content">
        <h3>Выберите сервис и план</h3>
        
        <div class="services-grid">
          <div 
            v-for="service in services" 
            :key="service.$id"
            class="service-card"
            :class="{ 'service-selected': selectedService?.$id === service.$id }"
            @click="selectService(service)"
          >
            <div class="service-header">
              <h4>{{ service.name }}</h4>
              <va-icon 
                v-if="selectedService?.$id === service.$id"
                name="check_circle" 
                color="success" 
                size="20px"
              />
            </div>
          </div>
        </div>

        <div v-if="selectedService" class="plan-types">
          <h4>Тип подписки</h4>
          <va-radio 
            v-for="planType in planTypes" 
            :key="planType.value"
            v-model="selectedPlanType"
            :option="planType.value"
            :label="planType.label"
            class="plan-type-radio"
          />
        </div>
      </div>

      <!-- Шаг 3: Выбор места (для membership) -->
      <div v-if="currentStep === 3 && selectedPlanType === 'membership'" class="step-content">
        <h3>Выберите место в семье</h3>
        
        <div v-if="availableAccounts.length" class="accounts-list">
          <div 
            v-for="account in availableAccounts" 
            :key="account.$id"
            class="account-item"
            :class="{ 'account-selected': selectedAccount?.$id === account.$id }"
            @click="selectAccount(account)"
          >
            <div class="account-info">
              <h4>[{{ account.service_login_key }}] {{ getServiceName(account.services_id) }}</h4>
              <div class="account-details">
                <span>Занято: {{ account.seats_taken }}/{{ account.max_seats }}</span>
                <span>Регион: {{ getRegionName(account.regions_id) }}</span>
                <span>Истекает: {{ formatDate(account.paid_until) }}</span>
              </div>
            </div>
            <va-icon 
              v-if="selectedAccount?.$id === account.$id"
              name="check_circle" 
              color="success" 
              size="20px"
            />
          </div>
        </div>
        
        <div v-else class="no-accounts">
          <p>Нет доступных мест для сервиса {{ selectedService?.name }}</p>
          <va-button @click="$router.push('/accounts')" preset="secondary">
            Создать аккаунт
          </va-button>
        </div>
      </div>

      <!-- Шаг 4: Детали подписки -->
      <div v-if="currentStep === 4 || (currentStep === 3 && selectedPlanType !== 'membership')" class="step-content">
        <h3>Детали подписки</h3>
        
        <div class="subscription-form">
          <div class="form-row">
            <va-select
              v-model="subscriptionForm.period_months"
              label="Период *"
              :options="periodOptions"
              text-by="label"
              value-by="value"
              :rules="[v => !!v || 'Период обязателен']"
              class="form-input"
            />
            <va-input 
              v-model="subscriptionForm.quantity" 
              label="Количество" 
              type="number"
              :min="1"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <va-input 
              v-model="subscriptionForm.cost_price" 
              label="Цена закупки" 
              type="number"
              :min="0"
              class="form-input"
            />
            <va-input 
              v-model="subscriptionForm.sell_price" 
              label="Цена продажи *" 
              type="number"
              :min="0"
              :rules="[v => !!v || 'Цена продажи обязательна']"
              class="form-input"
            />
          </div>

          <va-select
            v-model="subscriptionForm.paymentMethod"
            label="Способ оплаты *"
            :options="paymentMethods"
            text-by="text"
            value-by="value"
            :rules="[v => !!v || 'Способ оплаты обязателен']"
            class="form-input"
          />

          <va-textarea 
            v-model="subscriptionForm.comment" 
            label="Комментарий"
            rows="3"
            class="form-input"
          />
        </div>
      </div>

      <!-- Шаг 5: Подтверждение -->
      <div v-if="currentStep === 5 || (currentStep === 4 && selectedPlanType !== 'membership')" class="step-content">
        <h3>Подтверждение подписки</h3>
        
        <div class="confirmation-summary">
          <div class="summary-section">
            <h4>Клиент</h4>
            <div class="summary-item">
              <va-avatar 
                :fallback-text="getCustomerInitials(selectedCustomer?.name)"
                size="32px"
                color="primary"
              />
              <div>
                <div class="summary-name">{{ selectedCustomer?.name }}</div>
                <div class="summary-contact">{{ getCustomerContact(selectedCustomer) }}</div>
              </div>
            </div>
          </div>

          <div class="summary-section">
            <h4>Сервис</h4>
            <div class="summary-item">
              <div>
                <div class="summary-name">{{ selectedService?.name }}</div>
                <div class="summary-contact">{{ selectedPlanType === 'membership' ? 'Семейная подписка' : 'Индивидуальная подписка' }}</div>
              </div>
            </div>
          </div>

          <div v-if="selectedAccount" class="summary-section">
            <h4>Аккаунт</h4>
            <div class="summary-item">
              <div>
                <div class="summary-name">[{{ selectedAccount.service_login_key }}]</div>
                <div class="summary-contact">{{ getRegionName(selectedAccount.regions_id) }}</div>
              </div>
            </div>
          </div>

          <div class="summary-section">
            <h4>Детали</h4>
            <div class="summary-details">
              <div class="detail-row">
                <span>Период:</span>
                <span>{{ subscriptionForm.period_months }} месяцев</span>
              </div>
              <div class="detail-row">
                <span>Количество:</span>
                <span>{{ subscriptionForm.quantity }}</span>
              </div>
              <div class="detail-row">
                <span>Цена закупки:</span>
                <span>{{ formatCurrency(subscriptionForm.cost_price) }}</span>
              </div>
              <div class="detail-row">
                <span>Цена продажи:</span>
                <span>{{ formatCurrency(subscriptionForm.sell_price) }}</span>
              </div>
              <div class="detail-row">
                <span>Способ оплаты:</span>
                <span>{{ getPaymentMethodText(subscriptionForm.paymentMethod) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Навигация -->
      <div class="step-navigation">
        <va-button 
          v-if="currentStep > 1"
          preset="secondary" 
          @click="previousStep"
        >
          Назад
        </va-button>
        
        <va-spacer />
        
        <va-button 
          v-if="!isLastStep"
          :disabled="!canProceed"
          @click="nextStep"
        >
          Далее
        </va-button>
        
        <va-button 
          v-if="isLastStep"
          :loading="creating"
          :disabled="!canCreate"
          @click="createSubscription"
          color="success"
        >
          Создать подписку
        </va-button>
      </div>
    </va-card>

    <!-- Модальное окно создания клиента -->
    <CustomerModal
      v-model="showCreateCustomer"
      @success="handleCustomerCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { account } from '@/appwrite/client'
import { useCustomers } from '@/composables/useCustomersApi'
import { useServices } from '@/composables/useServicesApi'
import { useAccountsByService } from '@/composables/useAccountsApi'
import { useCreateSubscription } from '@/composables/useSubscriptionsApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import CustomerModal from '@/components/CustomerModal.vue'

const router = useRouter()
const route = useRoute()

// Проверка авторизации
onMounted(async () => {
  try {
    await account.get()
    // Предзаполнение из query параметров
    if (route.query.customerId) {
      const customer = customers.value?.find(c => c.$id === route.query.customerId)
      if (customer) selectCustomer(customer)
    }
  } catch {
    router.replace('/login')
  }
})

// Данные
const { data: customers } = useCustomers()
const { data: services } = useServices()
const { data: regions } = useRegions()
const { mutateAsync: createSubscriptionMutation, isLoading: creating } = useCreateSubscription()

// Состояние шагов
const currentStep = ref(1)
const steps = [
  { label: 'Клиент' },
  { label: 'Сервис' },
  { label: 'Место' },
  { label: 'Детали' },
  { label: 'Подтверждение' }
]

// Выбранные данные
const selectedCustomer = ref(null)
const selectedService = ref(null)
const selectedPlanType = ref('membership')
const selectedAccount = ref(null)

// Поиск и фильтры
const clientSearch = ref('')
const showCreateCustomer = ref(false)

// Форма подписки
const subscriptionForm = reactive({
  period_months: 1,
  quantity: 1,
  cost_price: 0,
  sell_price: 0,
  paymentMethod: '',
  comment: ''
})

// Опции
const planTypes = [
  { value: 'membership', label: 'Семейная подписка (место в семье)' },
  { value: 'individual', label: 'Индивидуальная подписка' }
]

const periodOptions = [
  { value: 1, label: '1 месяц' },
  { value: 3, label: '3 месяца' },
  { value: 6, label: '6 месяцев' },
  { value: 12, label: '12 месяцев' }
]

const paymentMethods = [
  { text: 'Карта', value: 'card' },
  { text: 'Наличные', value: 'cash' },
  { text: 'Криптовалюта', value: 'crypto' },
  { text: 'Банковский перевод', value: 'bank_transfer' }
]

// Доступные аккаунты для выбранного сервиса
const { data: serviceAccounts } = useAccountsByService(
  computed(() => selectedService.value?.$id)
)

const availableAccounts = computed(() => {
  if (!serviceAccounts.value) return []
  return serviceAccounts.value.filter(account => 
    account.status === 'active' && 
    (account.seats_taken || 0) < (account.max_seats || 0)
  )
})

// Фильтрованные клиенты
const filteredCustomers = computed(() => {
  if (!customers.value) return []
  if (!clientSearch.value) return customers.value.slice(0, 10)
  
  const query = clientSearch.value.toLowerCase()
  return customers.value.filter(customer => 
    customer.name?.toLowerCase().includes(query) ||
    customer.contact_handle?.toLowerCase().includes(query)
  ).slice(0, 10)
})

// Логика навигации
const isLastStep = computed(() => {
  if (selectedPlanType.value === 'membership') {
    return currentStep.value === 5
  } else {
    return currentStep.value === 4
  }
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!selectedCustomer.value
    case 2:
      return !!selectedService.value && !!selectedPlanType.value
    case 3:
      return selectedPlanType.value !== 'membership' || !!selectedAccount.value
    case 4:
      return !!subscriptionForm.period_months && 
             !!subscriptionForm.sell_price && 
             true // Убираем проверку paymentMethod так как поле не обязательное
    default:
      return true
  }
})

const canCreate = computed(() => {
  return !!selectedCustomer.value && 
         !!selectedService.value && 
         !!subscriptionForm.period_months && 
         !!subscriptionForm.sell_price && 
         (selectedPlanType.value !== 'membership' || !!selectedAccount.value)
})

// Методы
function getCustomerInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getCustomerContact(customer) {
  if (!customer) return ''
  return customer.contact_handle ? `${customer.contact_type}: ${customer.contact_handle}` : ''
}

function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Не указано'
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function formatCurrency(amount) {
  if (!amount) return '0 ₴'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(amount)
}

function getPaymentMethodText(value) {
  const method = paymentMethods.find(m => m.value === value)
  return method?.text || value
}
function selectCustomer(customer) {
  selectedCustomer.value = customer
}

function selectService(service) {
  selectedService.value = service
  selectedAccount.value = null // Сбрасываем выбранный аккаунт
}

function selectAccount(account) {
  selectedAccount.value = account
}

function nextStep() {
  if (canProceed.value) {
    if (selectedPlanType.value !== 'membership' && currentStep.value === 2) {
      currentStep.value = 4 // Пропускаем шаг выбора места
    } else {
      currentStep.value++
    }
  }
}

function previousStep() {
  if (selectedPlanType.value !== 'membership' && currentStep.value === 4) {
    currentStep.value = 2 // Возвращаемся к выбору сервиса
  } else {
    currentStep.value--
  }
}

function handleCustomerCreated() {
  showCreateCustomer.value = false
  // Обновляем список клиентов и выбираем созданного
  // TODO: Получить ID созданного клиента и выбрать его
}

async function createSubscription() {
  if (!canCreate.value) return

  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + subscriptionForm.period_months)

    const payload = {
      customers_id: selectedCustomer.value.$id,
      services_id: selectedService.value.$id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      state: 'active',
      period_months: subscriptionForm.period_months,
      quantity: subscriptionForm.quantity,
      cost_price: subscriptionForm.cost_price,
      sell_price: subscriptionForm.sell_price,
      comment: subscriptionForm.comment,
      customers_idx: selectedCustomer.value.name
    }

    // Добавляем данные аккаунта для membership
    if (selectedPlanType.value === 'membership' && selectedAccount.value) {
      payload.accounts_id = selectedAccount.value.$id
      // TODO: Добавить логику выбора конкретного места
    }

    await createSubscriptionMutation(payload)
    
    router.push({
      name: 'subscriptions',
      query: { success: 'created' }
    })
  } catch (error) {
    console.error('Ошибка создания подписки:', error)
  }
}
</script>

<style scoped>
.new-subscription-page {
  padding: 32px;
  max-width: 1200px;
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

.progress-card,
.step-content-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin-bottom: 24px;
}

.subscription-stepper {
  width: 100%;
}

.step-content {
  min-height: 400px;
}

.step-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 24px 0;
}

/* Шаг 1: Выбор клиента */
.client-selection {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.client-search {
  max-width: 400px;
}

.clients-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.client-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--va-background-primary);
  border: 2px solid var(--va-background-element);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.client-item:hover {
  border-color: var(--va-primary);
  transform: translateY(-1px);
}

.client-item.client-selected {
  border-color: var(--va-success);
  background: rgba(29, 185, 84, 0.05);
}

.client-info {
  flex: 1;
}

.client-name {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.client-contact {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.create-new-client {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
}

/* Шаг 2: Выбор сервиса */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.service-card {
  padding: 20px;
  background: var(--va-background-primary);
  border: 2px solid var(--va-background-element);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.service-card:hover {
  border-color: var(--va-primary);
  transform: translateY(-2px);
}

.service-card.service-selected {
  border-color: var(--va-success);
  background: rgba(29, 185, 84, 0.05);
}

.service-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.service-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.plan-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-types h4 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.plan-type-radio {
  margin: 0;
}

/* Шаг 3: Выбор места */
.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: var(--va-background-primary);
  border: 2px solid var(--va-background-element);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-item:hover {
  border-color: var(--va-primary);
  transform: translateY(-1px);
}

.account-item.account-selected {
  border-color: var(--va-success);
  background: rgba(29, 185, 84, 0.05);
}

.account-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
}

.account-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--va-text-secondary);
}

.no-accounts {
  text-align: center;
  padding: 40px;
}

/* Шаг 4: Детали подписки */
.subscription-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-input {
  width: 100%;
}

/* Шаг 5: Подтверждение */
.confirmation-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 12px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.summary-name {
  font-weight: 600;
  color: var(--va-text-primary);
}

.summary-contact {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row span:first-child {
  color: var(--va-text-secondary);
}

.detail-row span:last-child {
  font-weight: 600;
  color: var(--va-text-primary);
}

/* Навигация */
.step-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--va-background-element);
}

/* Адаптивность */
@media (max-width: 768px) {
  .new-subscription-page {
    padding: 16px;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .account-details {
    flex-direction: column;
    gap: 8px;
  }
}
</style>