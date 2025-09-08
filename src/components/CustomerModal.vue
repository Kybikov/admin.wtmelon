<template>
  <va-modal 
    v-model="isVisible" 
    :title="isEdit ? 'Редактировать клиента' : 'Добавить клиента'"
    size="large"
    @close="handleClose"
    hide-default-actions
  >
    <div class="customer-form">
      <!-- Основная информация -->
      <div class="form-section">
        <h4 class="section-title">Основная информация</h4>
        <div class="form-row">
          <va-input 
            v-model="form.name" 
            label="Имя клиента *" 
            :rules="[v => !!v || 'Имя обязательно']"
            :error="!!errors.name"
            :error-messages="errors.name ?? null"
            class="form-input"
            outline
          />
          <va-select
            v-model="form.country"
            label="Страна"
            :options="countryOptions"
            text-by="name"
            value-by="$id"
            class="form-input"
            outline
          />
        </div>
      </div>
      
      <!-- Контактная информация -->
      <div class="form-section">
        <h4 class="section-title">Контактная информация</h4>
        <div class="form-row">
          <va-select
            v-model="form.contact_type"
            label="Тип контакта"
            :options="contactTypeOptions"
          />
          <va-input 
            v-model="form.contact_handle" 
            label="Контакт" 
            class="form-input"
            outline
          />
        </div>
        
        <div class="form-row">
          <va-input 
            v-model="form.phone" 
            label="Телефон" 
            class="form-input"
            outline
          />
          <va-input 
            v-model="form.contact_url" 
            label="URL профиля" 
            class="form-input"
            outline
          />
        </div>
      </div>

      <!-- Дополнительная информация -->
      <div class="form-section">
        <h4 class="section-title">Дополнительная информация</h4>
        <va-textarea 
          v-model="form.comment" 
          label="Комментарий"
          rows="3"
          class="form-input"
          outline
        />
        
        <va-input 
          v-model="form.tags" 
          label="Теги (через запятую)"
          class="form-input"
          outline
        />
        
        <!-- Существующие теги -->
        <div v-if="existingTags.length" class="existing-tags-section">
          <div class="existing-tags-label">Существующие теги:</div>
          <div class="existing-tags-list">
            <va-chip
              v-for="tag in existingTags"
              :key="tag"
              size="small"
              color="info"
              outline
              clickable
              @click="addExistingTag(tag)"
              class="existing-tag-chip"
            >
              {{ tag }}
            </va-chip>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <va-button preset="secondary" @click="handleClose">
          Отмена
        </va-button>
        <va-button 
          :loading="loading" 
          @click="handleSubmit"
          :disabled="!form.name"
        >
          {{ isEdit ? 'Сохранить' : 'Создать' }}
        </va-button>
      </div>
    </template>
  </va-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useCreateCustomer, useUpdateCustomer, useCustomers } from '@/composables/useCustomersApi'
import { useRegions } from '@/composables/useAppwriteCollections'

const props = defineProps({
  modelValue: Boolean,
  customer: Object,
  isEdit: Boolean
})

const emit = defineEmits(['update:modelValue', 'success'])

const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const { data: regions } = useRegions()
const { data: customers } = useCustomers()
const { mutateAsync: createCustomer, isLoading: creating = ref(false) } = useCreateCustomer()
const { mutateAsync: updateCustomer, isLoading: updating = ref(false) } = useUpdateCustomer()

const loading = computed(() => creating.value || updating.value)

const form = reactive({
  name: '',
  country: '',
  contact_type: 'telegram',
  contact_url: '',
  contact_handle: '',
  phone: '',
  comment: '',
  tags: '',
  status: 'active'
})

const errors = reactive({
  name: null
})

const contactTypeOptions = [
  'telegram',
  'instagram',
  'facebook',
  'whatsapp',
  'phone',
  'Other',
  'discord'
]

const countryOptions = computed(() => regions.value || [])

