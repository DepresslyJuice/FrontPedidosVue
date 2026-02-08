<template>
  <div class="facturas-container">
    <div class="page-header">
      <div>
        <h1>Gestión de Facturación</h1>
        <p class="subtitle">Consulta y administra las facturas del sistema</p>
      </div>
      <button v-if="canCreate" @click="$router.push('/facturas/directa')" class="btn-create">
        <Plus :size="20" /> Nueva Factura
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group">
        <select v-model="filters.estado" class="filter-select">
          <option value="">Todos los estados</option>
          <option :value="EstadoFactura.EMITIDA">Emitida</option>
          <option :value="EstadoFactura.PAGADA">Pagada</option>
          <option :value="EstadoFactura.ANULADA">Anulada</option>
        </select>

        <input 
          type="text" 
          v-model="filters.numeroFactura" 
          placeholder="Buscar por N° Factura..." 
          class="filter-input search"
        >

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
        <button @click="cargarFacturas" class="btn-filter">
          <Filter :size="18" /> Filtrar
        </button>
        <button @click="limpiarFiltros" class="btn-clear">
          Limpiar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando facturas...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="facturas.length === 0" class="empty-state">
      <FileText :size="64" class="empty-icon" />
      <h3>No se encontraron facturas</h3>
      <p>Intenta ajustar los filtros de búsqueda</p>
    </div>

    <!-- Lista de Facturas -->
    <div v-else class="facturas-grid">
      <div 
        v-for="factura in facturas" 
        :key="factura.idFactura" 
        class="factura-card"
        @click="abrirDetalle(factura)"
      >
        <div class="card-header">
          <div class="header-top">
             <span class="factura-number">{{ factura.numeroFactura }}</span>
             <span :class="`estado-badge ${factura.estado.toLowerCase()}`">{{ factura.estado }}</span>
          </div>
          <div class="header-main">
            <h3 class="client-name">{{ factura.nombreCliente }}</h3>
            <span class="factura-total">{{ formatCurrency(factura.total) }}</span>
          </div>
          <div class="header-meta">
            <span><Calendar :size="14" /> {{ formatDate(factura.fechaEmision) }}</span>
            <span v-if="factura.idPedido"><ShoppingBag :size="14" /> Pedido #{{ factura.idPedido }}</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="items-count">{{ factura.detalles?.length || 0 }} ítems</span>
          <button class="btn-text">Ver detalle →</button>
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

    <!-- Modal Detalle -->
    <Transition name="fade">
      <FacturaDetalle 
        v-if="selectedFactura" 
        :factura="selectedFactura" 
        :is-admin="isAdmin"
        @close="selectedFactura = null"
        @change-status="handleChangeStatus"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  obtenerFacturas, 
  actualizarEstadoFactura 
} from '@/services/facturacion/facturacion.service'
import { type Factura, type FilterFacturaDto, EstadoFactura } from '@/models/factura.model'
import FacturaDetalle from '@/components/FacturaDetalle.vue'
import { 
  FileText, Calendar, Filter, ShoppingBag, Plus 
} from 'lucide-vue-next'

// State
const facturas = ref<Factura[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const selectedFactura = ref<Factura | null>(null)
const user = ref<any>(null)

// Filters
interface FilterUI extends Omit<FilterFacturaDto, 'estado'> {
  estado: EstadoFactura | ''
}

const filters = ref<FilterUI>({
  estado: '',
  numeroFactura: '',
  fechaDesde: '',
  fechaHasta: '',
  page: 1,
  limit: 12
})

// Hooks
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) { console.error(e) }
  }
  cargarFacturas()
})

const hasRole = (role: string) => {
  if (!user.value?.roles) return false
  return user.value.roles.some((r: string) => r.toUpperCase() === role.toUpperCase())
}

const isAdmin = computed(() => {
  return hasRole('admin') || hasRole('vendedor') || hasRole('supervisor')
})

const canCreate = computed(() => {
  return hasRole('vendedor') || hasRole('supervisor') || hasRole('admin')
})

