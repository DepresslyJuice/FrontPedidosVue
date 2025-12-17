<script setup lang="ts">
import { ref } from 'vue'
import { login } from '@/services/auth/auth.service'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const user = await login({
      email: email.value,
      password: password.value
    })

    console.log('Response from API:', user)

    // Guardar datos del usuario y token por separado
    localStorage.setItem('user', JSON.stringify(user.user))
    if (user.token) {
      localStorage.setItem('token', user.token)
    }

    router.push('/productos')

  } catch (err: any) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    error.value =
      err.response?.data?.message || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Iniciar Sesión</h2>
      
      <div class="form-group">
        <input 
          v-model="email" 
          type="email" 
          placeholder="Email" 
          required
        />
      </div>
      
      <div class="form-group">
        <input 
          v-model="password" 
          type="password" 
          placeholder="Contraseña" 
          required
        />
      </div>
      
      <div v-if="error" class="error">{{ error }}</div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Ingresar' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-bottom: 1rem;
  text-align: center;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
}
</style>
