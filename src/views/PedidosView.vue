<template>
  <div class="pedidos-container">
    <div class="page-header">
      <h1>Gestión de Pedidos</h1>
      <p class="subtitle">Administra y da seguimiento a los pedidos</p>
    </div>
    
    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group">
        <select v-model="filters.estado" class="filter-select">
          <option value="">Todos los estados</option>
          <option :value="EstadoPedido.PENDIENTE">Pendiente</option>
          <option :value="EstadoPedido.CONFIRMADO">Confirmado</option>
          <option :value="EstadoPedido.EN_PROCESO">En Proceso</option>
          <option :value="EstadoPedido.ENVIADO">Enviado</option>
          <option :value="EstadoPedido.ENTREGADO">Entregado</option>
          <option :value="EstadoPedido.CANCELADO">Cancelado</option>
        </select>
        
        <div class="date-group">
          <input 
            type="date" 
            v-model="filters.fechaDesde" 
            class="filter-input"
            placeholder="Desde"
          >
          <span class="separator">-</span>
          <input 
            type="date" 
            v-model="filters.fechaHasta" 
            class="filter-input"
            placeholder="Hasta"
          >
        </div>
      </div>
      
      <div class="filter-actions">
        <button @click="cargarPedidos" class="btn-filter">
          Filtrar
        </button>
        <button @click="limpiarFiltros" class="btn-clear">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando pedidos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="pedidos.length === 0" class="empty-state">
      <Package :size="64" class="empty-icon" />
      <h3>No se encontraron pedidos</h3>
      <p>Intenta ajustar los filtros de búsqueda</p>
    </div>

    <!-- Lista de pedidos -->
    <div v-else class="pedidos-grid">
      <div 
        v-for="pedido in pedidos" 
        :key="pedido.idPedido" 
        class="pedido-card"
        :class="{ 'is-expanded': expandedOrders.has(pedido.idPedido) }"
      >
        <div class="card-header">
          <div class="header-top">
            <span class="order-id">#{{ pedido.idPedido }}</span>
            <span :class="`estado-badge ${pedido.estado.toLowerCase()}`">{{ pedido.estado }}</span>
          </div>
          <div class="header-main">
            <h3 class="client-name">{{ pedido.nombreCliente }}</h3>
            <span class="order-total">${{ pedido.total }}</span>
          </div>
          <div class="header-meta">
            <span><Calendar :size="16" /> {{ formatDate(pedido.fecha) }}</span>
            <span><CreditCard :size="16" /> {{ pedido.metodoPago }}</span>
          </div>
        </div>
        
        <div class="card-body">
          <div class="location-info">
            <MapPin :size="18" class="icon" />
            <p>{{ pedido.direccion }}</p>
          </div>
          
          <div v-if="pedido.observaciones" class="notes-info">
             <FileText :size="18" class="icon" />
             <p>{{ pedido.observaciones }}</p>
          </div>

          <!-- Detalles Expansibles -->
          <div v-if="expandedOrders.has(pedido.idPedido)" class="order-details-wrapper">
            <div class="divider"></div>
            <h4>Productos</h4>
            <div class="products-list">
              <div v-for="detalle in pedido.detalles" :key="detalle.idDetalle" class="product-item">
                <div class="prod-info">
                  <span class="prod-qty">{{ detalle.cantidad }}x</span>
                  <span class="prod-name">{{ detalle.nombreProducto }}</span>
                </div>
                <span class="prod-price">${{ detalle.subtotal }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
           <button 
            @click="toggleDetails(pedido.idPedido)" 
            class="btn-text"
          >
            {{ expandedOrders.has(pedido.idPedido) ? 'Ocultar detalles' : 'Ver detalles' }}
          </button>

          <div class="action-buttons">
            <div class="status-actions">
              <button 
                v-if="canChangeStatus(pedido.estado)"
                v-for="estado in getAvailableStates(pedido.estado)"
                :key="estado"
                @click="cambiarEstadoPedido(pedido.idPedido, estado)"
                class="btn-action"
                :class="estado"
              >
                {{ getActionLabel(estado) }}
              </button>
              
              <button 
                v-if="canCancel(pedido.estado)" 
                @click="cancelarPedidoAction(pedido.idPedido)"
                class="btn-action cancel"
              >
                Cancelar
              </button>
            </div>
            
            <button 
              v-if="pedido.estado === EstadoPedido.CANCELADO" 
              @click="eliminarPedidoAction(pedido.idPedido)"
              class="btn-icon delete"
              title="Eliminar Pedido"
            >
               <Trash2 :size="18" />
               <span class="btn-tooltip">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        @click="cambiarPagina(page - 1)" 
        :disabled="page <= 1"
        class="btn-page"
      >
        ← Anterior
      </button>
      
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      
      <button 
        @click="cambiarPagina(page + 1)" 
        :disabled="page >= totalPages"
        class="btn-page"
      >
        Siguiente →
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
  eliminarPedido,
  aprobarPedido
} from '@/services/pedido/pedido.service'
import { type Pedido, type FilterPedidoDto, EstadoPedido } from '@/models/pedido.model'
import { 
  Package, MapPin, FileText, Ban, Trash2, CreditCard, Calendar, ChevronDown, ChevronUp 
} from 'lucide-vue-next'

