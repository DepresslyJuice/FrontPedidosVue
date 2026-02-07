<template>
  <div class="crear-pedido-container">
    <div class="header">
      <div class="header-text">
        <h1>Realizar Pedido</h1>
        <p class="subtitle">Explora nuestros productos y arma tu pedido</p>
      </div>
      
      <!-- Search Bar -->
      <div class="search-container">
        <input 
          v-model="search" 
          @keyup.enter="handleSearch"
          placeholder="¿Qué estás buscando?"
          class="search-input"
        />
        <button @click="handleSearch" class="btn-search">🔍</button>
      </div>
    </div>
    
    <!-- Checkout/Form Section (Visible only when checkout param is present) -->
    <div v-if="isCheckoutMode" class="checkout-section">
      <div class="checkout-header">
        <button @click="cancelCheckout" class="btn-back">← Volver a productos</button>
        <h2>Finalizar Compra</h2>
      </div>

      <div class="checkout-grid">
        <div class="order-summary">
          <h3>Resumen del Pedido</h3>
          <div v-if="cartItems.length === 0" class="empty-state">
            Tu carrito está vacío
          </div>
          <div v-else class="summary-items">
            <div v-for="item in cartItems" :key="item.idProducto" class="summary-item">
              <span>{{ item.nombre }} (x{{ item.cantidad }})</span>
              <span>${{ item.subtotal }}</span>
            </div>
            <div class="summary-total">
              <span>Total a Pagar</span>
              <span>${{ total }}</span>
            </div>
          </div>
        </div>

        <div class="order-form">
          <h3>Datos de Envío y Pago</h3>
          <form @submit.prevent="crearPedidoAction">
            <div class="form-group">
              <label>Método de Pago</label>
              <select v-model="formPedido.metodoPago" required class="input-field">
                <option value="">Selecciona un método</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="transferencia">Transferencia Bancaria</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Dirección de Entrega</label>
              <input 
                v-model="formPedido.direccion" 
                type="text" 
                required 
                placeholder="Calle, número, colonia..."
                class="input-field"
              >
            </div>
            
            <div class="form-group">
              <label>Observaciones (Opcional)</label>
              <textarea 
                v-model="formPedido.observaciones" 
                placeholder="Instrucciones para el repartidor, etc."
                class="input-field textarea"
              ></textarea>
            </div>

            <div v-if="error" class="error-msg">{{ error }}</div>

            <button type="submit" class="btn-primary btn-block" :disabled="!canCreateOrder">
              Crear Pedido
            </button>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Product Grid (Default View) -->
    <div v-else>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="cargarProductos" class="btn-retry">Intentar de nuevo</button>
      </div>

      <div v-else class="products-grid">
        <ProductCard 
          v-for="producto in productos" 
          :key="producto.idProducto" 
          :producto="producto" 
        />
      </div>

      <!-- Pagination -->
      <div v-if="!loading && productos.length > 0" class="pagination">
         <button 
          @click="changePage(pagination.currentPage - 1)" 
          :disabled="pagination.currentPage <= 1"
          class="btn-page"
        >
          Anterior
        </button>
        <span class="page-info">Página {{ pagination.currentPage }} de {{ pagination.totalPages }}</span>
        <button 
          @click="changePage(pagination.currentPage + 1)" 
          :disabled="pagination.currentPage >= pagination.totalPages"
          class="btn-page"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductos } from '@/services/producto/producto.service'
import { crearPedido } from '@/services/pedido/pedido.service'
import type { Producto, FilterProductoDto } from '@/models/producto.model'
import { useCart } from '@/composables/useCart'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const route = useRoute()
const { cartItems, total, clearCart } = useCart()

const productos = ref<Producto[]>([])
const loading = ref(false)
const error = ref('')
const search = ref('')

const filters = ref<FilterProductoDto>({
  page: 1,
  limit: 12, // Increased limit for grid view
  activo: true
})

const pagination = ref({
  total: 0,
  totalPages: 0,
  currentPage: 1
})

const formPedido = ref({
  metodoPago: '',
  direccion: '',
  observaciones: ''
})

const isCheckoutMode = computed(() => route.query.checkout === 'true')

const canCreateOrder = computed(() => {
  return cartItems.value.length > 0 && formPedido.value.metodoPago && formPedido.value.direccion && !loading.value
})

const cargarProductos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await getProductos(filters.value)
    productos.value = response.data
    pagination.value = {
      total: response.total,
      totalPages: response.totalPages,
      currentPage: response.page
    }
  } catch (err: any) {
    error.value = 'No se pudieron cargar los productos.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  filters.value.search = search.value
  filters.value.page = 1
  cargarProductos()
}

const changePage = (page: number) => {
  filters.value.page = page
  cargarProductos()
}

const cancelCheckout = () => {
  router.push('/crear-pedido')
}

const crearPedidoAction = async () => {
  if (!canCreateOrder.value) return
  loading.value = true
  
  try {
    const detalles = cartItems.value.map(item => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad
    }))
    
    await crearPedido({
      metodoPago: formPedido.value.metodoPago,
      direccion: formPedido.value.direccion,
      observaciones: formPedido.value.observaciones || undefined,
      detalles
    })
    
    clearCart()
    alert('Pedido creado exitosamente!')
    router.push('/pedidos')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al crear el pedido'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarProductos()
})

// Watch query param changes to handle browser back button
watch(() => route.query.checkout, () => {
  // Logic is handled by computed `isCheckoutMode`
})
</script>

<style scoped>
.crear-pedido-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-text h1 {
  margin: 0;
  font-size: 2.5rem;
  color: #2d3436;
}

.subtitle {
  color: #636e72;
  margin: 0.5rem 0 0 0;
}

.search-container {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: 1px solid #dfe6e9;
  border-radius: 50px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #0984e3;
}

.btn-search {
  background: #0984e3;
  color: white;
  border: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Grid Layout */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
}

.btn-retry, .btn-page {
  padding: 0.6rem 1.2rem;
  background: white;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  color: #2d3436;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f1f3f5;
  border-color: #b2bec3;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Checkout Section */
.checkout-section {
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.checkout-header {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: none;
  border: none;
  color: #636e72;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: underline;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.order-summary, .order-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
}

.summary-items {
  margin-top: 1.5rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #f1f3f5;
  color: #636e72;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
  font-weight: 800;
  font-size: 1.3rem;
  color: #2d3436;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3436;
}

.input-field {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #0984e3;
  outline: none;
}

.textarea {
  min-height: 100px;
  resize: vertical;
}

.btn-block {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  margin-top: 1rem;
  background-color: #0984e3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-block:hover:not(:disabled) {
  background-color: #0773c5;
}

.btn-block:disabled {
  background-color: #b2bec3;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  background: #fadbd8;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}
</style>