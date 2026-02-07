<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/services/auth/register.service';
import type { RegisterRequest } from '@/models/auth.model';

const registerForm = ref<RegisterRequest>({
    nombre: '',
    email: '',
    password: '',
    cedula: ''
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);
const router = useRouter();

// Validación simple
const isFormValid = computed(() => {
    return registerForm.value.nombre.trim() !== '' &&
           registerForm.value.email.trim() !== '' &&
           registerForm.value.password.trim() !== '' &&
           registerForm.value.cedula.trim() !== '';
});

const handleRegister = async () => {
    if (loading.value) return;
    if (!isFormValid.value) {
        error.value = 'Completa todos los campos';
        return;
    }

    loading.value = true;
    error.value = '';
    
    try {
        await register(registerForm.value);
        // Redirigir al login después del registro exitoso
        router.push('/login');
    } catch (e: any) {
        console.error('Error en registro:', e);
        if (e.response?.data?.message) {
            error.value = e.response.data.message;
        } else {
            error.value = 'Ocurrió un error al registrarse. Por favor intente nuevamente.';
        }
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="register-container">
        <form @submit.prevent="handleRegister" class="register-form">
            <h2>Crear Cuenta</h2>
            
            <div class="form-group">
                <input 
                    v-model="registerForm.nombre" 
                    type="text" 
                    placeholder="Nombre completo" 
                    required
                />
            </div>

            <div class="form-group">
                <input 
                    v-model="registerForm.email" 
                    type="email" 
                    placeholder="Email" 
                    autocomplete="email"
                    required
                />
            </div>

            <div class="form-group">
                <input 
                    v-model="registerForm.cedula" 
                    type="text" 
                    placeholder="Cédula" 
                    required
                />
            </div>

            <div class="form-group password-group">
                <input 
                    v-model="registerForm.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="Contraseña" 
                    autocomplete="new-password"
                    required
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
                {{ loading ? 'Registrando...' : 'Registrarse' }}
            </button>
            
            <div class="links">
                <router-link to="/login">¿Ya tienes cuenta? Inicia sesión</router-link>
            </div>
        </form>
    </div>
</template> 

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f4f6f9;
}

.register-form {
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