// Получаем все уникальные теги из существующих клиентов
const existingTags = computed(() => {
  if (!customers.value) return []
  
  const allTags = new Set()
  customers.value.forEach(customer => {
    if (Array.isArray(customer.tags)) {
      customer.tags.forEach(tag => {
        if (tag && tag.trim()) {
          allTags.add(tag.trim())
        }
      })
    }
  })
  
  return Array.from(allTags).sort()
})

function addExistingTag(tag) {
  const currentTags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(t => t) : []
  if (!currentTags.includes(tag)) {
    currentTags.push(tag)
    form.tags = currentTags.join(', ')
  }
}
// Заполняем форму при редактировании
watch([() => props.customer, () => props.isEdit], ([customer, isEdit]) => {
  console.log('=== WATCHER TRIGGERED ===')
  console.log('customer:', customer)
  console.log('isEdit:', isEdit)
  console.log('customer?.$id:', customer?.$id)
  
  if (customer && isEdit) {
    console.log('Filling form with customer data:', customer)
    console.log('Customer ID:', customer.$id)
    Object.assign(form, {
      name: customer.name || '',
      country: customer.regions_id || '',
      contact_type: customer.contact_type || 'Telegram',
      contact_url: customer.contact_url || '',
      contact_handle: customer.contact_handle || '',
      phone: customer.phone || '',
      comment: customer.comment || '',
      tags: Array.isArray(customer.tags) ? customer.tags.join(', ') : '',
      status: customer.status || 'active'
    })
    console.log('Form after filling:', form)
  }
  console.log('=== WATCHER END ===')
}, { immediate: true })

function resetForm() {
  Object.assign(form, {
    name: '',
    country: '',
    contact_type: 'telegram',
    contact_url: '',
    contact_handle: '',
    phone: '',
    comment: '',
    tags: '',
    status: 'active'
  })
  errors.name = null
}

function handleClose() {
  isVisible.value = false
  if (!props.isEdit) {
    resetForm()
  }
}

async function handleSubmit() {
  console.log('=== HANDLE SUBMIT START ===')
  console.log('props.isEdit:', props.isEdit)
  console.log('props.customer:', props.customer)
  console.log('props.customer?.$id:', props.customer?.$id)
  
  // Валидация
  errors.name = null
  if (!form.name) {
    errors.name = 'Имя обязательно'
    return
  }

  try {
    // Обрабатываем теги - преобразуем строку в массив
    const tagsArray = form.tags 
      ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : []

    const payload = {
      name: form.name,
      regions_id: form.country || null,
      contact_type: form.contact_type,
      contact_url: form.contact_url || null,
      contact_handle: form.contact_handle || null,
      phone: form.phone || null,
      comment: form.comment || null,
      tags: tagsArray,
      status: form.status
    }

    if (props.isEdit && props.customer) {
      console.log('=== UPDATING CUSTOMER ===')
      console.log('Updating customer with ID:', props.customer.$id)
      console.log('Update payload:', payload)
      await updateCustomer({ id: props.customer.$id, ...payload })
      console.log('Customer updated successfully')
    } else {
      console.log('=== CREATING NEW CUSTOMER ===')
      console.log('Reason for creating: isEdit =', props.isEdit, ', customer =', props.customer)
      console.log('Creating new customer with payload:', payload)
      await createCustomer(payload)
      console.log('Customer created successfully')
    }

    emit('success')
    handleClose()
  } catch (error) {
    console.error('Ошибка при сохранении клиента:', error)
    alert(`Ошибка: ${error.message}`)
  }
  console.log('=== HANDLE SUBMIT END ===')
}
</script>

<style scoped>
.customer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--va-primary);
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--va-background-element);
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

.existing-tags-section {
  margin-top: 12px;
}

.existing-tags-label {
  font-size: 14px;
  color: var(--va-text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.existing-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.existing-tag-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.existing-tag-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>