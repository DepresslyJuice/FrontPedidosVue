<template>
  <div class="pedidos-container">
    <h1>Gestión de Pedidos</h1>
    
    <!-- Filtros -->
    <div class="filters">
      <select v-model="filters.estado">
        <option value="">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="confirmado">Confirmado</option>
        <option value="preparando">Preparando</option>
        <option value="listo">Listo</option>
        <option value="entregado">Entregado</option>
        <option value="cancelado">Cancelado</option>
      </select>
      
      <input 
        type="date" 
        v-model="filters.fechaDesde" 
        placeholder="Fecha desde"
      >
      
      <input 
        type="date" 
        v-model="filters.fechaHasta" 
        placeholder="Fecha hasta"
      >
      
      <button @click="cargarPedidos">Filtrar</button>
      <button @click="limpiarFiltros">Limpiar</button>
    </div>

    <!-- Lista de pedidos -->
    <div class="pedidos-list">
      <div 
        v-for="pedido in pedidos" 
        :key="pedido.idPedido" 
        class="pedido-card"
      >
        <div class="pedido-header">
          <h3>Pedido #{{ pedido.idPedido }}</h3>
          <span :class="`estado ${pedido.estado}`">{{ pedido.estado }}</span>
        </div>
        
        <div class="pedido-info">
          <p><strong>Fecha:</strong> {{ formatDate(pedido.fecha) }}</p>
          <p><strong>Total:</strong> ${{ pedido.total }}</p>
          <p><strong>Cliente:</strong> {{ pedido.nombreCliente }}</p>
          <p><strong>Método de Pago:</strong> {{ pedido.metodoPago }}</p>
          <p><strong>Dirección:</strong> {{ pedido.direccion }}</p>
          <p v-if="pedido.observaciones"><strong>Observaciones:</strong> {{ pedido.observaciones }}</p>
        </div>

        <div class="pedido-detalles" v-if="pedido.detalles && pedido.detalles.length > 0">
          <h4>Productos:</h4>
          <ul>
            <li v-for="detalle in pedido.detalles" :key="detalle.idDetalle">
              {{ detalle.nombreProducto }} - Cantidad: {{ detalle.cantidad }} - Precio: ${{ detalle.precioUnitario }} - Subtotal: ${{ detalle.subtotal }}
            </li>
          </ul>
        </div>
        <div v-else class="pedido-detalles">
          <p><em>Detalles no disponibles</em></p>
        </div>

        <div class="pedido-actions">
          <select 
            v-if="canChangeStatus(pedido.estado)" 
            @change="cambiarEstadoPedido(pedido.idPedido, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">Cambiar estado</option>
            <option value="confirmado">Confirmar</option>
            <option value="preparando">Preparando</option>
            <option value="listo">Listo</option>
            <option value="entregado">Entregado</option>
          </select>
          
          <button 
            v-if="pedido.estado === 'pendiente'" 
            @click="cancelarPedidoAction(pedido.idPedido)"
            class="btn-cancel"
          >
            Cancelar
          </button>
          
          <button 
            v-if="pedido.estado === 'cancelado'" 
            @click="eliminarPedidoAction(pedido.idPedido)"
            class="btn-delete"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="cambiarPagina(page - 1)" 
        :disabled="page <= 1"
      >
        Anterior
      </button>
      
      <span>Página {{ page }} de {{ totalPages }}</span>
      
      <button 
        @click="cambiarPagina(page + 1)" 
        :disabled="page >= totalPages"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  obtenerPedidos, 
  cambiarEstado, 
  cancelarPedido, 
  eliminarPedido 
} from '@/services/pedido/pedido.service'
import type { Pedido, FilterPedidoDto } from '@/models/pedido.model'

const pedidos = ref<Pedido[]>([])
const page = ref(1)
const totalPages = ref(1)
const filters = ref<FilterPedidoDto>({
  estado: '',
  fechaDesde: '',
  fechaHasta: '',
  page: 1,
  limit: 10
})

const cargarPedidos = async () => {
  try {
    console.log('Cargando pedidos...')
    const response = await obtenerPedidos()
    console.log('Respuesta completa:', response)
    pedidos.value = response.data || []
    totalPages.value = response.totalPages || 1
  } catch (error: any) {
    console.error('Error al cargar pedidos:', error)
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    pedidos.value = []
  }
}

const limpiarFiltros = () => {
  filters.value = {
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    limit: 10
  }
  page.value = 1
  cargarPedidos()
}

const cambiarPagina = (nuevaPagina: number) => {
  page.value = nuevaPagina
  cargarPedidos()
}

const cambiarEstadoPedido = async (id: number, nuevoEstado: string) => {
  try {
    await cambiarEstado(id, nuevoEstado as any)
    cargarPedidos()
  } catch (error) {
    console.error('Error al cambiar estado:', error)
  }
}

const cancelarPedidoAction = async (id: number) => {
  try {
    await cancelarPedido(id)
    cargarPedidos()
  } catch (error) {
    console.error('Error al cancelar pedido:', error)
  }
}

const eliminarPedidoAction = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar este pedido?')) {
    try {
      await eliminarPedido(id)
      cargarPedidos()
    } catch (error) {
      console.error('Error al eliminar pedido:', error)
    }
  }
}

const canChangeStatus = (estado: string) => {
  return ['pendiente', 'confirmado', 'preparando', 'listo'].includes(estado)
}

const formatDate = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

onMounted(() => {
  cargarPedidos()
})
</script>

<style scoped>
.pedidos-container {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters select,
.filters input,
.filters button {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.pedidos-list {
  display: grid;
  gap: 20px;
}

.pedido-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.pedido-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.estado {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.estado.pendiente { background: #fff3cd; color: #856404; }
.estado.confirmado { background: #d4edda; color: #155724; }
.estado.preparando { background: #cce5ff; color: #004085; }
.estado.listo { background: #e2e3e5; color: #383d41; }
.estado.entregado { background: #d1ecf1; color: #0c5460; }
.estado.cancelado { background: #f8d7da; color: #721c24; }

.pedido-info {
  margin-bottom: 15px;
}

.pedido-detalles ul {
  list-style: none;
  padding: 0;
}

.pedido-detalles li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.pedido-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-cancel {
  background: #ffc107;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>