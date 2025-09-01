<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Настройки профиля</h1>
      <p class="page-subtitle">Управление личными данными и настройками аккаунта</p>
    </div>

    <div class="profile-sections">
      <!-- Основная информация -->
      <va-card class="profile-section">
        <div class="section-header">
          <h3>Основная информация</h3>
        </div>
        
        <div class="profile-form">
          <div class="profile-avatar-section">
            <va-avatar size="80px" color="primary">
              A
            </va-avatar>
            <div class="avatar-actions">
              <va-button size="small" preset="secondary">
                Изменить фото
              </va-button>
              <va-button size="small" preset="plain">
                Удалить
              </va-button>
            </div>
          </div>

          <div class="form-grid">
            <va-input 
              v-model="profile.firstName" 
              label="Имя" 
              class="form-field"
            />
            <va-input 
              v-model="profile.lastName" 
              label="Фамилия" 
              class="form-field"
            />
            <va-input 
              v-model="profile.position" 
              label="Должность" 
              class="form-field"
            />
            <va-input 
              v-model="profile.phone" 
              label="Телефон" 
              class="form-field"
            />
          </div>

          <div class="form-actions">
            <va-button>Сохранить изменения</va-button>
            <va-button preset="secondary">Отменить</va-button>
          </div>
        </div>
      </va-card>

      <!-- Настройки интерфейса -->
      <va-card class="profile-section">
        <div class="section-header">
          <h3>Настройки интерфейса</h3>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Тема оформления</div>
              <div class="setting-description">Выберите светлую или темную тему</div>
            </div>
            <va-switch v-model="darkTheme" @change="toggleTheme" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Язык интерфейса</div>
              <div class="setting-description">Язык отображения системы</div>
            </div>
            <va-select 
              v-model="profile.language" 
              :options="languageOptions"
              style="width: 150px;"
            />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Часовой пояс</div>
              <div class="setting-description">Ваш текущий часовой пояс</div>
            </div>
            <va-select 
              v-model="profile.timezone" 
              :options="timezoneOptions"
              style="width: 200px;"
            />
          </div>
        </div>
      </va-card>

      <!-- Уведомления -->
      <va-card class="profile-section">
        <div class="section-header">
          <h3>Настройки уведомлений</h3>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Email уведомления</div>
              <div class="setting-description">Получать уведомления на email</div>
            </div>
            <va-switch v-model="notifications.email" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Уведомления о новых клиентах</div>
              <div class="setting-description">Уведомления при регистрации новых клиентов</div>
            </div>
            <va-switch v-model="notifications.newCustomers" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Уведомления о платежах</div>
              <div class="setting-description">Уведомления об успешных и неудачных платежах</div>
            </div>
            <va-switch v-model="notifications.payments" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-label">Еженедельные отчеты</div>
              <div class="setting-description">Получать сводку активности за неделю</div>
            </div>
            <va-switch v-model="notifications.weeklyReports" />
          </div>
        </div>
      </va-card>

      <!-- Безопасность -->
      <va-card class="profile-section">
        <div class="section-header">
          <h3>Безопасность</h3>
        </div>
        
        <div class="security-actions">
          <div class="security-item">
            <div class="security-info">
              <div class="security-label">Двухфакторная аутентификация</div>
              <div class="security-description">Дополнительная защита вашего аккаунта</div>
            </div>
            <va-button preset="secondary" size="small">
              Настроить
            </va-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-label">Активные сессии</div>
              <div class="security-description">Управление активными сессиями</div>
            </div>
            <va-button preset="secondary" size="small">
              Просмотреть
            </va-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-label">История входов</div>
              <div class="security-description">Последние входы в систему</div>
            </div>
            <va-button preset="secondary" size="small">
              Показать
            </va-button>
          </div>
        </div>
      </va-card>

      <!-- Выход из системы -->
      <va-card class="profile-section logout-section">
        <div class="section-header">
          <h3>Выход из системы</h3>
        </div>
        
        <div class="logout-content">
          <p>Завершить текущую сессию и выйти из системы</p>
          <va-button color="danger" @click="logout">
            <va-icon name="logout" class="mr-1" />
            Выйти из системы
          </va-button>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'
import { useColors } from 'vuestic-ui'

const router = useRouter()
const { applyPreset, currentPresetName } = useColors()

const profile = ref({
  firstName: 'Админ',
  lastName: 'WaterMelon',
  position: 'Системный администратор',
  phone: '+380 (99) 123-45-67',
  language: 'ru',
  timezone: 'Europe/Kiev'
})

const notifications = ref({
  email: true,
  newCustomers: true,
  payments: true,
  weeklyReports: false
})

const darkTheme = ref(currentPresetName.value === 'dark')

const languageOptions = [
  { text: 'Русский', value: 'ru' },
  { text: 'Українська', value: 'ua' },
  { text: 'English', value: 'en' }
]

const timezoneOptions = [
  { text: 'Киев (UTC+2)', value: 'Europe/Kiev' },
  { text: 'Москва (UTC+3)', value: 'Europe/Moscow' },
  { text: 'Лондон (UTC+0)', value: 'Europe/London' }
]

function toggleTheme() {
  const newTheme = darkTheme.value ? 'dark' : 'light'
  applyPreset(newTheme)
}

async function logout() {
  try { 
    await account.deleteSession('current') 
  } catch {}
  router.replace({ name: 'login' })
}

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
  max-width: 1000px;
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

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--va-background-element);
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--va-background-element);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--va-background-element);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.setting-description {
  font-size: 13px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.security-info {
  flex: 1;
}

.security-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin-bottom: 4px;
}

.security-description {
  font-size: 13px;
  color: var(--va-text-secondary);
  opacity: 0.8;
}

.logout-section {
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.logout-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logout-content p {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .profile-avatar-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .logout-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>