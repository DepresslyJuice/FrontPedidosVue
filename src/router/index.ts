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
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'SUPERVISOR', 'CLIENTE']
      }
    },
    {
      path: '/crear-pedido',
      name: 'crear-pedido',
      component: CrearPedidoView,
      meta: {
        requiresAuth: true,
        allowedRoles: ['ADMIN', 'SUPERVISOR', 'CLIENTE']
      }
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
        allowedRoles: ['ADMIN', 'VENDEDOR', 'SUPERVISOR']
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

  console.log('🔍 Router Guard - Navigating to:', to.path)
  console.log('📦 Raw user from localStorage:', user)

  // Si la ruta requiere autenticación y no hay usuario, redirigir al login
  if (to.meta.requiresAuth && !user) {
    console.log('❌ No user found, redirecting to login')
    return '/login'
  }

  // Parse user if exists
  const userData = user ? JSON.parse(user) : null

  if (userData) {
    console.log('👤 Parsed user data:', userData)
    console.log('🎭 User roles array:', userData.roles)
  }

  // Check for allowed roles
  if (to.meta.allowedRoles && userData) {
    const allowedRoles = to.meta.allowedRoles as string[]

    // Handle both string arrays and object arrays
    const userRoles = userData.roles?.map((r: any) => {
      // If role is already a string, return it
      if (typeof r === 'string') return r
      // If role is an object with nombre property, extract it
      return r.nombre
    }) || []

    console.log('🔐 Checking allowed roles...')
    console.log('   Required roles:', allowedRoles)
    console.log('   User role names:', userRoles)

    // Case-insensitive comparison
    const userRolesUpper = userRoles.map((r: string) => r?.toUpperCase())
    const allowedRolesUpper = allowedRoles.map((r: string) => r.toUpperCase())
    const hasRole = allowedRolesUpper.some(role => userRolesUpper.includes(role))

    console.log('   Has required role?', hasRole)

    if (!hasRole) {
      console.warn('❌ Access denied. User roles:', userRoles, 'Required:', allowedRoles)
      return '/productos' // Redirect to default allowed page
    }
    console.log('✅ Access granted!')
  }

  // Legacy admin check (kept for compatibility with existing routes)
  if (to.meta.requiresAdmin && userData) {
    // Handle both string arrays and object arrays
    const userRoles = userData.roles?.map((r: any) => {
      if (typeof r === 'string') return r
      return r.nombre
    }) || []

    console.log('🔐 Checking admin access...')
    console.log('   User roles:', userRoles)

    // Case-insensitive comparison
    const userRolesUpper = userRoles.map((r: string) => r?.toUpperCase())
    if (!userRolesUpper.includes('ADMIN')) {
      console.warn('❌ Admin access denied. User roles:', userRoles)
      return '/productos'
    }
    console.log('✅ Admin access granted!')
  }
})

export default router
