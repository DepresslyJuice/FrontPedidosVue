<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { recoveryPassword } from '@/services/auth/recovery_password.service'
import type { RecoveryPasswordRequest } from '@/models/auth.model'

const form = ref<RecoveryPasswordRequest>({
  email: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

const router = useRouter()

// validación básica real
const isValidEmail = computed(() => {
  const email = form.value.email.trim()
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
})

const handleRecoveryPassword = async () => {
  if (loading.value) return
  if (!isValidEmail.value) {
    error.value = 'Ingresa un correo válido'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    await recoveryPassword({
      email: form.value.email.trim()
    })

    success.value =
      'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'

    // redirección suave luego de éxito
    setTimeout(() => {
      router.push('/login')
    }, 2500)

  } catch (e: any) {
    console.error('Recovery error:', e)

    if (e?.response?.data?.message) {
      error.value = e.response.data.message
    } else if (e?.response?.status === 404) {
      error.value = 'El servicio no fue encontrado (Error 404). Verifica la URL.'
    } else if (e?.message?.includes('Network')) {
      error.value = 'Error de conexión con el servidor'
    } else {
      error.value = 'No se pudo procesar la solicitud'
    }

  } finally {
    loading.value = false
  }
}

// Enter submit
const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleRecoveryPassword()
}
</script>

<template>
  <div class="recovery-container">
    <form @submit.prevent="handleRecoveryPassword" class="recovery-form" @keydown="handleKey">
      <h2>Recuperar Contraseña</h2>

      <div class="form-group">
        <input
          v-model="form.email"
          type="email"
          placeholder="Correo electrónico"
          autocomplete="email"
          required
        />
      </div>

      <!-- error -->
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <!-- success -->
      <div v-if="success" class="success">
        {{ success }}
      </div>

      <button
        type="submit"
        :disabled="loading || !isValidEmail"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Enviando...' : 'Enviar recuperación' }}
      </button>

      <div class="links">
        <router-link to="/login">← Volver al login</router-link>
      </div>

    </form>
  </div>
</template>

<style scoped>
.recovery-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f6f9;
}

.recovery-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
  position: relative;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: .2s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button:hover:not(:disabled) {
  background: #0069d9;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: #d93025;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.success {
  color: #059669;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
  background: #ecfdf5;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #a7f3d0;
}

.links {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.9rem;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
