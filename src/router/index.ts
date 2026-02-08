import { createRouter, createWebHistory } from 'vue-router'
import ProductosView from '@/views/ProductosView.vue'
import PedidosView from '@/views/PedidosView.vue'
import CrearPedidoView from '@/views/CrearPedidoView.vue'
import LoguinView from '@/views/LoguinView.vue'
import RegisterView from '@/views/RegisterView.vue'
import RecoveryPasswordView from '@/views/RecoveryPasswordView.vue'
import PerfilView from '@/views/PerfilView.vue'
import FacturasView from '@/views/FacturasView.vue'
import FacturaDirectaView from '@/views/FacturaDirectaView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoguinView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/recovery-password',
      name: 'recovery-password',
      component: RecoveryPasswordView
    },
    {
      path: '/productos',
      name: 'productos',
      component: ProductosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pedidos',
      name: 'pedidos',
      component: PedidosView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/crear-pedido',
      name: 'crear-pedido',
      component: CrearPedidoView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: { requiresAuth: true }
    },
    {
      path: '/facturas/directa',
      name: 'factura-directa',
      component: FacturaDirectaView,
      meta: {
        requiresAuth: true,
        allowedRoles: ['admin', 'vendedor', 'supervisor']
      }
    },
    {
      path: '/facturas',
      name: 'facturas',
      component: FacturasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ],
})

router.beforeEach((to) => {
  const user = localStorage.getItem('user')

  // Si la ruta requiere autenticación y no hay usuario, redirigir al login
  if (to.meta.requiresAuth && !user) {
    return '/login'
  }

  // Parse user if exists
  const userData = user ? JSON.parse(user) : null

  // Check for allowed roles
  if (to.meta.allowedRoles && userData) {
    const roles = to.meta.allowedRoles as string[]
    const hasRole = roles.some(role => userData.roles?.includes(role))
    if (!hasRole) {
      return '/productos' // Redirect to default allowed page
    }
  }

  // Legacy admin check (kept for compatibility with existing routes)
  if (to.meta.requiresAdmin && userData) {
    if (!userData.roles?.includes('admin')) {
      return '/productos'
    }
  }
})

export default router
