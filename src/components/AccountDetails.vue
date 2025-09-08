<template>
  <va-modal 
    v-model="isVisible" 
    :title="account?.login || 'Детали аккаунта'"
    size="large"
    @close="handleClose"
  >
    <div v-if="account" class="account-details">
      <!-- Основная информация -->
      <div class="account-header">
        <div class="account-info">
          <h3>[{{ account.service_login_key || 'N/A' }}] {{ account.login }}</h3>
          <va-chip :color="account.status === 'active' ? 'success' : 'danger'" size="small">
            {{ account.status === 'active' ? 'Активен' : 'Неактивен' }}
          </va-chip>
          <va-chip v-if="isExpiringSoon" color="warning" size="small">
            Истекает скоро
          </va-chip>
        </div>
        <div class="account-stats">
          <div class="stat-item">
            <span class="stat-label">Занято мест:</span>
            <span class="stat-value">{{ occupiedSeats.length }}/{{ account.max_seats || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Регион:</span>
            <span class="stat-value">{{ getRegionName(account.regions_id) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Истекает:</span>
            <span class="stat-value">{{ formatDate(account.paid_until) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Сервис:</span>
            <span class="stat-value">{{ getServiceName(account.services_id) }}</span>
          </div>
        </div>
        
        <!-- Прогресс заполненности -->
        <div class="seats-progress-section">
          <div class="progress-info">
            <span>Заполненность: {{ occupiedSeats.length }}/{{ account.max_seats || 0 }}</span>
            <span class="progress-percentage">{{ Math.round((occupiedSeats.length / (account.max_seats || 1)) * 100) }}%</span>
          </div>
          <va-progress-bar 
            :model-value="(occupiedSeats.length / (account.max_seats || 1)) * 100"
            :color="occupiedSeats.length >= (account.max_seats || 0) ? 'danger' : 'primary'"
            size="small"
          />
        </div>
      </div>

      <!-- Места в аккаунте -->
      <div class="seats-section">
        <div class="seats-header">
          <h4>Места в аккаунте</h4>
          <va-button 
            v-if="canAddMoreSeats"
            size="small" 
            @click="handleAddClient"
          >
            <va-icon name="person_add" class="mr-1" />
            Добавить клиента
          </va-button>
        </div>
        
        <div v-if="seatsLoading" class="loading-seats">
          <va-progress-circle indeterminate size="small" />
          <span>Загрузка мест...</span>
        </div>
        <div v-else-if="occupiedSeats.length" class="seats-list">
          <div 
            v-for="seat in occupiedSeats" 
            :key="seat.$id"
            class="seat-item"
          >
            <div class="seat-info">
              <div class="seat-number">Место {{ seat.seat_number || '?' }}</div>
              <div class="seat-customer">
                <va-icon name="person" size="16px" />
                <span>{{ getCustomerName(seat.customers_id) }}</span>
                <span class="customer-contact">{{ getCustomerContact(seat.customers_id) }}</span>
              </div>
            </div>
            <div class="seat-actions">
              <va-button 
                size="small" 
                preset="plain" 
                color="danger"
                @click="handleFreeSeat(seat)"
                :loading="freeingSeat === seat.$id"
              >
                Освободить
              </va-button>
            </div>
          </div>
        </div>
        <div v-else class="no-seats">
          <va-icon name="people_outline" size="48px" color="secondary" />
          <p>В этом аккаунте пока нет клиентов</p>
          <va-button size="small" @click="handleAddClient">
            Добавить первого клиента
          </va-button>
        </div>
      </div>

      <!-- Финансовая информация -->
      <div class="financial-section">
        <h4>Финансовая информация</h4>
        <div class="financial-grid">
          <div class="financial-item">
            <span class="financial-label">Стоимость закупки:</span>
            <span class="financial-value">{{ formatCurrency(account.cost_price || 0) }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Цена продажи:</span>
            <span class="financial-value">{{ formatCurrency(account.sell_price || 0) }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Автофинансирование:</span>
            <va-chip :color="account.is_auto_funded ? 'success' : 'secondary'" size="small">
              {{ account.is_auto_funded ? 'Включено' : 'Выключено' }}
            </va-chip>
          </div>
          <div class="financial-item">
            <span class="financial-label">Адрес домохозяйства:</span>
            <span class="financial-value">{{ account.household_address || 'Не указан' }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Логин:</span>
            <span class="financial-value">{{ account.login || 'Не указан' }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Пароль:</span>
            <span class="financial-value">{{ account.password ? '••••••••' : 'Не указан' }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Создан:</span>
            <span class="financial-value">{{ formatDate(account.$createdAt) }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Создал:</span>
            <span class="financial-value">{{ account.created_by ? `ID: ${account.created_by.slice(-6)}` : 'Не указан' }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <va-button preset="secondary" @click="handleClose">
          Закрыть
        </va-button>
        <va-button @click="handleEdit">
          Редактировать
        </va-button>
        <va-button 
          preset="plain" 
          color="danger"
          @click="handleDelete"
        >
          Удалить
        </va-button>
      </div>
    </template>
  </va-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAccountSeats, useFreeSeat, useDeleteAccount } from '@/composables/useAccountsApi'
import { useRegions } from '@/composables/useAppwriteCollections'
import { useCustomers } from '@/composables/useCustomersApi'
import { useServices } from '@/composables/useServicesApi'

const props = defineProps({
  modelValue: Boolean,
  account: Object
})

const emit = defineEmits(['update:modelValue', 'edit', 'assign-seat', 'add-client'])

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { data: regions } = useRegions()
const { data: services } = useServices()
const { data: customers } = useCustomers()
const { data: seats, isLoading: seatsLoading } = useAccountSeats(
  computed(() => props.account?.$id)
)
const { mutateAsync: freeSeat, isLoading: freeing } = useFreeSeat()
const { mutateAsync: deleteAccount } = useDeleteAccount()

const freeingSeat = ref(null)

// Вычисляемые свойства
const occupiedSeats = computed(() => {
  return seats.value || []
})

const canAddMoreSeats = computed(() => {
  const maxSeats = props.account?.max_seats || 0
  const occupiedCount = occupiedSeats.value.length
  return occupiedCount < maxSeats
})

const isExpiringSoon = computed(() => {
  if (!props.account?.paid_until) return false
  const paidUntil = new Date(props.account.paid_until)
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  return paidUntil <= threeDaysFromNow && paidUntil > new Date()
})

function getCustomerName(customerId) {
  const customer = customers.value?.find(c => c.$id === customerId)
  return customer?.name || 'Неизвестный клиент'
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

function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Неизвестно'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано'
  return new Date(dateString).toLocaleDateString('ru-RU')
}

function handleClose() {
  isVisible.value = false
}

function handleEdit() {
  emit('edit', props.account)
}

function handleAddClient() {
  emit('add-client', props.account)
}

async function handleDelete() {
  if (!props.account) return
  
  const hasOccupiedSeats = occupiedSeats.value.length > 0
  
  if (hasOccupiedSeats) {
    alert('Нельзя удалить аккаунт с занятыми местами. Сначала освободите все места.')
    return
  }
  
  if (!confirm(`Вы уверены, что хотите удалить аккаунт "${props.account.login}"?`)) {
    return
  }
  
  try {
    await deleteAccount(props.account.$id)
    handleClose()
  } catch (error) {
    console.error('Ошибка при удалении аккаунта:', error)
    alert(`Ошибка при удалении аккаунта: ${error.message || 'Неизвестная ошибка'}`)
  }
}

async function handleFreeSeat(seat) {
  if (!confirm('Вы уверены, что хотите освободить это место?')) return
  
  try {
    freeingSeat.value = seat.$id
    await freeSeat(seat.$id)
  } catch (error) {
    console.error('Ошибка при освобождении места:', error)
  } finally {
    freeingSeat.value = null
  }
}
</script>

<style scoped>
.account-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.account-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--va-background-element);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.account-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--va-text-primary);
}

.seats-section h4,
.financial-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.seats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.seats-progress-section {
  margin-top: 16px;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.progress-percentage {
  color: var(--va-primary);
  font-weight: 600;
}

.seats-info {
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
  margin-bottom: 16px;
}

.seats-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seats-count {
  font-weight: 600;
  color: var(--va-text-primary);
}

.seats-progress {
  width: 100%;
}

.seats-section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seats-list h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.add-seat-section {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 2px dashed var(--va-background-element);
}

.loading-seats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  justify-content: center;
}

.seats-section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seats-info {
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.seats-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seats-count {
  font-weight: 600;
  color: var(--va-text-primary);
}

.seats-progress {
  width: 100%;
}

.seats-list h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.seats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 1px solid var(--va-success);
  background: rgba(29, 185, 84, 0.05);
  transition: all 0.2s ease;
}

.add-seat-section {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: var(--va-background-primary);
  border-radius: 12px;
  border: 2px dashed var(--va-background-element);
}
.seat-info {
  flex: 1;
}

.seat-number {
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.seat-customer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--va-text-secondary);
}

.customer-contact {
  font-style: italic;
}

.seat-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.seat-actions {
  display: flex;
  gap: 8px;
}

.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.financial-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--va-background-primary);
  border-radius: 8px;
}

.financial-label {
  font-size: 14px;
  color: var(--va-text-secondary);
}

.financial-value {
  font-weight: 600;
  color: var(--va-text-primary);
}

.no-seats {
  text-align: center;
  padding: 20px;
  color: var(--va-text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.no-seats p {
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .account-stats {
    grid-template-columns: 1fr;
  }
  
  .financial-grid {
    grid-template-columns: 1fr;
  }
  
  .seat-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .seat-actions {
    justify-content: flex-end;
  }
}
</style>