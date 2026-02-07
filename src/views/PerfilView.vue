<template>
  <div class="profile-container">
    <div class="page-header">
      <h1>Mi Perfil</h1>
      <p class="subtitle">Gestiona tu información personal y seguridad</p>
    </div>

    <div class="profile-content">
      <!-- Tarjeta de Información -->
      <div class="card info-card">
        <div class="card-header">
          <h3>Información Personal</h3>
        </div>
        <div class="card-body">
          <div class="avatar-placeholder">
            {{ userInitials }}
          </div>
          <div class="info-list">
            <div class="info-item">
              <label>Nombre Completo</label>
              <p>{{ user.nombre }}</p>
            </div>
            <div class="info-item">
              <label>Correo Electrónico</label>
              <p>{{ user.email }}</p>
            </div>
            <div class="info-item">
              <label>Rol</label>
              <div class="roles">
                <span v-for="rol in user.roles" :key="rol" class="role-badge">
                  {{ rol }}
                </span>
              </div>
            </div>
            <div class="info-item">
              <label>Cédula</label>
              <p>{{ user.cedula || 'No registrada' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Cambio de Contraseña -->
      <div class="card security-card">
        <div class="card-header">
          <h3>Seguridad</h3>
          <p class="card-subtitle">Actualiza tu contraseña</p>
        </div>
        <div class="card-body">
          <form @submit.prevent="onSubmit" autocomplete="off">
            <div class="form-group">
              <label>Contraseña Actual</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.currentPassword"
                  :type="showCurrent ? 'text' : 'password'"
                  placeholder="Ingresa tu contraseña actual"
                  required
                >
                <button type="button" class="toggle-btn" @click="showCurrent = !showCurrent">
                  <EyeOff v-if="showCurrent" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Nueva Contraseña</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.newPassword"
                  :type="showNew ? 'text' : 'password'"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minlength="6"
                >
                <button type="button" class="toggle-btn" @click="showNew = !showNew">
                  <EyeOff v-if="showNew" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  required
                  :class="{ 'error-border': form.confirmPassword && form.newPassword !== form.confirmPassword }"
                >
              </div>
              <small v-if="form.confirmPassword && form.newPassword !== form.confirmPassword" class="error-text">
                Las contraseñas no coinciden
              </small>
            </div>

            <!-- Mensajes -->
            <div v-if="error" class="alert error">{{ error }}</div>
            <div v-if="success" class="alert success">{{ success }}</div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading || !isValidForm">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { changePassword } from '@/services/auth/auth.service'
import { Eye, EyeOff } from 'lucide-vue-next'

interface User {
  nombre: string
  email: string
  roles: string[]
  cedula?: string
}

const user = ref<User>({
  nombre: '',
  email: '',
  roles: [],
  cedula: ''
})

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showCurrent = ref(false)
const showNew = ref(false)

onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Error al leer usuario', e)
    }
  }
})

const userInitials = computed(() => {
  if (!user.value.nombre) return 'U'
  return user.value.nombre
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const isValidForm = computed(() => {
  return (
    form.value.currentPassword.length > 0 &&
    form.value.newPassword.length >= 6 &&
    form.value.newPassword === form.value.confirmPassword
  )
})

const onSubmit = async () => {
  if (loading.value) return
  if (!isValidForm.value) return

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await changePassword({
      currentPassword: form.value.currentPassword,
      newPassword: form.value.newPassword
    })
    
    success.value = response.message || 'Contraseña actualizada correctamente'
    
    // Limpiar formulario
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    
  } catch (e: any) {
    console.error(e)
    if (e?.response?.data?.message) {
      error.value = e.response.data.message
    } else {
      error.value = 'Error al cambiar la contraseña'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: #2d3436;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  margin: 0;
  color: #2d3436;
}

.subtitle {
  color: #636e72;
  margin-top: 0.5rem;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  border: 1px solid #f1f3f5;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  background: #fff;
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.card-subtitle {
  margin: 0.5rem 0 0 0;
  color: #636e72;
  font-size: 0.9rem;
}

.card-body {
  padding: 1.5rem;
}

/* Info Card Styles */
.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: #0984e3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 2rem auto;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.info-item label {
  display: block;
  font-size: 0.85rem;
  color: #636e72;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-item p {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.role-badge {
  background: #dfe6e9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #2d3436;
  margin-right: 0.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #0984e3;
}

.error-border {
  border-color: #fab1a0 !important;
}

.error-text {
  color: #d63031;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: block;
}

.toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 1.1rem;
  opacity: 0.6;
}

.toggle-btn:hover {
  opacity: 1;
}

.form-actions {
  margin-top: 2rem;
}

.btn-primary {
  width: 100%;
  padding: 0.9rem;
  background: #0984e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #00cec9;
}

.btn-primary:disabled {
  background: #b2bec3;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.alert.error {
  background: #ffeaa7;
  color: #d63031;
  border: 1px solid #fab1a0;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
