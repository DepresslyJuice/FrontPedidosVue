<script setup lang="ts">
import { ref } from 'vue';
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
const router = useRouter();

const handleRegister = async () => {
    loading.value = true;
    error.value = '';
    
    try {
        await register(registerForm.value);
        // Redirigir al login después del registro exitoso
        router.push('/login');
    } catch (e: any) {
        console.error('Error en registro:', e);
        if (e.response && e.response.data && e.response.data.message) {
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
    <div class = "register-container">
        <form @submit.prevent="handleRegister" class = "register-form">
            <h1>Register</h1>
            <div class = "form-group">
                <input 
                    v-model="registerForm.nombre" 
                    type="text" 
                    placeholder="Nombre" 
                    required
                />
            </div>
            <div class = "form-group">
                <input 
                    v-model="registerForm.email" 
                    type="email" 
                    placeholder="Email" 
                    required
                />
            </div>
            <div class = "form-group">
                <input 
                    v-model="registerForm.password" 
                    type="password" 
                    placeholder="Contraseña" 
                    required
                />
            </div>
            <div class = "form-group">
                <input 
                    v-model="registerForm.cedula" 
                    type="text" 
                    placeholder="Cedula" 
                    required
                />
            </div>
            <div v-if="error" class="error">
                {{ error }}
            </div>
            <button type="submit" :disabled="loading">
                {{ loading ? 'Registrando...' : 'Registrarse' }}
            </button>
        </form>
    </div>
</template> 

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.register-form {
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