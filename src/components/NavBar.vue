<template>
  <nav class="navbar">
    <div class="nav-brand">
      <h2>Sistema de Pedidos</h2>
    </div>
    
    <div class="nav-links">
      <router-link to="/productos" class="nav-link">Productos</router-link>
      <router-link to="/pedidos" class="nav-link">Pedidos</router-link>
      <router-link to="/crear-pedido" class="nav-link">Crear Pedido</router-link>
      <button @click="logout" class="logout-btn">Cerrar Sesión</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

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
}

.nav-brand h2 {
  margin: 0;
  color: white;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #34495e;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}
</style>