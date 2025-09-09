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
          <va-tab name="all">
            Все аккаунты
          </va-tab>
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
            
            <div v-else-if="displayedAccounts.length" class="accounts-grid">
              <va-card 
                v-for="account in displayedAccounts" 
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
                  <span v-if="isAccountExpiringSoon(account)" class="expiring-warning">⚠️ Истекает скоро!</span>
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
              <p v-if="activeServiceTab === 'all'">Пока нет созданных аккаунтов</p>
              <p v-else>Для сервиса {{ getServiceName(activeServiceTab) }} пока нет созданных аккаунтов</p>
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
      @add-client="handleAddClient"
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

    <!-- Модальное окно редактирования аккаунта -->
    <va-modal 
      v-model="showEditModal" 
      title="Редактировать аккаунт"
      size="large"
      @close="closeEditModal"
    >
      <div class="create-account-form">
        <div class="form-row">
          <va-select
            v-model="editForm.services_id"
            label="Сервис *"
            :options="services"
            text-by="name"
            value-by="$id"
            :rules="[v => !!v || 'Сервис обязателен']"
            class="form-input"
          />
          <va-select
            v-model="editForm.regions_id"
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
            v-model="editForm.login" 
            label="Логин *" 
            :rules="[v => !!v || 'Логин обязателен']"
            class="form-input"
          />
          <va-input 
            v-model="editForm.password" 
            label="Пароль *" 
            type="password"
            :rules="[v => !!v || 'Пароль обязателен']"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="editForm.max_seats" 
            label="Максимум мест *" 
            type="number"
            :min="1"
            :max="10"
            :rules="[v => !!v || 'Количество мест обязательно']"
            class="form-input"
          />
          <va-input 
            v-model="editForm.service_login_key" 
            label="Ключ аккаунта" 
            placeholder="Например: SPAC-0001"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="editForm.cost_price" 
            label="Цена закупки" 
            type="number"
            :min="0"
            class="form-input"
          />
          <va-input 
            v-model="editForm.sell_price" 
            label="Цена продажи" 
            type="number"
            :min="0"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-date-input
            v-model="editForm.paid_until"
            label="Оплачено до"
            class="form-input"
          />
          <va-select
            v-model="editForm.status"
            label="Статус"
            :options="[
              { text: 'Активен', value: 'active' },
              { text: 'Неактивен', value: 'inactive' }
            ]"
            text-by="text"
            value-by="value"
            class="form-input"
          />
        </div>

        <va-textarea 
          v-model="editForm.household_address" 
          label="Адрес домохозяйства"
          rows="2"
          class="form-input"
        />

        <va-checkbox 
          v-model="editForm.is_auto_funded"
          label="Автоматическое финансирование"
        />
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="closeEditModal">
            Отмена
          </va-button>
          <va-button 
            :loading="creating" 
            @click="handleUpdateAccount"
            :disabled="!isEditFormValid"
          >
            Сохранить изменения
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
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from '@/composables/useAccountsApi'
import { useServices } from '@/composables/useServicesApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import AccountDetails from '@/components/AccountDetails.vue'

const router = useRouter()

// Проверка авторизации
onMounted(async () => {
  try {
    await account.get()
    console.log('Auth successful')
  } catch {
    router.replace('/login')
  }
})

// Данные
const { data: accounts, isLoading: accountsLoading } = useAccounts()
const { data: services } = useServices()
const { data: regions } = useRegions()
const { mutateAsync: createAccount, isLoading: creating } = useCreateAccount()
const { mutateAsync: deleteAccount } = useDeleteAccount()
const { mutateAsync: updateAccount } = useUpdateAccount()

// Отладка данных
watch(accounts, (newAccounts) => {
  console.log('Accounts data:', newAccounts)
}, { immediate: true })

watch(services, (newServices) => {
  console.log('Services data:', newServices)
}, { immediate: true })

watch(accountsLoading, (loading) => {
  console.log('Accounts loading:', loading)
}, { immediate: true })

// Состояние
const activeServiceTab = ref('')
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedAccount = ref(null)
const isEditMode = ref(false)

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
  seats_taken: 0
})

// Форма редактирования аккаунта (копия createForm)
const editForm = reactive({
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
  status: 'active'
})

// Устанавливаем первый сервис как активный при загрузке
onMounted(() => {
  activeServiceTab.value = 'all'
})

// Вычисляемые свойства
const displayedAccounts = computed(() => {
  console.log('displayedAccounts computed re-evaluated')
  console.log('activeServiceTab.value:', activeServiceTab.value)
  console.log('accounts.value (in computed):', accounts.value)

  if (!accounts.value) {
    return []
  }

  if (activeServiceTab.value === 'all') {
    return accounts.value
  } else {
    return accounts.value.filter(account => account.services_id === activeServiceTab.value)
  }
})