const pedidos = ref<Pedido[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const expandedOrders = ref(new Set<number>())

// Extendemos FilterPedidoDto para permitir string vacío en la UI
interface FilterUI extends Omit<FilterPedidoDto, 'estado'> {
  estado: EstadoPedido | ''
}

const filters = ref<FilterUI>({
  estado: '',
  fechaDesde: '',
  fechaHasta: '',
  page: 1,
  limit: 10
})

const cargarPedidos = async () => {
  loading.value = true
  try {
    // Convertimos filters.estado a undefined si es string vacío para la llamada
    const apiFilters: FilterPedidoDto = {
      ...filters.value,
      estado: filters.value.estado === '' ? undefined : filters.value.estado
    }
    
    // Fix: Add one day to fechaHasta to include the entire end date
    // Backend interprets "2026-02-09" as "2026-02-09T00:00:00", excluding the whole day
    if (apiFilters.fechaHasta) {
      const endDate = new Date(apiFilters.fechaHasta)
      endDate.setDate(endDate.getDate() + 1)
      apiFilters.fechaHasta = endDate.toISOString().split('T')[0]
    }
    
    const response = await obtenerPedidos(apiFilters)
    pedidos.value = response.data || []
    totalPages.value = response.totalPages || 1
  } catch (error: any) {
    console.error('Error al cargar pedidos:', error)
    pedidos.value = []
  } finally {
    loading.value = false
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

const toggleDetails = (id: number) => {
  if (expandedOrders.value.has(id)) {
    expandedOrders.value.delete(id)
  } else {
    expandedOrders.value.add(id)
  }
}

const getAvailableStates = (currentState: string): EstadoPedido[] => {
  const normalized = currentState?.toLowerCase() as EstadoPedido
  const transitions: Record<string, EstadoPedido[]> = {
    [EstadoPedido.PENDIENTE]: [EstadoPedido.CONFIRMADO],
    [EstadoPedido.CONFIRMADO]: [EstadoPedido.EN_PROCESO],
    [EstadoPedido.EN_PROCESO]: [EstadoPedido.ENVIADO],
    [EstadoPedido.ENVIADO]: [EstadoPedido.ENTREGADO],
    [EstadoPedido.ENTREGADO]: [],
    [EstadoPedido.CANCELADO]: [],
  }
  return transitions[normalized] || []
}

const cambiarEstadoPedido = async (id: number, nuevoEstado: string) => {
  if (!nuevoEstado) return
  try {
    if (nuevoEstado === EstadoPedido.CONFIRMADO) {
      await aprobarPedido(id)
    } else {
      await cambiarEstado(id, nuevoEstado as EstadoPedido)
    }
    cargarPedidos() // Recargar para ver cambios
  } catch (error: any) {
    console.error('Error al cambiar estado:', error)
    alert(error?.response?.data?.message || 'Error al cambiar el estado del pedido')
  }
}

const cancelarPedidoAction = async (id: number) => {
  if (!confirm('¿Seguro quieres cancelar este pedido?')) return
  try {
    await cancelarPedido(id)
    cargarPedidos()
  } catch (error: any) {
    console.error('Error al cancelar pedido:', error)
    alert(error?.response?.data?.message || 'No se pudo cancelar el pedido')
  }
}

const eliminarPedidoAction = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar permanentemente este pedido?')) {
    try {
      await eliminarPedido(id)
      cargarPedidos()
    } catch (error: any) {
      console.error('Error al eliminar pedido:', error)
      alert(error?.response?.data?.message || 'Error al eliminar el pedido')
    }
  }
}

const canChangeStatus = (estado: string) => {
  const normalized = estado?.toLowerCase() as EstadoPedido
  return [
    EstadoPedido.PENDIENTE, 
    EstadoPedido.CONFIRMADO, 
    EstadoPedido.EN_PROCESO,
    EstadoPedido.ENVIADO
  ].includes(normalized)
}

const canCancel = (estado: string) => {
  const normalized = estado?.toLowerCase() as EstadoPedido
  // Según backend, solo se pueden cancelar pedidos PENDIENTE o CONFIRMADO
  return [EstadoPedido.PENDIENTE, EstadoPedido.CONFIRMADO].includes(normalized)
}

const formatDate = (fecha: string | Date) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric'
  })
}

