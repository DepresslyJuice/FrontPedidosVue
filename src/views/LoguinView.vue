<script setup lang="ts">
import { ref, computed } from 'vue'
import { login } from '@/services/auth/auth.service'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const router = useRouter()

// Validación simple pero real
const isFormValid = computed(() => {
  return email.value.trim() !== '' && password.value.trim() !== ''
})

const clearSession = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
}

const handleLogin = async () => {
  if (loading.value) return // evita doble click
  if (!isFormValid.value) {
    error.value = 'Completa todos los campos'
    return
  }

  error.value = ''
  loading.value = true

  try {
    const response = await login({
      email: email.value.trim(),
      password: password.value
    })

    console.log('Login OK:', response)

    // Guardar sesión
    localStorage.setItem('user', JSON.stringify(response.user))
    if (response.token) {
      localStorage.setItem('token', response.token)
    }

    // redirección limpia
    router.push('/productos')

  } catch (err: any) {
    clearSession()

    if (err?.response?.status === 401) {
      error.value = 'Email o contraseña incorrectos'
    } else if (err?.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err?.message?.includes('Network')) {
      error.value = 'Error de conexión con el servidor'
    } else {
      error.value = 'Error inesperado. Intenta nuevamente'
    }

  } finally {
    loading.value = false
  }
}

// Enter para login
const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleLogin()
}
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form" @keydown="handleKey">
      <h2>Iniciar Sesión</h2>

      <div class="form-group">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          autocomplete="email"
        />
      </div>

      <div class="form-group password-group">
        <input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Contraseña"
          autocomplete="current-password"
        />

        <span class="toggle" @click="showPassword = !showPassword">
          {{ showPassword ? '🙈' : '👁' }}
        </span>
      </div>

      <div v-if="error" class="error">
        {{ error }}
      </div>

      <button type="submit" :disabled="loading || !isFormValid">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Ingresando...' : 'Ingresar' }}
      </button>

      <div class="links">
        <router-link to="/register">Crear cuenta</router-link>
        <router-link to="/recovery-password">¿Olvidaste tu contraseña?</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f6f9;
}

.login-form {
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

.password-group .toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.7;
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

.links {
  display: flex;
  justify-content: space-between;
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
