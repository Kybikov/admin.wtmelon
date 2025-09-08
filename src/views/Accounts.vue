<template>
  <div class="accounts-page">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Аккаунты и семьи</h1>
        <p class="page-subtitle">Управление семейными аккаунтами сервисов</p>
      </div>
      <va-button @click="showCreateModal = true" size="large">
        <va-icon name="add" class="mr-1" />
        Добавить аккаунт
      </va-button>
    </div>

    <!-- Вкладки по сервисам -->
    <va-card class="services-tabs-card">
      <va-tabs v-model="activeServiceTab" class="services-tabs">
        <template #tabs>
          <va-tab 
            v-for="service in services" 
            :key="service.$id"
            :name="service.$id"
          >
            {{ service.name }}
          </va-tab>
        </template>
        
        <template #default="{ tabValue }">
          <div class="tab-content">
            <div v-if="accountsLoading" class="loading-accounts">
              <va-progress-circle indeterminate size="large" />
              <p>Загрузка аккаунтов...</p>
            </div>
            
            <div v-else-if="getAccountsByService(tabValue)?.length" class="accounts-grid">
              <va-card 
                v-for="account in getAccountsByService(tabValue)" 
                :key="account.$id"
                class="account-card"
                :class="{ 'account-full': account.seats_taken >= account.max_seats }"
              >
                <div class="account-header">
                  <div class="account-title">
                    <h3>[{{ account.service_login_key || 'N/A' }}] {{ getServiceName(account.services_id) }}</h3>
                    <va-chip 
                      :color="account.status === 'active' ? 'success' : 'danger'" 
                      size="small"
                    >
                      {{ account.status === 'active' ? 'Активен' : 'Неактивен' }}
                    </va-chip>
                  </div>
                  <div class="account-actions">
                    <va-button 
                      preset="plain" 
                      size="small" 
                      @click="viewAccountDetails(account)"
                    >
                      Детали
                    </va-button>
                    <va-button 
                      preset="primary" 
                      size="small"
                      :disabled="account.seats_taken >= account.max_seats"
                      @click="addClientToAccount(account)"
                    >
                      Добавить клиента
                    </va-button>
                  </div>
                </div>

                <div class="account-info">
                  <div class="info-row">
                    <span class="info-label">Занято:</span>
                    <span class="info-value">
                      {{ account.seats_taken || 0 }}/{{ account.max_seats || 0 }} мест
                    </span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Админ:</span>
                    <span class="info-value">
                      {{ account.seats_taken > 0 ? 'Занят' : 'Свободен' }}
                    </span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Истекает:</span>
                    <span class="info-value">
                      {{ formatDate(account.paid_until) }}
                    </span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">Регион:</span>
                    <span class="info-value">
                      {{ getRegionName(account.regions_id) }}
                    </span>
                  </div>
                </div>

                <div class="account-progress">
                  <va-progress-bar 
                    :model-value="(account.seats_taken / account.max_seats) * 100"
                    :color="account.seats_taken >= account.max_seats ? 'danger' : 'primary'"
                    size="small"
                  />
                </div>
              </va-card>
            </div>
            
            <div v-else class="no-accounts">
              <va-icon name="account_box" size="64px" color="secondary" />
              <h3>Нет аккаунтов</h3>
              <p>Для сервиса {{ getServiceName(tabValue) }} пока нет созданных аккаунтов</p>
              <va-button @click="showCreateModal = true">
                Создать первый аккаунт
              </va-button>
            </div>
          </div>
        </template>
      </va-tabs>
    </va-card>

    <!-- Модальное окно деталей аккаунта -->
    <AccountDetails
      v-model="showDetailsModal"
      :account="selectedAccount"
      @edit="editAccount"
      @assign-seat="handleAssignSeat"
    />

    <!-- Модальное окно создания аккаунта -->
    <va-modal 
      v-model="showCreateModal" 
      title="Создать аккаунт"
      size="large"
      @close="closeCreateModal"
    >
      <div class="create-account-form">
        <div class="form-row">
          <va-select
            v-model="createForm.services_id"
            label="Сервис *"
            :options="services"
            text-by="name"
            value-by="$id"
            :rules="[v => !!v || 'Сервис обязателен']"
            class="form-input"
          />
          <va-select
            v-model="createForm.regions_id"
            label="Регион *"
            :options="regions"
            text-by="name"
            value-by="$id"
            :rules="[v => !!v || 'Регион обязателен']"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="createForm.login" 
            label="Логин *" 
            :rules="[v => !!v || 'Логин обязателен']"
            class="form-input"
          />
          <va-input 
            v-model="createForm.password" 
            label="Пароль *" 
            type="password"
            :rules="[v => !!v || 'Пароль обязателен']"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="createForm.max_seats" 
            label="Максимум мест *" 
            type="number"
            :min="1"
            :max="10"
            :rules="[v => !!v || 'Количество мест обязательно']"
            class="form-input"
          />
          <va-input 
            v-model="createForm.service_login_key" 
            label="Ключ аккаунта" 
            placeholder="Например: SPAC-0001"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="createForm.cost_price" 
            label="Цена закупки" 
            type="number"
            :min="0"
            class="form-input"
          />
          <va-input 
            v-model="createForm.sell_price" 
            label="Цена продажи" 
            type="number"
            :min="0"
            class="form-input"
          />
        </div>

        <va-date-input
          v-model="createForm.paid_until"
          label="Оплачено до"
          class="form-input"
        />

        <va-textarea 
          v-model="createForm.household_address" 
          label="Адрес домохозяйства"
          rows="2"
          class="form-input"
        />

        <va-checkbox 
          v-model="createForm.is_auto_funded"
          label="Автоматическое финансирование"
        />
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="closeCreateModal">
            Отмена
          </va-button>
          <va-button 
            :loading="creating" 
            @click="handleCreateAccount"
            :disabled="!isCreateFormValid"
          >
            Создать аккаунт
          </va-button>
        </div>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { account } from '@/appwrite/client'
