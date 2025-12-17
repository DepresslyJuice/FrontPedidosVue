import { createRouter, createWebHistory } from 'vue-router'
import ProductosView from '@/views/ProductosView.vue'
import PedidosView from '@/views/PedidosView.vue'
import CrearPedidoView from '@/views/CrearPedidoView.vue'
import LoguinView from '@/views/LoguinView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoguinView
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
      meta: { requiresAuth: true }
    },
    {
      path: '/crear-pedido',
      name: 'crear-pedido',
      component: CrearPedidoView,
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
})

export default router
