<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Настройки</h1>
      <p class="page-subtitle">Конфигурация системы и пользовательские настройки</p>
    </div>

    <div class="settings-sections">
      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="account_circle" size="24px" color="primary" />
          </div>
          <h3>Профиль</h3>
        </div>
        <p>Управление профилем администратора и персональными данными</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>

      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="security" size="24px" color="danger" />
          </div>
          <h3>Безопасность</h3>
        </div>
        <p>Настройки безопасности, двухфакторная аутентификация</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>

      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="notifications" size="24px" color="info" />
          </div>
          <h3>Уведомления</h3>
        </div>
        <p>Настройка email и push уведомлений</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>

      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="payment" size="24px" color="success" />
          </div>
          <h3>Платежи</h3>
        </div>
        <p>Настройка платежных систем и методов оплаты</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>

      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="integration_instructions" size="24px" color="warning" />
          </div>
          <h3>Интеграции</h3>
        </div>
        <p>API ключи и интеграции с внешними сервисами</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>

      <va-card class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <va-icon name="backup" size="24px" color="info" />
          </div>
          <h3>Резервное копирование</h3>
        </div>
        <p>Настройка автоматического резервного копирования данных</p>
        <va-button size="small" preset="secondary">Настроить</va-button>
      </va-card>
    </div>

    <va-card class="system-info-card">
      <h3 class="mb-3">Информация о системе</h3>
      <div class="system-info-grid">
        <div class="info-item">
          <div class="info-label">Версия системы</div>
          <div class="info-value">WaterMelon CRM v2.0.1</div>
        </div>
        <div class="info-item">
          <div class="info-label">Последнее обновление</div>
          <div class="info-value">15 января 2025</div>
        </div>
        <div class="info-item">
          <div class="info-label">База данных</div>
          <div class="info-value">Appwrite Cloud</div>
        </div>
        <div class="info-item">
          <div class="info-label">Статус</div>
          <div class="info-value status-online">
            <va-icon name="check_circle" size="16px" />
            Онлайн
          </div>
        </div>
      </div>
    </va-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'

const router = useRouter()

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

.settings-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.settings-section {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
  transition: all 0.2s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15) !important;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 51, 102, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.settings-section p {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.system-info-card {
  background: var(--va-background-secondary) !important;
  border: 1px solid var(--va-background-element) !important;
  border-radius: 16px !important;
  padding: 24px !important;
}

.system-info-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--va-text-primary);
  margin: 0;
}

.system-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid var(--va-background-element);
}

.info-label {
  font-size: 12px;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--va-text-primary);
}

.status-online {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--va-success);
}
</style>
</template>