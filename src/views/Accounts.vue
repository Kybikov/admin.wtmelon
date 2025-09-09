<template>
  <div class="accounts-page">
    <!-- Заголовок страницы -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Аккаунты</h1>
        <p class="page-subtitle">Управление семейными аккаунтами и местами</p>
      </div>
      <va-button @click="showCreateModal = true" size="large">
        <va-icon name="add" class="mr-1" />
        Создать аккаунт
      </va-button>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon blue">
            <va-icon name="account_box" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ filteredAccounts.length }}</div>
            <div class="stat-label">Найдено аккаунтов</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon green">
            <va-icon name="check_circle" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ activeAccountsCount }}</div>
            <div class="stat-label">Активных</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon red">
            <va-icon name="people" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ fullAccountsCount }}</div>
            <div class="stat-label">Полных</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orange">
            <va-icon name="schedule" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ expiringSoonCount }}</div>
            <div class="stat-label">Истекают скоро</div>
          </div>
        </div>
      </va-card>
    </div>

    <!-- Поиск и фильтры -->
    <va-card class="modern-filters-card">
      <div class="filters-toolbar">
        <!-- Поиск -->
        <div class="search-section">
          <va-input 
            v-model="searchQuery" 
            placeholder="Поиск по логину, ключу, адресу или тегам..."
            class="modern-search"
          >
            <template #prependInner>
              <va-icon name="search" size="20px" />
            </template>
          </va-input>
        </div>

        <!-- Фильтры в дропдаунах -->
        <div class="filters-section">
          <!-- Фильтр по сервисам -->
          <va-dropdown class="filter-dropdown">
            <template #anchor>
              <va-button preset="secondary" class="filter-button">
                <va-icon name="business" size="16px" class="mr-1" />
                Сервисы
                <va-badge 
                  v-if="getSelectedServicesCount() > 0" 
                  :text="getSelectedServicesCount()"
                  color="primary"
                  class="ml-1"
                />
                <va-icon name="expand_more" size="16px" class="ml-1" />
              </va-button>
            </template>
            <div class="dropdown-content">
              <div class="dropdown-header">
                <span>Выберите сервисы</span>
                <va-button 
                  preset="plain" 
                  size="small"
                  @click="clearServicesFilter"
                >
                  Очистить
                </va-button>
              </div>
              <div class="checkbox-list">
                <va-checkbox 
                  v-model="selectAllServices"
                  label="Все сервисы"
                  class="checkbox-item"
                  @change="toggleAllServices"
                />
                <va-divider />
                <va-checkbox 
                  v-for="service in services" 
                  :key="service.$id"
                  v-model="selectedServices"
                  :array-value="service.$id"
                  :label="service.name"
                  class="checkbox-item"
                />
              </div>
            </div>
          </va-dropdown>

          <!-- Фильтр по регионам -->
          <va-dropdown class="filter-dropdown">
            <template #anchor>
              <va-button preset="secondary" class="filter-button">
                <va-icon name="location_on" size="16px" class="mr-1" />
                Регионы
                <va-badge 
                  v-if="getSelectedRegionsCount() > 0" 
                  :text="getSelectedRegionsCount()"
                  color="primary"
                  class="ml-1"
                />
                <va-icon name="expand_more" size="16px" class="ml-1" />
              </va-button>
            </template>
            <div class="dropdown-content">
              <div class="dropdown-header">
                <span>Выберите регионы</span>
                <va-button 
                  preset="plain" 
                  size="small"
                  @click="clearRegionsFilter"
                >
                  Очистить
                </va-button>
              </div>
              <div class="checkbox-list">
                <va-checkbox 
                  v-model="selectAllRegions"
                  label="Все регионы"
                  class="checkbox-item"
                  @change="toggleAllRegions"
                />
                <va-divider />
                <va-checkbox 
                  v-for="region in regions" 
                  :key="region.$id"
                  v-model="selectedRegions"
                  :array-value="region.$id"
                  :label="region.name"
                  class="checkbox-item"
                />
              </div>
            </div>
          </va-dropdown>

          <!-- Фильтр по заполненности -->
          <va-dropdown class="filter-dropdown">
            <template #anchor>
              <va-button preset="secondary" class="filter-button">
                <va-icon name="people" size="16px" class="mr-1" />
                Заполненность
                <va-badge 
                  v-if="getSelectedOccupancyCount() > 0" 
                  :text="getSelectedOccupancyCount()"
                  color="primary"
                  class="ml-1"
                />
                <va-icon name="expand_more" size="16px" class="ml-1" />
              </va-button>
            </template>
            <div class="dropdown-content">
              <div class="dropdown-header">
                <span>Заполненность мест</span>
                <va-button 
                  preset="plain" 
                  size="small"
                  @click="clearOccupancyFilter"
                >
                  Очистить
                </va-button>
              </div>
              <div class="checkbox-list">
                <va-checkbox 
                  v-model="selectedOccupancy"
                  array-value="empty"
                  label="Пустые (0 мест)"
                  class="checkbox-item"
                />
                <va-checkbox 
                  v-model="selectedOccupancy"
                  array-value="partial"
                  label="Частично заняты"
                  class="checkbox-item"
                />
                <va-checkbox 
                  v-model="selectedOccupancy"
                  array-value="full"
                  label="Полностью заняты"
                  class="checkbox-item"
                />
              </div>
            </div>
          </va-dropdown>

          <!-- Фильтр по статусу -->
          <va-dropdown class="filter-dropdown">
            <template #anchor>
              <va-button preset="secondary" class="filter-button">
                <va-icon name="toggle_on" size="16px" class="mr-1" />
                Статус
                <va-badge 
                  v-if="getSelectedStatusesCount() > 0" 
                  :text="getSelectedStatusesCount()"
                  color="primary"
                  class="ml-1"
                />
                <va-icon name="expand_more" size="16px" class="ml-1" />
              </va-button>
            </template>
            <div class="dropdown-content">
              <div class="dropdown-header">
                <span>Статус аккаунта</span>
                <va-button 
                  preset="plain" 
                  size="small"
                  @click="clearStatusesFilter"
                >
                  Очистить
                </va-button>
              </div>
              <div class="checkbox-list">
                <va-checkbox 
                  v-model="selectedStatuses"
                  array-value="active"
                  label="Активные"
                  class="checkbox-item"
                />
                <va-checkbox 
                  v-model="selectedStatuses"
                  array-value="inactive"
                  label="Неактивные"
                  class="checkbox-item"
                />
              </div>
            </div>
          </va-dropdown>

          <!-- Фильтр по дате -->
          <va-dropdown class="filter-dropdown">
            <template #anchor>
              <va-button preset="secondary" class="filter-button">
                <va-icon name="schedule" size="16px" class="mr-1" />
                Дата истечения
                <va-badge 
                  v-if="hasDateFilter" 
                  text="1"
                  color="primary"
                  class="ml-1"
                />
                <va-icon name="expand_more" size="16px" class="ml-1" />
              </va-button>
            </template>
            <div class="dropdown-content date-dropdown">
              <div class="dropdown-header">
                <span>Фильтр по дате истечения</span>
                <va-button 
                  preset="plain" 
                  size="small"
                  @click="clearDateFilters"
                >
                  Очистить
                </va-button>
              </div>
              <div class="date-filters-content">
                <div class="date-inputs">
                  <va-date-input
                    v-model="dateFrom"
                    label="С даты"
                    class="date-input"
                    size="small"
                  />
                  <va-date-input
                    v-model="dateTo"
                    label="До даты"
                    class="date-input"
                    size="small"
                  />
                </div>
                <div class="quick-date-buttons">
                  <va-button 
                    preset="secondary" 
                    size="small"
                    @click="setQuickDateFilter('expiring')"
                    class="quick-date-btn"
                  >
                    Истекают скоро
                  </va-button>
                  <va-button 
                    preset="secondary" 
                    size="small"
                    @click="setQuickDateFilter('expired')"
                    class="quick-date-btn"
                  >
                    Просроченные
                  </va-button>
                </div>
              </div>
            </div>
          </va-dropdown>

          <!-- Кнопка очистки всех фильтров -->
          <va-button 
            v-if="hasActiveFilters"
            preset="plain" 
            color="danger"
            @click="clearAllFilters"
            class="clear-all-btn"
          >
            <va-icon name="clear" size="16px" class="mr-1" />
            Очистить все
          </va-button>
        </div>
      </div>

      <!-- Активные фильтры (теги) -->
      <div v-if="activeFilterTags.length" class="active-filters">
        <span class="active-filters-label">Активные фильтры:</span>
        <div class="filter-tags">
          <va-chip
            v-for="tag in activeFilterTags"
            :key="tag.key"
            size="small"
            color="primary"
            closeable
            @close="removeFilterTag(tag)"
            class="filter-tag"
          >
            {{ tag.label }}
          </va-chip>
        </div>
      </div>
    </va-card>

    <!-- Список аккаунтов -->
    <div v-if="isLoading" class="loading-accounts">
      <va-progress-circle indeterminate size="large" />
      <p>Загрузка аккаунтов...</p>
    </div>
    
    <div v-else-if="filteredAccounts.length" class="accounts-grid">
      <va-card 
        v-for="account in filteredAccounts" 
        :key="account.$id"
        class="account-card"
        @click="viewAccount(account)"
      >
        <div class="account-header">
          <div class="account-title">
            <h3>[{{ account.service_login_key || 'N/A' }}] {{ account.login }}</h3>
            <div class="account-badges">
              <va-chip 
                :color="account.status === 'active' ? 'success' : 'danger'" 
                size="small"
              >
                {{ account.status === 'active' ? 'Активен' : 'Неактивен' }}
              </va-chip>
              <va-chip 
                v-if="isExpiringSoon(account.paid_until)" 
                color="warning" 
                size="small"
              >
                Истекает скоро
              </va-chip>
            </div>
          </div>
        </div>

        <div class="account-info">
          <div class="info-row">
            <va-icon name="business" size="16px" />
            <span>{{ getServiceName(account.services_id) }}</span>
          </div>
          <div class="info-row">
            <va-icon name="location_on" size="16px" />
            <span>{{ getRegionName(account.regions_id) }}</span>
          </div>
          <div class="info-row">
            <va-icon name="schedule" size="16px" />
            <span>До {{ formatDate(account.paid_until) }}</span>
          </div>
          <div class="info-row">
            <va-icon name="home" size="16px" />
            <span>{{ account.household_address || 'Адрес не указан' }}</span>
          </div>
        </div>

        <div class="account-stats">
          <div class="seats-info">
            <div class="seats-count">
              <span class="seats-occupied">{{ account.seats_taken || 0 }}</span>
              <span class="seats-separator">/</span>
              <span class="seats-total">{{ account.max_seats || 0 }}</span>
            </div>
            <div class="seats-label">мест занято</div>
          </div>
          
          <va-progress-bar 
            :model-value="getSeatsFillPercentage(account)"
            :color="getSeatsFillColor(account)"
            size="small"
            class="seats-progress"
          />
        </div>

        <div class="account-actions">
          <va-button 
            size="small" 
            preset="secondary"
            @click.stop="addClientToAccount(account)"
            :disabled="!canAddClient(account)"
          >
            <va-icon name="person_add" size="16px" />
            Добавить клиента
          </va-button>
          <va-button 
            size="small" 
            preset="plain"
            @click.stop="editAccount(account)"
          >
            <va-icon name="edit" size="16px" />
          </va-button>
        </div>
      </va-card>
    </div>

    <div v-else class="no-accounts">
      <va-icon name="account_box" size="64px" color="secondary" />
      <h3>{{ getNoAccountsMessage() }}</h3>
      <p>{{ getNoAccountsDescription() }}</p>
      <va-button v-if="hasActiveFilters" @click="clearAllFilters">
        Очистить фильтры
      </va-button>
      <va-button v-else @click="showCreateModal = true">
        Создать первый аккаунт
      </va-button>
    </div>

    <!-- Модальные окна -->
    <AccountDetails
      v-model="showDetailsModal"
      :account="selectedAccount"
      @edit="editAccount"
      @add-client="addClientToAccount"
    />

    <!-- Модальное окно создания/редактирования аккаунта -->
    <va-modal 
      v-model="showCreateModal" 
      :title="isEditMode ? 'Редактировать аккаунт' : 'Создать аккаунт'"
      size="large"
      hide-default-actions
    >
      <div class="account-form">
        <div class="form-row">
          <va-select
            v-model="accountForm.services_id"
            label="Сервис *"
            :options="services"
            text-by="name"
            value-by="$id"
            :rules="[v => !!v || 'Сервис обязателен']"
            class="form-input"
          />
          <va-select
            v-model="accountForm.regions_id"
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
            v-model="accountForm.login" 
            label="Логин *" 
            :rules="[v => !!v || 'Логин обязателен']"
            class="form-input"
          />
          <va-input 
            v-model="accountForm.password" 
            label="Пароль" 
            type="password"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="accountForm.service_login_key" 
            label="Ключ аккаунта" 
            class="form-input"
          />
          <va-input 
            v-model="accountForm.max_seats" 
            label="Максимум мест *" 
            type="number"
            :min="1"
            :rules="[v => !!v || 'Количество мест обязательно']"
            class="form-input"
          />
        </div>

        <div class="form-row">
          <va-input 
            v-model="accountForm.cost_price" 
            label="Цена закупки" 
            type="number"
            :min="0"
            class="form-input"
          />
          <va-input 
            v-model="accountForm.sell_price" 
            label="Цена продажи" 
            type="number"
            :min="0"
            class="form-input"
          />
        </div>

        <va-date-input
          v-model="accountForm.paid_until"
          label="Оплачено до *"
          :rules="[v => !!v || 'Дата обязательна']"
          class="form-input"
        />

        <va-input 
          v-model="accountForm.household_address" 
          label="Адрес домохозяйства" 
          class="form-input"
        />

        <va-checkbox
          v-model="accountForm.is_auto_funded"
          label="Автоматическое финансирование"
          class="form-input"
        />
      </div>

      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="closeCreateModal">
            Отмена
          </va-button>
          <va-button 
            :loading="creating || updating" 
            @click="handleSubmit"
            :disabled="!isFormValid"
          >
            {{ isEditMode ? 'Сохранить' : 'Создать' }}
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
import { useAccounts, useCreateAccount, useUpdateAccount } from '@/composables/useAccountsApi'
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
const { data: accounts, isLoading } = useAccounts()
const { data: services } = useServices()
const { data: regions } = useRegions()
const { mutateAsync: createAccount, isLoading: creating } = useCreateAccount()
const { mutateAsync: updateAccount, isLoading: updating } = useUpdateAccount()

