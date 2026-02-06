<template>
  <nav class="navbar">
    <div class="nav-brand">
      <h2>Sistema de Pedidos</h2>
    </div>
    
    <div class="nav-links">
      <router-link to="/productos" class="nav-link">Productos</router-link>
      <router-link v-if="isAdmin" to="/pedidos" class="nav-link">Pedidos</router-link>
      <router-link v-if="isAdmin" to="/crear-pedido" class="nav-link">Crear Pedido</router-link>
      
      <button @click="toggleCart" class="cart-btn">
        🛒 
        <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
      </button>

      <button @click="logout" class="logout-btn">Salir</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const { toggleCart, cartCount } = useCart()

const isAdmin = computed(() => {
  const user = localStorage.getItem('user')
  if (!user) return false
  const userData = JSON.parse(user)
  return userData.roles?.includes('admin')
})

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #2c3e50;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: white;
  background: rgba(255,255,255,0.1);
}

.cart-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  position: relative;
  padding: 0 0.5rem;
}

.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.logout-btn {
  background: transparent;
  color: #fab1a0;
  border: 1px solid #fab1a0;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: #fab1a0;
  color: #2c3e50;
}
</style>