import { useAccounts, useCreateAccount } from '@/composables/useAccountsApi'
import { useServices } from '@/composables/useServicesApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import AccountDetails from '@/components/AccountDetails.vue'

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
const { data: accounts, isLoading: accountsLoading } = useAccounts()
const { data: services } = useServices()
const { data: regions } = useRegions()
const { mutateAsync: createAccount, isLoading: creating } = useCreateAccount()

// Состояние
const activeServiceTab = ref('')
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const selectedAccount = ref(null)

// Форма создания аккаунта
const createForm = reactive({
  services_id: '',
  regions_id: '',
  login: '',
  password: '',
  max_seats: 5,
  service_login_key: '',
  cost_price: 0,
  sell_price: 0,
  paid_until: null,
  household_address: '',
  is_auto_funded: false,
  status: 'active',
  seats_taken: 0,
  seats_free: 5
})

// Устанавливаем первый сервис как активный при загрузке
computed(() => {
  if (services.value?.length && !activeServiceTab.value) {
    activeServiceTab.value = services.value[0].$id
  }
})

// Вычисляемые свойства
const isCreateFormValid = computed(() => {
  return createForm.services_id && 
         createForm.regions_id && 
         createForm.login && 
         createForm.password && 
         createForm.max_seats > 0
})

// Методы
function getAccountsByService(serviceId) {
  if (!accounts.value || !serviceId) return []
  return accounts.value.filter(account => account.services_id === serviceId)
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

function viewAccountDetails(account) {
  selectedAccount.value = account
  showDetailsModal.value = true
}

function editAccount(account) {
  // TODO: Реализовать редактирование аккаунта
  console.log('Edit account:', account)
}

function addClientToAccount(account) {
  // Перенаправляем на создание подписки с предвыбранным аккаунтом
  router.push({
    name: 'new-subscription',
    query: { accountId: account.$id }
  })
}

function handleAssignSeat({ account, seat }) {
  // Перенаправляем на создание подписки с предвыбранным местом
  router.push({
    name: 'new-subscription',
    query: { 
      accountId: account.$id,
      seatId: seat.$id 
    }
  })
}

function closeCreateModal() {
  showCreateModal.value = false
  resetCreateForm()
}

function resetCreateForm() {
  Object.assign(createForm, {
    services_id: '',
    regions_id: '',
    login: '',
    password: '',
    max_seats: 5,
    service_login_key: '',
    cost_price: 0,
    sell_price: 0,
    paid_until: null,
    household_address: '',
    is_auto_funded: false,
    status: 'active',
    seats_taken: 0,
    seats_free: 5
  })
}

async function handleCreateAccount() {
  if (!isCreateFormValid.value) return

  try {
    const payload = {
      ...createForm,
      seats_free: createForm.max_seats - createForm.seats_taken
    }
    
    await createAccount(payload)
    closeCreateModal()
  } catch (error) {
    console.error('Ошибка создания аккаунта:', error)
  }
}
</script>

<style scoped>
.accounts-page {
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

/* Вкладки сервисов */
.services-tabs-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.services-tabs {
  width: 100%;
}

.tab-content {
  padding-top: 24px;
}

.loading-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 16px;
}

/* Сетка аккаунтов */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.account-card {
  background: var(--va-background-primary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 20px !important;
  transition: all 0.2s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.account-card.account-full {
  border-color: var(--va-danger);
  background: rgba(239, 68, 68, 0.05) !important;
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.account-title h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.account-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.account-progress {
  margin-top: 12px;
}

/* Пустое состояние */
.no-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.no-accounts h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 16px 0 8px 0;
}

.no-accounts p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 24px 0;
}

/* Форма создания */
.create-account-form {
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

/* Адаптивность */
@media (max-width: 768px) {
  .accounts-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .account-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .account-actions {
    justify-content: flex-end;
  }
}
</style>