<template>
  <div class="manager-revenue-page">
    <div class="page-header">
      <h1 class="page-title">Доходы по менеджерам</h1>
      <p class="page-subtitle">Статистика продаж и доходов по каждому менеджеру</p>
    </div>

    <!-- Фильтры периода -->
    <va-card class="filters-card">
      <div class="filters-content">
        <va-date-input
          v-model="dateFrom"
          label="С даты"
          class="date-input"
        />
        <va-date-input
          v-model="dateTo"
          label="По дату"
          class="date-input"
        />
        <va-button @click="loadData">Обновить</va-button>
      </div>
    </va-card>

    <!-- Таблица доходов менеджеров -->
    <va-card class="revenue-table-card">
      <va-data-table
        :items="managerStats"
        :columns="columns"
        :loading="isLoading"
        striped
        hoverable
      >
        <template #cell(manager_name)="{ rowData }">
          <div class="manager-cell">
            <va-avatar 
              :fallback-text="getManagerInitials(rowData.manager_id)"
              size="32px"
              color="primary"
            />
            <span>{{ rowData.manager_name }}</span>
          </div>
        </template>

        <template #cell(total_revenue)="{ rowData }">
          {{ formatCurrency(rowData.total_revenue) }}
        </template>

        <template #cell(total_profit)="{ rowData }">
          {{ formatCurrency(rowData.total_profit) }}
        </template>

        <template #cell(avg_deal_size)="{ rowData }">
          {{ formatCurrency(rowData.avg_deal_size) }}
        </template>
      </va-data-table>
    </va-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { account } from '@/appwrite/client'
import { useSubscriptions } from '@/composables/useSubscriptionsApi'

const router = useRouter()

// Проверка авторизации
onMounted(async () => {
  try {
    await account.get()
    loadData()
  } catch {
    router.replace('/login')
  }
})

// Данные
const { data: subscriptions, isLoading } = useSubscriptions()
const dateFrom = ref(null)
const dateTo = ref(null)

// Колонки таблицы
const columns = [
  { key: 'manager_name', label: 'Менеджер', sortable: true },
  { key: 'total_deals', label: 'Сделок', sortable: true },
  { key: 'total_revenue', label: 'Выручка', sortable: true },
  { key: 'total_profit', label: 'Прибыль', sortable: true },
  { key: 'avg_deal_size', label: 'Средний чек', sortable: true }
]

// Статистика по менеджерам
const managerStats = computed(() => {
  if (!subscriptions.value) return []

  const stats = {}
  
  subscriptions.value.forEach(subscription => {
    const managerId = subscription.manager_id || 'unknown'
    
    if (!stats[managerId]) {
      stats[managerId] = {
        manager_id: managerId,
        manager_name: getManagerName(managerId),
        total_deals: 0,
        total_revenue: 0,
        total_cost: 0,
        total_profit: 0,
        avg_deal_size: 0
      }
    }
    
    stats[managerId].total_deals++
    stats[managerId].total_revenue += subscription.sell_price || 0
    stats[managerId].total_cost += subscription.cost_price || 0
  })
  
  // Вычисляем прибыль и средний чек
  Object.values(stats).forEach(stat => {
    stat.total_profit = stat.total_revenue - stat.total_cost
    stat.avg_deal_size = stat.total_deals > 0 ? stat.total_revenue / stat.total_deals : 0
  })
  
  return Object.values(stats).sort((a, b) => b.total_revenue - a.total_revenue)
})

function getManagerName(managerId) {
  if (managerId === 'unknown') return 'Неизвестный менеджер'
  return `Менеджер ${managerId.slice(-4)}`
}

function getManagerInitials(managerId) {
  return managerId === 'unknown' ? '?' : managerId.slice(-2).toUpperCase()
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'UAH'
  }).format(amount)
}

function loadData() {
  // Здесь можно добавить фильтрацию по датам
  console.log('Loading data for period:', dateFrom.value, 'to', dateTo.value)
}
</script>

<style scoped>
.manager-revenue-page {
  padding: 32px;
  max-width: 1400px;
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

.filters-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin-bottom: 24px;
}

.filters-content {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.date-input {
  min-width: 200px;
}

.revenue-table-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.manager-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 768px) {
  .manager-revenue-page {
    padding: 16px;
  }
  
  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-input {
    min-width: auto;
  }
}
</style>