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
          <h3>{{ account.login }}</h3>
          <va-chip :color="account.status === 'active' ? 'success' : 'danger'" size="small">
            {{ account.status === 'active' ? 'Активен' : 'Неактивен' }}
          </va-chip>
        </div>
        <div class="account-stats">
          <div class="stat-item">
            <span class="stat-label">Занято мест:</span>
            <span class="stat-value">{{ account.seats_taken || 0 }}/{{ account.max_seats || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Регион:</span>
            <span class="stat-value">{{ getRegionName(account.regions_id) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Истекает:</span>
            <span class="stat-value">{{ formatDate(account.paid_until) }}</span>
          </div>
        </div>
      </div>

      <!-- Места в аккаунте -->
      <div class="seats-section">
        <h4>Места в аккаунте</h4>
        <div v-if="seatsLoading" class="loading-seats">
          <va-progress-circle indeterminate size="small" />
          <span>Загрузка мест...</span>
        </div>
        <div v-else-if="seats?.length" class="seats-list">
          <div 
            v-for="seat in seats" 
            :key="seat.$id"
            class="seat-item"
            :class="{ 'seat-occupied': seat.is_occupied }"
          >
            <div class="seat-info">
              <div class="seat-number">Место {{ seat.seat_number || '?' }}</div>
              <div v-if="seat.is_occupied && seat.customer" class="seat-customer">
                <va-icon name="person" size="16px" />
                <span>{{ seat.customer.name }}</span>
                <span class="customer-contact">{{ seat.customer.contact_handle }}</span>
              </div>
              <div v-else class="seat-empty">
                <va-icon name="person_outline" size="16px" />
                <span>Свободно</span>
              </div>
            </div>
            <div class="seat-actions">
              <va-button 
                v-if="seat.is_occupied"
                size="small" 
                preset="plain" 
                color="danger"
                @click="handleFreeSeat(seat)"
                :loading="freeingSeat === seat.$id"
              >
                Освободить
              </va-button>
              <va-button 
                v-else
                size="small" 
                preset="plain" 
                color="primary"
                @click="handleAssignSeat(seat)"
              >
                Назначить
              </va-button>
            </div>
          </div>
        </div>
        <div v-else class="no-seats">
          <p>Места не найдены</p>
        </div>
      </div>

      <!-- Финансовая информация -->
      <div class="financial-section">
        <h4>Финансовая информация</h4>
        <div class="financial-grid">
          <div class="financial-item">
            <span class="financial-label">Стоимость закупки:</span>
            <span class="financial-value">{{ account.cost_price || 0 }} {{ getCurrencySymbol(account.currencies_id) }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Цена продажи:</span>
            <span class="financial-value">{{ account.sell_price || 0 }} {{ getCurrencySymbol(account.currencies_id) }}</span>
          </div>
          <div class="financial-item">
            <span class="financial-label">Автофинансирование:</span>
            <va-chip :color="account.is_auto_funded ? 'success' : 'secondary'" size="small">
              {{ account.is_auto_funded ? 'Включено' : 'Выключено' }}
            </va-chip>
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
      </div>
    </template>
  </va-modal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAccountSeats, useFreeSeat } from '@/composables/useAccountsApi'
import { useRegions, useCurrencies } from '@/composables/useAppwriteCollections'

const props = defineProps({
  modelValue: Boolean,
  account: Object
})

const emit = defineEmits(['update:modelValue', 'edit', 'assign-seat'])

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { data: regions } = useRegions()
const { data: currencies } = useCurrencies()
const { data: seats, isLoading: seatsLoading } = useAccountSeats(
  computed(() => props.account?.$id)
)
const { mutateAsync: freeSeat, isLoading: freeing } = useFreeSeat()

const freeingSeat = ref(null)

function getRegionName(regionId) {
  const region = regions.value?.find(r => r.$id === regionId)
  return region?.name || 'Неизвестно'
}

function getCurrencySymbol(currencyId) {
  const currency = currencies.value?.find(c => c.$id === currencyId)
  return currency?.symbol || '$'
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

function handleAssignSeat(seat) {
  emit('assign-seat', { account: props.account, seat })
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

.loading-seats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  justify-content: center;
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
  border: 1px solid var(--va-background-element);
  transition: all 0.2s ease;
}

.seat-item.seat-occupied {
  border-color: var(--va-success);
  background: rgba(29, 185, 84, 0.05);
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