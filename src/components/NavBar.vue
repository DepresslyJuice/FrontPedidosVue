<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/" class="brand-link">
        <h2>Sistema de Pedidos</h2>
      </router-link>
    </div>
    
    <div class="nav-links">
      <router-link to="/productos" class="nav-link">Productos</router-link>
      <router-link v-if="canManagePedidos" to="/pedidos" class="nav-link">Pedidos</router-link>
      <router-link v-if="canManagePedidos" to="/crear-pedido" class="nav-link">Crear Pedido</router-link>
      <router-link to="/facturas" class="nav-link">Facturación</router-link>
      
      <button @click="toggleCart" class="cart-btn" title="Ver Carrito">
        <ShoppingCart :size="24" />
        <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
      </button>

      <!-- User Menu -->
      <div class="user-menu" v-if="user" ref="menuRef">
        <button @click="toggleMenu" class="avatar-btn" :title="user.nombre">
          {{ userInitials }}
        </button>

        <transition name="fade">
          <div v-if="isOpen" class="dropdown-panel">
            <div class="user-info">
              <div class="avatar-large">{{ userInitials }}</div>
              <div class="user-details">
                <strong>{{ user.nombre }}</strong>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
            
            <div class="menu-items">
              <router-link to="/perfil" class="menu-item" @click="isOpen = false">
                <User :size="18" /> Ver Perfil
              </router-link>
              
              <button @click="handleLogout" class="menu-item logout">
                <LogOut :size="18" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </transition>
      </div>
      
      <button v-else @click="handleLogout" class="logout-btn">Salir</button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useCart } from '@/composables/useCart'
import { ShoppingCart, User, LogOut, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const { toggleCart, cartCount } = useCart()

const user = ref<any>(null)
const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

// Cargar usuario al montar
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      console.error('Error parsing user', e)
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const canManagePedidos = computed(() => {
  if (!user.value?.roles) return false
  
  // Handle both string arrays and object arrays
  const userRoles = user.value.roles.map((r: any) => {
    if (typeof r === 'string') return r.toUpperCase()
    return r.nombre?.toUpperCase()
  })
  
  return userRoles.includes('ADMIN') || userRoles.includes('SUPERVISOR') || userRoles.includes('CLIENTE')
})

const userInitials = computed(() => {
  if (!user.value?.nombre) return 'U'
  return user.value.nombre
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  isOpen.value = false
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  background: #2d3436;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.brand-link {
  text-decoration: none;
  color: white;
}

.nav-brand h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: #b2bec3;
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
  font-size: 0.95rem;
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
  font-size: 1.4rem;
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  transition: transform 0.2s;
}

.cart-btn:hover {
  transform: scale(1.1);
}

.badge {
  position: absolute;
  top: 0;
  right: -2px;
  background: #e74c3c;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
  border: 1px solid #2d3436;
}

/* User Menu */
.user-menu {
  position: relative;
}

.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #0984e3;
  color: white;
  border: 2px solid rgba(255,255,255,0.2);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-btn:hover {
  border-color: white;
  transform: scale(1.05);
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 260px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  border: 1px solid #f1f3f5;
  color: #2d3436;
  transform-origin: top right;
}

.user-info {
  padding: 1.2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dfe6e9;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-large {
  width: 48px;
  height: 48px;
  background: #0984e3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.user-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-details strong {
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: #636e72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-items {
  padding: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  color: #2d3436;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.2s;
  font-size: 0.95rem;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
}

.menu-item:hover {
  background: #f1f3f5;
  color: #0984e3;
}

.menu-item.logout:hover {
  background: #fff0f0;
  color: #d63031;
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

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>