const getActionLabel = (estado: EstadoPedido) => {
  switch (estado) {
    case EstadoPedido.CONFIRMADO: return 'Aprobar'
    case EstadoPedido.EN_PROCESO: return 'Comenzar Preparación'
    case EstadoPedido.ENVIADO: return 'Marcar como Enviado'
    case EstadoPedido.ENTREGADO: return 'Marcar como Entregado'
    default: return estado.replace('_', ' ')
  }
}

onMounted(() => {
  cargarPedidos()
})
</script>

<style scoped>
.pedidos-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #2d3436;
  margin: 0;
}

.subtitle {
  color: #636e72;
  margin-top: 0.5rem;
}

/* Filters */
.filters-bar {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.date-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select, .filter-input {
  padding: 0.6rem 1rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:focus, .filter-input:focus {
  border-color: #0984e3;
}

.filter-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-filter {
  background: #0984e3;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-filter:hover {
  background: #00cec9;
}

.btn-clear {
  background: transparent;
  color: #636e72;
  border: 1px solid #dfe6e9;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #f1f3f5;
  color: #2d3436;
}

/* Grid */
.pedidos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card */
.pedido-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.pedido-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
}

.card-header {
  padding: 1.5rem;
  background: #fff;
  border-bottom: 1px solid #f1f3f5;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.order-id {
  font-size: 0.9rem;
  color: #b2bec3;
  font-weight: 600;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Updated Colors for new states */
.estado-badge.pendiente { background: #fff3cd; color: #856404; }
.estado-badge.confirmado { background: #d4edda; color: #155724; }
.estado-badge.en_proceso { background: #e2e6ea; color: #4b4b4b; border: 1px solid #ced4da; } 
.estado-badge.enviado { background: #cce5ff; color: #004085; }
.estado-badge.entregado { background: #d1e7dd; color: #0f5132; }
.estado-badge.cancelado { background: #ffeaa7; color: #d63031; }

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.client-name {
  margin: 0;
  font-size: 1.2rem;
  color: #2d3436;
}

.order-total {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0984e3;
}

.header-meta {
  display: flex;
  gap: 1rem;
  color: #636e72;
  font-size: 0.9rem;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  }

.location-info, .notes-info {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
  color: #2d3436;
  font-size: 0.95rem;
}

.icon {
  font-size: 1.1rem;
}

.notes-info p {
  font-style: italic;
  color: #636e72;
}

.divider {
  height: 1px;
  background: #f1f3f5;
  margin: 1rem 0;
}

.order-details-wrapper h4 {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #b2bec3;
}

.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.prod-qty {
  font-weight: bold;
  color: #0984e3;
  margin-right: 0.5rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text {
  background: none;
  border: none;
  color: #6c5ce7;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.btn-text:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.status-select {
  padding: 0.4rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 0.85rem;
  outline: none;
}

.status-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
  text-transform: capitalize;
}

.btn-action.confirmado { background: #00b894; }
.btn-action.confirmado:hover { background: #00a884; }

.btn-action.en_proceso { background: #0984e3; }
.btn-action.en_proceso:hover { background: #0077d3; }

.btn-action.enviado { background: #6c5ce7; }
.btn-action.enviado:hover { background: #5a4bd1; }

.btn-action.entregado { background: #2d3436; }
.btn-action.entregado:hover { background: #1b1e1f; }

.btn-action.cancel { 
  background: white; 
  color: #d63031;
  border: 1px solid #d63031;
}
.btn-action.cancel:hover { 
  background: #fff5f5;
}

.btn-icon {
  background: white;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-icon:hover {
  border-color: #b2bec3;
  transform: translateY(-1px);
}

.btn-icon.delete:hover {
  border-color: #e74c3c;
  background: #ffeaa7;
}

.btn-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #2d3436;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  white-space: nowrap;
  margin-bottom: 5px;
}

.btn-icon:hover .btn-tooltip {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #b2bec3;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #636e72;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0984e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
}

.btn-page {
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

/* Mobile Responsive */
@media (max-width: 768px) {
  .pedidos-container {
    padding: 1rem;
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-group {
    width: 100%;
  }
  
  .filter-input {
    flex: 1;
  }
  
  .filter-actions {
    justify-content: flex-end;
  }
}
</style>