// Methods
const cargarFacturas = async () => {
  loading.value = true
  try {
    const apiFilters: FilterFacturaDto = {
      ...filters.value,
      estado: filters.value.estado === '' ? undefined : filters.value.estado,
      page: page.value
    }
    const response = await obtenerFacturas(apiFilters)
    facturas.value = response.data || []
    totalPages.value = response.totalPages || 1
  } catch (error) {
    console.error('Error cargando facturas:', error)
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filters.value = {
    estado: '',
    numeroFactura: '',
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    limit: 12
  }
  page.value = 1
  cargarFacturas()
}

const cambiarPagina = (nuevaPagina: number) => {
  page.value = nuevaPagina
  cargarFacturas()
}

const abrirDetalle = (factura: Factura) => {
  selectedFactura.value = factura
}

const handleChangeStatus = async (id: number, nuevoEstado: EstadoFactura) => {
  if (!confirm(`¿Estás seguro de cambiar el estado a ${nuevoEstado}?`)) return
  
  try {
    const actualizada = await actualizarEstadoFactura(id, { estado: nuevoEstado })
    
    // In update list
    const index = facturas.value.findIndex(f => f.idFactura === id)
    if (index !== -1) {
      facturas.value[index] = actualizada
    }
    
    // Update selected if open
    if (selectedFactura.value?.idFactura === id) {
      selectedFactura.value = actualizada
    }
    
    // If it was cancelled/paid, maybe close modal or just show success
    alert('Estado actualizado correctamente')
  } catch (error: any) {
    console.error('Error actualizando estado:', error)
    alert(error?.response?.data?.message || 'Error al actualizar el estado')
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(val)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}
</script>

<style scoped>
.facturas-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header { 
  margin-bottom: 2rem; 
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-header h1 { font-size: 2rem; color: #2d3436; margin: 0; }

.btn-create {
  background: #0984e3;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(9, 132, 227, 0.2);
}
.btn-create:hover {
  background: #00cec9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(9, 132, 227, 0.3);
}
.subtitle { color: #636e72; margin-top: 0.5rem; }

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

.filter-input.search {
  min-width: 200px;
}

.filter-select:focus, .filter-input:focus {
  border-color: #0984e3;
}

.filter-actions {
  display: flex;
  gap: 0.8rem;
}

.btn-filter, .btn-clear {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-filter {
  background: #0984e3;
  color: white;
}
.btn-filter:hover { background: #00cec9; }

.btn-clear {
  background: transparent;
  color: #636e72;
  border: 1px solid #dfe6e9;
}
.btn-clear:hover { background: #f1f3f5; color: #2d3436; }

/* Grid */
.facturas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.factura-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  padding: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #f1f3f5;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.factura-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  border-color: #0984e3;
}

.card-header {
  margin-bottom: 1rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.factura-number {
  font-family: 'Consolas', monospace;
  color: #636e72;
  font-weight: 600;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.estado-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.estado-badge.emitida { background: #e2e6ea; color: #4b4b4b; }
.estado-badge.pagada { background: #d4edda; color: #155724; }
.estado-badge.anulada { background: #ffeaa7; color: #d63031; }

.header-main {
  margin-bottom: 0.8rem;
}

.client-name {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  color: #2d3436;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.factura-total {
  font-size: 1.4rem;
  font-weight: 800;
  color: #2d3436;
}

.header-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #b2bec3;
}
.header-meta span { display: flex; align-items: center; gap: 4px; }

.card-footer {
  border-top: 1px solid #f1f3f5;
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.items-count { color: #636e72; }

.btn-text {
  background: none;
  border: none;
  color: #0984e3;
  font-weight: 600;
  cursor: pointer;
}
.btn-text:hover { text-decoration: underline; }

/* Loading & Empty */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem;
  color: #b2bec3;
}

.spinner {
  width: 40px; height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #0984e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon {
  margin-bottom: 1rem;
  color: #dfe6e9;
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
  cursor: pointer;
  transition: all 0.2s;
}
.btn-page:hover:not(:disabled) {
  background: #f1f3f5;
}
.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .facturas-container { padding: 1rem; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-input.search { min-width: 100%; }
}
</style>
