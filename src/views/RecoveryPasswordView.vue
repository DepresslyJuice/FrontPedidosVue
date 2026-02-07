<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { recoveryPassword, resetPassword } from '@/services/auth/recovery_password.service'

const router = useRouter()

// Estado del formulario
const step = ref(1) // 1: Solicitud, 2: Reset
const form = ref({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)

// Validaciones
const isValidEmail = computed(() => {
  const email = form.value.email.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
})

const isValidReset = computed(() => {
  return (
    form.value.code.length >= 6 &&
    form.value.newPassword.length >= 6 &&
    form.value.newPassword === form.value.confirmPassword
  )
})

// Paso 1: Solicitar código
const handleRequest = async () => {
  if (loading.value) return
  if (!isValidEmail.value) {
    error.value = 'Ingresa un correo válido'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await recoveryPassword({ email: form.value.email.trim() })
    success.value = 'Código enviado. Revisa tu correo.'
    // Avanzar automáticamente al paso 2 después de 1.5s
    setTimeout(() => {
      step.value = 2
      success.value = ''
    }, 1500)
  } catch (e: any) {
    handleError(e)
  } finally {
    loading.value = false
  }
}

// Paso 2: Restablecer contraseña
const handleReset = async () => {
  if (loading.value) return
  if (!isValidReset.value) {
    if (form.value.newPassword !== form.value.confirmPassword) {
      error.value = 'Las contraseñas no coinciden'
    } else {
      error.value = 'Verifica el código y la contraseña (mínimo 6 caracteres)'
    }
    return
  }

  loading.value = true
  error.value = ''

  try {
    await resetPassword({
      email: form.value.email.trim(),
      code: form.value.code.trim(),
      newPassword: form.value.newPassword
    })
    
    success.value = 'Contraseña actualizada correctamente'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e: any) {
    handleError(e)
  } finally {
    loading.value = false
  }
}

const handleError = (e: any) => {
  console.error('Error:', e)
  if (e?.response?.data?.message) {
    error.value = e.response.data.message
  } else if (e?.response?.status === 404) {
    error.value = 'Servicio no encontrado (Error 404)'
  } else {
    error.value = 'Ocurrió un error inesperado. Intenta nuevamente.'
  }
}

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    step.value === 1 ? handleRequest() : handleReset()
  }
}
</script>

<template>
  <div class="recovery-container">
    <div class="recovery-card card-animation">
      <h2>{{ step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña' }}</h2>

      <!-- Paso 1: Email -->
      <div v-if="step === 1" class="step-content">
        <p class="step-desc">Ingresa tu correo para recibir un código de recuperación.</p>
        
        <div class="form-group">
          <input
            v-model="form.email"
            type="email"
            placeholder="Correo electrónico"
            autocomplete="email"
            class="input-field"
            @keydown="handleKey"
            autofocus
          />
        </div>
      </div>

      <!-- Paso 2: Código y Nueva Contraseña -->
      <div v-else class="step-content">
        <p class="step-desc">
          Hemos enviado un código a <strong>{{ form.email }}</strong>.
          <br><small>(Expira en 15 minutos)</small>
        </p>
        
        <div class="form-group">
          <input
            v-model="form.code"
            type="text"
            placeholder="Código de 6 dígitos"
            class="input-field code-input"
            maxlength="6"
            @keydown="handleKey"
            autofocus
          />
        </div>

        <div class="form-group password-group">
          <input
            v-model="form.newPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Nueva contraseña"
            class="input-field"
            @keydown="handleKey"
          />
          <span class="toggle" @click="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁' }}
          </span>
        </div>

        <div class="form-group">
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            class="input-field"
            :class="{'error-border': form.confirmPassword && form.newPassword !== form.confirmPassword}"
            @keydown="handleKey"
          />
        </div>
      </div>

      <!-- Mensajes -->
      <div v-if="error" class="alert error">{{ error }}</div>
      <div v-if="success" class="alert success">{{ success }}</div>

      <!-- Botones -->
      <button
        v-if="step === 1"
        @click="handleRequest"
        :disabled="loading || !isValidEmail"
        class="btn-primary"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Enviando...' : 'Enviar Código' }}
      </button>

      <button
        v-else
        @click="handleReset"
        :disabled="loading || !isValidReset"
        class="btn-primary"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Actualizar Contraseña' : 'Cambiar Contraseña' }}
      </button>

      <div class="links">
        <a v-if="step === 2" href="#" @click.prevent="step = 1" class="back-link">← ¿No recibiste el código? / Editar correo</a>
        <router-link to="/login" class="login-link">Volver al login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recovery-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f6f9;
  padding: 1rem;
}

.recovery-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,.05);
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
}

.card-animation {
  animation: slideUp 0.4s ease-out;
}

h2 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2d3436;
}

.step-desc {
  text-align: center;
  color: #636e72;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1rem;
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #fff;
  color: #2d3436;
}

.input-field:focus {
  border-color: #0984e3;
  outline: none;
  box-shadow: 0 0 0 3px rgba(9, 132, 227, 0.1);
}

.code-input {
  letter-spacing: 4px;
  text-align: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.error-border {
  border-color: #e74c3c !important;
}

.password-group .toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  opacity: 0.6;
  padding: 4px;
  user-select: none;
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
  gap: 8px;
  margin-top: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background: #00cec9;
}

.btn-primary:disabled {
  background: #b2bec3;
  cursor: not-allowed;
}

.alert {
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

.alert.error {
  background: #fab1a0;
  color: #c0392b;
  border: 1px solid #ff7675;
}

.alert.success {
  background: #55efc4;
  color: #1a8e70; /* Texto más oscuro para legibilidad */
  border: 1px solid #00b894;
  background-color: #d1fae5;
}

.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.back-link, .login-link {
  color: #636e72;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover, .login-link:hover {
  color: #0984e3;
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

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile responsive adjustments */
@media (max-width: 480px) {
  .recovery-card {
    padding: 1.5rem;
  }
}
</style>
