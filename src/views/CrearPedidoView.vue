<template>
  <div class="crear-pedido-container">
    <div class="header">
      <h1>Crear Nuevo Pedido</h1>
      <button @click="crearPedidoAction" class="btn-primary" :disabled="carrito.length === 0">
        Crear Pedido ({{ carrito.length }} items)
      </button>
    </div>
    
    <div class="filters">
      <input 
        v-model="search" 
        @keyup.enter="handleSearch"
        placeholder="Buscar productos..."
        class="search-input"
      />
      <button @click="handleSearch" class="btn-secondary">Buscar</button>
    </div>
    
    <div v-if="error" class="error">{{ error }}</div>
    
    <div v-if="loading" class="loading">Cargando productos...</div>
    
    <div v-else>
      <table class="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.idProducto">
            <td>{{ producto.idProducto }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.descripcion }}</td>
            <td>${{ producto.precio }}</td>
            <td>
              <input 
                type="number" 
                min="1" 
                v-model="cantidades[producto.idProducto]" 
                placeholder="0"
                class="cantidad-input"
              >
            </td>
            <td class="actions">
              <button 
                @click="agregarAlPedido(producto)" 
                :disabled="!cantidades[producto.idProducto]" 
                class="btn-edit"
              >
                Agregar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Carrito Modal -->
    <div v-if="showCarrito" class="modal-overlay" @click="closeCarrito">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Carrito de Pedido</h3>
          <button @click="closeCarrito" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div v-if="carrito.length === 0" class="empty-cart">
            No hay productos en el carrito
          </div>
          <div v-else>
            <table class="carrito-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in carrito" :key="item.idProducto">
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.cantidad }}</td>
                  <td>${{ item.precio }}</td>
                  <td>${{ item.subtotal }}</td>
                  <td>
                    <button @click="removerDelCarrito(item.idProducto)" class="btn-delete">
                      Quitar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="carrito-total">
              <h3>Total: ${{ totalPedido }}</h3>
            </div>
            
            <!-- Formulario de datos del pedido -->
            <div class="form-section">
              <h4>Datos del Pedido</h4>
              <div class="form-group">
                <label>Método de Pago:</label>
                <select v-model="formPedido.metodoPago" required>
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Dirección de Entrega:</label>
                <input v-model="formPedido.direccion" type="text" required placeholder="Dirección completa">
              </div>
              
              <div class="form-group">
                <label>Observaciones:</label>
                <textarea v-model="formPedido.observaciones" placeholder="Instrucciones especiales (opcional)"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button @click="limpiarCarrito" class="btn-secondary">Limpiar Carrito</button>
            <button @click="crearPedidoAction" class="btn-primary" :disabled="!canCreateOrder">
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante del carrito -->
    <button v-if="carrito.length > 0" @click="showCarrito = true" class="cart-float">
      🛒 {{ carrito.length }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProductos } from '@/services/producto/producto.service'
import { crearPedido } from '@/services/pedido/pedido.service'
import type { Producto, FilterProductoDto } from '@/models/producto.model'

interface ItemCarrito {
  idProducto: number
  nombre: string
  cantidad: number
  precio: number
  subtotal: number
}

const router = useRouter()
const productos = ref<Producto[]>([])
const loading = ref(false)
const error = ref('')
const showCarrito = ref(false)
const cantidades = ref<Record<number, number>>({})
const carrito = ref<ItemCarrito[]>([])
const search = ref('')
const filters = ref<FilterProductoDto>({
  page: 1,
  limit: 10,
  activo: true
})

const formPedido = ref({
  metodoPago: '',
  direccion: '',
  observaciones: ''
})

const totalPedido = computed(() => {
  return carrito.value.reduce((total, item) => total + item.subtotal, 0)
})

const canCreateOrder = computed(() => {
  return carrito.value.length > 0 && formPedido.value.metodoPago && formPedido.value.direccion
})

const cargarProductos = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await getProductos(filters.value)
    productos.value = response.data
  } catch (err: any) {
    error.value = 'Error al cargar productos'
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

const agregarAlPedido = (producto: Producto) => {
  const cantidad = cantidades.value[producto.idProducto]
  if (!cantidad || cantidad <= 0) return

  const itemExistente = carrito.value.find(item => item.idProducto === producto.idProducto)
  
  if (itemExistente) {
    itemExistente.cantidad += cantidad
    itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio
  } else {
    carrito.value.push({
      idProducto: producto.idProducto,
      nombre: producto.nombre,
      cantidad,
      precio: Number(producto.precio),
      subtotal: cantidad * Number(producto.precio)
    })
  }
  
  cantidades.value[producto.idProducto] = 0
}

const removerDelCarrito = (idProducto: number) => {
  const index = carrito.value.findIndex(item => item.idProducto === idProducto)
  if (index > -1) {
    carrito.value.splice(index, 1)
  }
}

const limpiarCarrito = () => {
  carrito.value = []
  showCarrito.value = false
}

const closeCarrito = () => {
  showCarrito.value = false
}

const crearPedidoAction = async () => {
  if (!canCreateOrder.value) return
  
  try {
    const detalles = carrito.value.map(item => ({
      idProducto: item.idProducto,
      cantidad: item.cantidad
    }))
    
    await crearPedido({
      metodoPago: formPedido.value.metodoPago,
      direccion: formPedido.value.direccion,
      observaciones: formPedido.value.observaciones || undefined,
      detalles
    })
    
    alert('Pedido creado exitosamente')
    limpiarCarrito()
    formPedido.value = { metodoPago: '', direccion: '', observaciones: '' }
    router.push('/pedidos')
  } catch (error: any) {
    error.value = error.response?.data?.message || 'Error al crear el pedido'
  }
}

onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.crear-pedido-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary, .btn-secondary, .btn-edit, .btn-delete {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-edit {
  background: #28a745;
  color: white;
}

.btn-edit:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.productos-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.productos-table th,
.productos-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.productos-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.cantidad-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  white-space: nowrap;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-bottom: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.carrito-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.carrito-table th,
.carrito-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.carrito-table th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.carrito-total {
  text-align: right;
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.carrito-total h3 {
  margin: 0;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.empty-cart {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.cart-float {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 15px 20px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 100;
}

.cart-float:hover {
  background: #0056b3;
}

.form-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.form-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}
</style>