const isCreateFormValid = computed(() => {
  return createForm.services_id && 
         createForm.regions_id && 
         createForm.login && 
         createForm.password && 
         createForm.max_seats > 0
})

const isEditFormValid = computed(() => {
  return editForm.services_id && 
         editForm.regions_id && 
         editForm.login && 
         editForm.password && 
         editForm.max_seats > 0
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

function getActiveAccountsCount() {
  if (!accounts.value) return 0
  return accounts.value.filter(account => account.status === 'active').length
}

function getExpiringAccountsCount() {
  if (!accounts.value) return 0
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  
  return accounts.value.filter(account => {
    if (!account.paid_until) return false
    const paidUntil = new Date(account.paid_until)
    return paidUntil <= threeDaysFromNow && paidUntil > new Date()
  }).length
}

function getFullAccountsCount() {
  if (!accounts.value) return 0
  return accounts.value.filter(account => 
    (account.seats_taken || 0) >= (account.max_seats || 0)
  ).length
}

function isAccountExpiringSoon(account) {
  if (!account.paid_until) return false
  const paidUntil = new Date(account.paid_until)
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  return paidUntil <= threeDaysFromNow && paidUntil > new Date()
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
  console.log('Edit account:', account)
  
  // Заполняем форму редактирования данными аккаунта
  Object.assign(editForm, {
    services_id: account.services_id || '',
    regions_id: account.regions_id || '',
    login: account.login || '',
    password: account.password || '',
    max_seats: account.max_seats || 5,
    service_login_key: account.service_login_key || '',
    cost_price: account.cost_price || 0,
    sell_price: account.sell_price || 0,
    paid_until: account.paid_until || null,
    household_address: account.household_address || '',
    is_auto_funded: account.is_auto_funded || false,
    status: account.status || 'active'
  })
  
  selectedAccount.value = account
  isEditMode.value = true
  showEditModal.value = true
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

function handleAddClient(account) {
  // Перенаправляем на создание подписки с предвыбранным аккаунтом
  router.push({
    name: 'new-subscription',
    query: { 
      accountId: account.$id
    }
  })
}

function closeCreateModal() {
  showCreateModal.value = false
  resetCreateForm()
}

function closeEditModal() {
  showEditModal.value = false
  selectedAccount.value = null
  isEditMode.value = false
  resetEditForm()
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
    seats_taken: 0
  })
}

function resetEditForm() {
  Object.assign(editForm, {
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
    status: 'active'
  })
}

async function handleCreateAccount() {
  if (!isCreateFormValid.value) return

  try {
    // Создаем payload только с полями, которые существуют в схеме Appwrite
    const payload = {
      services_id: createForm.services_id,
      regions_id: createForm.regions_id,
      login: createForm.login,
      password: createForm.password,
      max_seats: createForm.max_seats,
      service_login_key: createForm.service_login_key || '',
      cost_price: createForm.cost_price || 0,
      sell_price: createForm.sell_price || 0,
      paid_until: createForm.paid_until,
      household_address: createForm.household_address || '',
      is_auto_funded: createForm.is_auto_funded,
      status: createForm.status,
      seats_taken: 0
    }

    await createAccount(payload)
    closeCreateModal()
  } catch (error) {
    console.error('Ошибка создания аккаунта:', error)
    alert(`Ошибка при создании аккаунта: ${error.message || 'Неизвестная ошибка'}`)
  }
}

async function handleUpdateAccount() {
  if (!isEditFormValid.value || !selectedAccount.value) return

  try {
    const payload = {
      id: selectedAccount.value.$id,
      services_id: editForm.services_id,
      regions_id: editForm.regions_id,
      login: editForm.login,
      password: editForm.password,
      max_seats: editForm.max_seats,
      service_login_key: editForm.service_login_key || '',
      cost_price: editForm.cost_price || 0,
      sell_price: editForm.sell_price || 0,
      paid_until: editForm.paid_until,
      household_address: editForm.household_address || '',
      is_auto_funded: editForm.is_auto_funded,
      status: editForm.status
    }

    await updateAccount(payload)
    closeEditModal()
  } catch (error) {
    console.error('Ошибка обновления аккаунта:', error)
    alert(`Ошибка при обновлении аккаунта: ${error.message || 'Неизвестная ошибка'}`)
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

.expiring-warning {
  color: var(--va-warning) !important;
  font-weight: 600;
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
  
  .filters-row {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
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