// Состояние поиска и фильтров
const searchQuery = ref('')
const selectedServices = ref(['all'])
const selectedRegions = ref(['all'])
const selectedOccupancy = ref(['all'])
const selectedStatuses = ref(['all'])
const dateFrom = ref(null)
const dateTo = ref(null)

// Состояние для управления "Выбрать все"
const selectAllServices = ref(true)
const selectAllRegions = ref(true)

// Модальные окна
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const selectedAccount = ref(null)
const isEditMode = ref(false)

// Форма аккаунта
const accountForm = reactive({
  services_id: '',
  regions_id: '',
  login: '',
  password: '',
  service_login_key: '',
  max_seats: 1,
  cost_price: 0,
  sell_price: 0,
  paid_until: null,
  household_address: '',
  is_auto_funded: false,
  status: 'active'
})

// Вычисляемые свойства
const filteredAccounts = computed(() => {
  if (!accounts.value) return []
  
  let filtered = accounts.value
  
  // Поиск
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(account => 
      account.login?.toLowerCase().includes(query) ||
      account.service_login_key?.toLowerCase().includes(query) ||
      account.household_address?.toLowerCase().includes(query)
      (Array.isArray(account.tags) && account.tags.some(tag => tag?.toLowerCase().includes(query)))
  }
  
  // Фильтр по сервисам
  if (Array.isArray(selectedServices.value) && !selectedServices.value.includes('all') && selectedServices.value.length > 0) {
    filtered = filtered.filter(account => 
      selectedServices.value.includes(account.services_id)
    )
  }
  
  if (Array.isArray(selectedRegions.value) && !selectedRegions.value.includes('all') && selectedRegions.value.length > 0) {
  if (Array.isArray(selectedRegions.value) && !selectedRegions.value.includes('all') && selectedRegions.value.length > 0) {
    filtered = filtered.filter(account => 
      selectedRegions.value.includes(account.regions_id)
    )
  }
  
  // Фильтр по заполненности
  if (Array.isArray(selectedOccupancy.value) && !selectedOccupancy.value.includes('all') && selectedOccupancy.value.length > 0) {
// Существующие теги из аккаунтов
const existingTags = computed(() => {
  if (!Array.isArray(accounts.value)) return []
  
  const allTags = new Set()
  accounts.value.forEach(account => {
  if (Array.isArray(selectedOccupancy.value) && !selectedOccupancy.value.includes('all') && selectedOccupancy.value.length > 0) {
      account.tags.forEach(tag => {
        if (tag && typeof tag === 'string' && tag.trim()) {
          allTags.add(tag.trim())
        }
      })
    }
  })
  
  return Array.from(allTags).sort()
})

    filtered = filtered.filter(account => {
      const seatsTaken = account.seats_taken || 0
      const maxSeats = account.max_seats || 0
      
      return selectedOccupancy.value.some(occupancy => {
  if (Array.isArray(selectedServices.value) && !selectedServices.value.includes('all') && selectedServices.value.length > 0) {
          case 'empty':
            return seatsTaken === 0
  if (Array.isArray(selectedStatuses.value) && !selectedStatuses.value.includes('all') && selectedStatuses.value.length > 0) {
            return seatsTaken > 0 && seatsTaken < maxSeats
          case 'full':
            return seatsTaken >= maxSeats
          default:
            return true
        }
      })
    })
  }
  
  // Фильтр по статусу
  if (Array.isArray(selectedStatuses.value) && !selectedStatuses.value.includes('all') && selectedStatuses.value.length > 0) {
    filtered = filtered.filter(account => 
      selectedStatuses.value.includes(account.status)
    )
  }
  
  // Фильтр по дате
  if (dateFrom.value) {
    filtered = filtered.filter(account => 
      new Date(account.paid_until) >= new Date(dateFrom.value)
    )
  }
  
  if (dateTo.value) {
    filtered = filtered.filter(account => 
      new Date(account.paid_until) <= new Date(dateTo.value)
    )
  }
  
  return filtered
})

const activeAccountsCount = computed(() => {
  return filteredAccounts.value.filter(account => account.status === 'active').length
})

const fullAccountsCount = computed(() => {
  return filteredAccounts.value.filter(account => 
    (account.seats_taken || 0) >= (account.max_seats || 0)
  ).length
})

const expiringSoonCount = computed(() => {
  return filteredAccounts.value.filter(account => 
    isExpiringSoon(account.paid_until)
  ).length
})

const hasActiveFilters = computed(() => {
  return searchQuery.value ||
         (Array.isArray(selectedServices.value) && !selectedServices.value.includes('all')) ||
         (Array.isArray(selectedRegions.value) && !selectedRegions.value.includes('all')) ||
         (Array.isArray(selectedOccupancy.value) && !selectedOccupancy.value.includes('all')) ||
         (Array.isArray(selectedStatuses.value) && !selectedStatuses.value.includes('all')) ||
         dateFrom.value ||
         dateTo.value
})

const isFormValid = computed(() => {
  return accountForm.services_id &&
         accountForm.regions_id &&
         accountForm.login &&
         accountForm.max_seats &&
         accountForm.paid_until
})

// Методы
function getServiceName(serviceId) {
  const service = services.value?.find(s => s.$id === serviceId)
  return service?.name || 'Неизвестный сервис'
}

function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Неизвестно'
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function isExpiringSoon(dateString) {
  if (!dateString) return false
  const paidUntil = new Date(dateString)
  const sevenDaysFromNow = new Date()
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
  return paidUntil <= sevenDaysFromNow && paidUntil > new Date()
}

function getSeatsFillPercentage(account) {
  const seatsTaken = account.seats_taken || 0
  const maxSeats = account.max_seats || 1
  return (seatsTaken / maxSeats) * 100
}

function getSeatsFillColor(account) {
  const percentage = getSeatsFillPercentage(account)
  if (percentage >= 100) return 'danger'
  if (percentage >= 80) return 'warning'
  return 'success'
}

function canAddClient(account) {
  const seatsTaken = account.seats_taken || 0
  const maxSeats = account.max_seats || 0
  return seatsTaken < maxSeats
}

function getNoAccountsMessage() {
  if (hasActiveFilters.value) {
    return 'Аккаунты не найдены'
  }
  return 'Пока нет аккаунтов'
}

function getNoAccountsDescription() {
  if (hasActiveFilters.value) {
    return 'Попробуйте изменить критерии поиска или очистить фильтры'
  }
  return 'Создайте первый аккаунт для начала работы'
}

function setQuickDateFilter(type) {
  const now = new Date()
  
  if (type === 'expiring') {
    dateFrom.value = now
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    dateTo.value = sevenDaysFromNow
  } else if (type === 'expired') {
    dateTo.value = now
    dateFrom.value = null
  }
}

function clearDateFilters() {
  dateFrom.value = null
  dateTo.value = null
}

function clearAllFilters() {
  searchQuery.value = ''
  selectedServices.value = ['all']
  selectedRegions.value = ['all']
  selectedOccupancy.value = ['all']
  selectedStatuses.value = ['all']
  selectAllServices.value = true
  selectAllRegions.value = true
  clearDateFilters()
}

function viewAccount(account) {
  selectedAccount.value = account
  showDetailsModal.value = true
}

function editAccount(account) {
  selectedAccount.value = account
  isEditMode.value = true
  
  // Заполняем форму данными аккаунта
  Object.assign(accountForm, {
    services_id: account.services_id || '',
    regions_id: account.regions_id || '',
    login: account.login || '',
    password: account.password || '',
    service_login_key: account.service_login_key || '',
    max_seats: account.max_seats || 1,
    cost_price: account.cost_price || 0,
    sell_price: account.sell_price || 0,
    paid_until: account.paid_until ? new Date(account.paid_until) : null,
    household_address: account.household_address || '',
    is_auto_funded: account.is_auto_funded || false,
    status: account.status || 'active'
  })
  
  showCreateModal.value = true
}

function addClientToAccount(account) {
  router.push({
    name: 'new-subscription',
    query: { 
      accountId: account.$id,
      serviceId: account.services_id
    }
  })
}

function resetForm() {
  Object.assign(accountForm, {
    services_id: '',
    regions_id: '',
    login: '',
    password: '',
    service_login_key: '',
    max_seats: 1,
    cost_price: 0,
    sell_price: 0,
    paid_until: null,
    household_address: '',
    is_auto_funded: false,
    status: 'active'
  })
}

function closeCreateModal() {
  showCreateModal.value = false
  isEditMode.value = false
  resetForm()
}

async function handleSubmit() {
  if (!isFormValid.value) return

  try {
    const payload = {
      ...accountForm,
      paid_until: accountForm.paid_until ? accountForm.paid_until.toISOString() : null,
      tags: accountForm.tags 
        ? accountForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : []
    }

    if (isEditMode.value && selectedAccount.value) {
      await updateAccount({ id: selectedAccount.value.$id, ...payload })
    } else {
      await createAccount(payload)
    }

    closeCreateModal()
  } catch (error) {
    console.error('Ошибка при сохранении аккаунта:', error)
    alert(`Ошибка: ${error.message}`)
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

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--va-text-primary);
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

/* Фильтры */
.filters-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin-bottom: 32px;
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-row {
  display: flex;
  gap: 16px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: var(--va-text-primary);
  font-size: 14px;
}

.service-filters,
.region-filters,
.occupancy-filters,
.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.service-checkbox,
.region-checkbox,
.occupancy-checkbox,
.status-checkbox {
  margin: 0;
}

.date-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.date-input {
  min-width: 200px;
}

/* Загрузка */
.loading-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 16px;
}

/* Сетка аккаунтов */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.account-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
  border-color: var(--va-primary) !important;
}

.account-header {
  margin-bottom: 16px;
}

.account-title h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0 0 8px 0;
}

.account-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--va-text-secondary);
}

.account-stats {
  margin-bottom: 16px;
}

.seats-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.seats-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
}

.seats-occupied {
  color: var(--va-text-primary);
  font-size: 18px;
}

.seats-separator {
  color: var(--va-text-secondary);
}

.seats-total {
  color: var(--va-text-secondary);
  font-size: 16px;
}

.seats-label {
  font-size: 12px;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.seats-progress {
  width: 100%;
}

.account-actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

/* Пустое состояние */
.no-accounts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  text-align: center;
}

.no-accounts h3 {
  font-size: 24px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 16px 0 8px 0;
}

.no-accounts p {
  font-size: 16px;
  color: var(--va-text-secondary);
  margin: 0 0 24px 0;
}

/* Форма */
.account-form {
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
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .service-filters,
  .region-filters,
  .occupancy-filters,
  .status-filters {
    flex-direction: column;
  }
  
  .date-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-input {
    min-width: auto;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>