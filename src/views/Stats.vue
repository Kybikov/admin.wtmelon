<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Моя статистика</h1>
      <p class="page-subtitle">Персональная статистика и активность в системе</p>
    </div>

    <!-- Основные метрики -->
    <div class="stats-grid">
      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon blue">
            <va-icon name="login" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">247</div>
            <div class="stat-label">Входов в систему</div>
            <div class="stat-period">За последний месяц</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon green">
            <va-icon name="schedule" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">156 ч</div>
            <div class="stat-label">Время в системе</div>
            <div class="stat-period">За последний месяц</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon orange">
            <va-icon name="task_alt" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">89</div>
            <div class="stat-label">Выполненных задач</div>
            <div class="stat-period">За последний месяц</div>
          </div>
        </div>
      </va-card>

      <va-card class="stat-card">
        <div class="stat-content">
          <div class="stat-icon red">
            <va-icon name="trending_up" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">+23%</div>
            <div class="stat-label">Рост эффективности</div>
            <div class="stat-period">По сравнению с прошлым месяцем</div>
          </div>
        </div>
      </va-card>
    </div>

    <!-- Активность по дням -->
    <va-card class="activity-card">
      <div class="card-header">
        <h3>Активность по дням недели</h3>
        <va-button preset="plain" size="small">Подробнее</va-button>
      </div>
      
      <div class="activity-chart">
        <div class="activity-days">
          <div 
            v-for="day in weekActivity" 
            :key="day.name"
            class="activity-day"
          >
            <div class="activity-bar-container">
              <div 
                class="activity-bar" 
                :style="{ height: `${day.percentage}%` }"
              ></div>
            </div>
            <div class="activity-day-name">{{ day.name }}</div>
            <div class="activity-day-value">{{ day.hours }}ч</div>
          </div>
        </div>
      </div>
    </va-card>

    <!-- Последние действия -->
    <va-card class="actions-card">
      <div class="card-header">
        <h3>Последние действия</h3>
        <va-button preset="plain" size="small">История</va-button>
      </div>
      
      <div class="actions-list">
        <div 
          v-for="action in recentActions" 
          :key="action.id"
          class="action-item"
        >
          <div class="action-icon" :class="action.type">
            <va-icon :name="action.icon" size="16px" />
          </div>
          <div class="action-content">
            <div class="action-text">{{ action.text }}</div>
            <div class="action-time">{{ action.time }}</div>
          </div>
        </div>
      </div>
    </va-card>

    <!-- Достижения -->
    <va-card class="achievements-card">
      <div class="card-header">
        <h3>Достижения</h3>
      </div>
      
      <div class="achievements-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-item"
          :class="{ 'achievement-item--unlocked': achievement.unlocked }"
        >
          <div class="achievement-icon">
            <va-icon :name="achievement.icon" size="24px" />
          </div>
          <div class="achievement-info">
            <div class="achievement-title">{{ achievement.title }}</div>
            <div class="achievement-description">{{ achievement.description }}</div>
          </div>
          <div v-if="achievement.unlocked" class="achievement-badge">
            <va-icon name="check_circle" size="16px" color="success" />
          </div>
        </div>
      </div>
    </va-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'

const router = useRouter()

const weekActivity = ref([
  { name: 'Пн', hours: 8.5, percentage: 85 },
  { name: 'Вт', hours: 7.2, percentage: 72 },
  { name: 'Ср', hours: 9.1, percentage: 91 },
  { name: 'Чт', hours: 6.8, percentage: 68 },
  { name: 'Пт', hours: 8.9, percentage: 89 },
  { name: 'Сб', hours: 3.2, percentage: 32 },
  { name: 'Вс', hours: 1.5, percentage: 15 }
])

const recentActions = ref([
  {
    id: 1,
    type: 'create',
    icon: 'add_circle',
    text: 'Добавлен новый клиент "Алексей Иванов"',
    time: '15 минут назад'
  },
  {
    id: 2,
    type: 'edit',
    icon: 'edit',
    text: 'Обновлена информация о клиенте "Мария Петрова"',
    time: '1 час назад'
  },
  {
    id: 3,
    type: 'view',
    icon: 'visibility',
    text: 'Просмотрен отчет по продажам за декабрь',
    time: '2 часа назад'
  },
  {
    id: 4,
    type: 'delete',
    icon: 'delete',
    text: 'Удален неактивный клиент',
    time: '3 часа назад'
  }
])

const achievements = ref([
  {
    id: 1,
    title: 'Первые шаги',
    description: 'Первый вход в систему',
    icon: 'star',
    unlocked: true
  },
  {
    id: 2,
    title: 'Активный пользователь',
    description: '100 входов в систему',
    icon: 'local_fire_department',
    unlocked: true
  },
  {
    id: 3,
    title: 'Мастер данных',
    description: 'Добавлено 50 клиентов',
    icon: 'people',
    unlocked: true
  },
  {
    id: 4,
    title: 'Аналитик',
    description: 'Создано 10 отчетов',
    icon: 'analytics',
    unlocked: false
  },
  {
    id: 5,
    title: 'Марафонец',
    description: '500 часов в системе',
    icon: 'timer',
    unlocked: false
  },
  {
    id: 6,
    title: 'Эксперт',
    description: 'Использованы все функции системы',
    icon: 'workspace_premium',
    unlocked: false
  }
])

onMounted(async () => {
  try {
    await account.get()
  } catch {
    router.replace('/login')
  }
})
</script>

<style scoped>
.page-container {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  align-items: flex-start;
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
.stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #d97706); }
.stat-icon.red { background: linear-gradient(135deg, #ef4444, #dc2626); }

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
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.stat-period {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.activity-card,
.actions-card,
.achievements-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.activity-chart {
  padding: 16px 0;
}

.activity-days {
  display: flex;
  align-items: end;
  gap: 16px;
  height: 200px;
}

.activity-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.activity-bar-container {
  height: 150px;
  width: 32px;
  background: var(--va-background-element);
  border-radius: 16px;
  display: flex;
  align-items: end;
  overflow: hidden;
}

.activity-bar {
  width: 100%;
  background: linear-gradient(to top, var(--va-primary), #e91e63);
  border-radius: 16px;
  transition: height 0.3s ease;
}

.activity-day-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--va-text-secondary);
}

.activity-day-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.action-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-icon.create { background: #10b981; }
.action-icon.edit { background: #3b82f6; }
.action-icon.view { background: #6366f1; }
.action-icon.delete { background: #ef4444; }

.action-content {
  flex: 1;
}

.action-text {
  font-size: 14px;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.action-time {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.7;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.achievement-item--unlocked {
  opacity: 1;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
}

.achievement-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--va-background-element);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--va-text-secondary);
}

.achievement-item--unlocked .achievement-icon {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.achievement-description {
  font-size: 12px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.achievement-badge {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-days {
    gap: 8px;
  }
  
  .activity-bar-container {
    width: 24px;
  }
  
  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>