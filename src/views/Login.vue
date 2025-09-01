<template>
  <div class="login-page-container">
    <!-- Фоновое изображение и оверлей -->
    <div class="login-background"></div>
    <div class="login-background-overlay"></div>
    
    <!-- Контент страницы входа -->
    <div class="login-content">
      <va-card class="login-card">
        <!-- Логотип и заголовок -->
        <div class="login-header">
          <div class="login-logo">
            <div class="logo-icon">🍉</div>
            <div class="logo-text">
              <h1 class="logo-title">WaterMelon</h1>
              <p class="logo-subtitle">CRM System</p>
            </div>
          </div>
          <h2 class="login-title">Добро пожаловать</h2>
          <p class="login-description">Войдите в свой аккаунт для продолжения</p>
        </div>

        <!-- Форма входа -->
        <div class="login-form">
          <va-input 
            v-model="email" 
            type="email" 
            label="Email адрес" 
            class="login-input"
            :rules="[value => !!value || 'Email обязателен']"
          >
            <template #prependInner>
              <va-icon name="email" size="18px" />
            </template>
          </va-input>
          
          <va-input 
            v-model="password" 
            type="password" 
            label="Пароль" 
            class="login-input"
            :rules="[value => !!value || 'Пароль обязателен']"
          >
            <template #prependInner>
              <va-icon name="lock" size="18px" />
            </template>
          </va-input>

          <va-button 
            :loading="loading" 
            @click="onLogin"
            class="login-button"
            size="large"
          >
            Войти в систему
          </va-button>

          <va-alert 
            v-if="err" 
            color="danger" 
            class="login-error"
            closeable
            @close="err = ''"
          >
            {{ err }}
          </va-alert>
        </div>

        <!-- Футер -->
        <div class="login-footer">
          <p class="footer-text">
            © 2025 WaterMelon CRM. Все права защищены.
          </p>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { account } from '@/appwrite/client'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const err = ref('')

onMounted(async () => { 
  try { 
    await account.get()
    router.replace('/') 
  } catch {} 
})

async function onLogin() {
  if (!email.value || !password.value) {
    err.value = 'Пожалуйста, заполните все поля'
    return
  }

  err.value = ''
  loading.value = true
  
  try { 
    await account.createEmailPasswordSession(email.value, password.value)
    router.replace('/') 
  } catch(e) { 
    err.value = e?.message || 'Ошибка входа. Проверьте данные и попробуйте снова.' 
  } finally { 
    loading.value = false 
  }
}
</script>

<style scoped>
.login-page-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  z-index: 1;
}

.login-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop') center/cover;
  opacity: 0.3;
  z-index: -1;
}

.login-background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 2;
}

.login-content {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 24px !important;
  padding: 40px !important;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
  color: #1a1a1a !important;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.logo-icon {
  font-size: 48px;
  line-height: 1;
}

.logo-text {
  text-align: left;
}

.logo-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-description {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-input {
  --va-input-wrapper-border-radius: 12px;
}

:deep(.login-input .va-input-wrapper) {
  background: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
}

:deep(.login-input .va-input-wrapper:hover) {
  border-color: var(--va-primary) !important;
}

:deep(.login-input .va-input-wrapper--focused) {
  border-color: var(--va-primary) !important;
  box-shadow: 0 0 0 3px rgba(255, 51, 102, 0.1) !important;
}

:deep(.login-input .va-input__label) {
  color: #1a1a1a !important;
  font-weight: 500 !important;
}

:deep(.login-input .va-input__content__input) {
  color: #1a1a1a !important;
}

.login-button {
  width: 100% !important;
  height: 48px !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 16px !important;
  background: linear-gradient(135deg, var(--va-primary), #e91e63) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(255, 51, 102, 0.3) !important;
  transition: all 0.2s ease !important;
}

.login-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 51, 102, 0.4) !important;
}

.login-button:active {
  transform: translateY(0) !important;
}

.login-error {
  border-radius: 12px !important;
  background: rgba(239, 68, 68, 0.1) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-text {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 480px) {
  .login-content {
    padding: 16px;
  }
  
  .login-card {
    padding: 24px !important;
  }
  
  .login-logo {
    flex-direction: column;
    gap: 12px;
  }
  
  .logo-text {
    text-align: center;
  }
  
  .logo-title {
    font-size: 24px;
  }
  
  .login-title {
    font-size: 20px;
  }
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: rgba(26, 26, 26, 0.95) !important;
    color: #ffffff !important;
  }
  
  .logo-title,
  .login-title {
    color: #ffffff !important;
  }
  
  .login-description {
    color: #cccccc !important;
  }
  
  :deep(.login-input .va-input-wrapper) {
    background: rgba(42, 42, 42, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  
  :deep(.login-input .va-input__label) {
    color: #ffffff !important;
  }
  
  :deep(.login-input .va-input__content__input) {
    color: #ffffff !important;
  }
  
  .login-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
</template>