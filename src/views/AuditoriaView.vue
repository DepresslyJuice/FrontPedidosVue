<template>
  <div class="auditoria-container">
    <div class="page-header">
      <div>
        <h1>Auditoría del Sistema</h1>
        <p class="subtitle">Registro completo de acciones y cambios en el sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <div class="filter-group">
        <select v-model="filters.entidad" class="filter-select">
          <option value="">Todas las entidades</option>
          <option value="usuarios">Usuarios</option>
          <option value="pedidos">Pedidos</option>
          <option value="facturas">Facturas</option>
          <option value="productos">Productos</option>
        </select>

        <select v-model="filters.accion" class="filter-select">
          <option value="">Todas las acciones</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
          <option value="create">Crear</option>
          <option value="update">Actualizar</option>
          <option value="delete">Eliminar</option>
          <option value="approve">Aprobar</option>
          <option value="cancel">Cancelar</option>
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
        <button @click="cargarAuditorias" class="btn-filter">
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
      <p>Cargando registros...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="auditorias.length === 0" class="empty-state">
      <FileText :size="64" class="empty-icon" />
      <h3>No se encontraron registros</h3>
      <p>Intenta ajustar los filtros de búsqueda</p>
    </div>

    <!-- Tabla de Auditoría -->
    <div v-else class="auditoria-table-container">
      <table class="auditoria-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>ID</th>
            <th>IP</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="auditoria in auditorias" :key="auditoria.idAuditoria">
            <td class="fecha-cell">{{ formatDate(auditoria.fecha) }}</td>
            <td class="user-cell">
              <User :size="16" />
              {{ auditoria.usuarioEmail }}
            </td>
            <td>
              <span :class="`action-badge ${auditoria.accion}`">
                {{ formatAction(auditoria.accion) }}
              </span>
            </td>
            <td>{{ auditoria.entidad }}</td>
            <td class="id-cell">{{ auditoria.idEntidad }}</td>
            <td class="ip-cell">{{ auditoria.ip }}</td>
            <td class="detalles-cell">{{ auditoria.detalles || '-' }}</td>
            <td>
              <button 
                v-if="auditoria.datosAnteriores || auditoria.datosNuevos"
                @click="verDetalles(auditoria)" 
                class="btn-icon"
                title="Ver cambios"
              >
                <Eye :size="18" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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

    <!-- Modal de Detalles -->
    <Transition name="fade">
      <div v-if="selectedAuditoria" class="modal-overlay" @click="selectedAuditoria = null">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <h3>Detalles del Cambio</h3>
            <button @click="selectedAuditoria = null" class="btn-close">×</button>
          </div>
          <div class="modal-body">
            <div class="detail-section" v-if="selectedAuditoria.datosAnteriores">
              <h4>Datos Anteriores</h4>
              <pre class="json-viewer">{{ JSON.stringify(selectedAuditoria.datosAnteriores, null, 2) }}</pre>
            </div>
            <div class="detail-section" v-if="selectedAuditoria.datosNuevos">
              <h4>Datos Nuevos</h4>
              <pre class="json-viewer">{{ JSON.stringify(selectedAuditoria.datosNuevos, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { obtenerAuditorias } from '@/services/auditoria/auditoria.service'
import type { Auditoria, FilterAuditoriaDto } from '@/models/auditoria.model'
import { FileText, Filter, User, Eye } from 'lucide-vue-next'

const auditorias = ref<Auditoria[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const selectedAuditoria = ref<Auditoria | null>(null)

const filters = ref<FilterAuditoriaDto>({
  entidad: '',
  accion: '',
  fechaDesde: '',
  fechaHasta: '',
  page: 1,
  limit: 20
})

const cargarAuditorias = async () => {
  loading.value = true
  try {
    const apiFilters: FilterAuditoriaDto = {
      ...filters.value,
      entidad: filters.value.entidad === '' ? undefined : filters.value.entidad,
      accion: filters.value.accion === '' ? undefined : filters.value.accion,
      page: page.value
    }
    
    const response = await obtenerAuditorias(apiFilters)
    auditorias.value = response.data || []
    totalPages.value = response.totalPages || 1
  } catch (error) {
    console.error('Error cargando auditorías:', error)
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  filters.value = {
    entidad: '',
    accion: '',
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    limit: 20
  }
  page.value = 1
  cargarAuditorias()
}

const cambiarPagina = (nuevaPagina: number) => {
  page.value = nuevaPagina
  cargarAuditorias()
}

const verDetalles = (auditoria: Auditoria) => {
  selectedAuditoria.value = auditoria
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAction = (action: string) => {
  const actions: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    create: 'Crear',
    update: 'Actualizar',
    delete: 'Eliminar',
    approve: 'Aprobar',
    cancel: 'Cancelar',
    change_status: 'Cambiar Estado'
  }
  return actions[action] || action
}

onMounted(() => {
  cargarAuditorias()
})
</script>

<style scoped>
.auditoria-container {
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

/* Table */
.auditoria-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  overflow-x: auto;
}

.auditoria-table {
  width: 100%;
  border-collapse: collapse;
}

.auditoria-table th,
.auditoria-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f1f3f5;
}

.auditoria-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2d3436;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auditoria-table tbody tr:hover {
  background: #f8f9fa;
}

.fecha-cell {
  font-family: 'Consolas', monospace;
  font-size: 0.85rem;
  color: #636e72;
  white-space: nowrap;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2d3436;
}

.id-cell, .ip-cell {
  font-family: 'Consolas', monospace;
  font-size: 0.85rem;
  color: #636e72;
}

.detalles-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #636e72;
  font-size: 0.9rem;
}

.action-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.action-badge.login { background: #d4edda; color: #155724; }
.action-badge.logout { background: #fff3cd; color: #856404; }
.action-badge.create { background: #cfe2ff; color: #084298; }
.action-badge.update { background: #e7f3ff; color: #0c5460; }
.action-badge.delete { background: #f8d7da; color: #721c24; }
.action-badge.approve { background: #d1ecf1; color: #0c5460; }
.action-badge.cancel { background: #ffeaa7; color: #d63031; }

.btn-icon {
  background: none;
  border: none;
  color: #0984e3;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f1f3f5;
}

/* Loading & Empty */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem;
  color: #b2bec3;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top-color: #0984e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

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

/* Modal */
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
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
}

.modal-header h3 {
  margin: 0;
  color: #2d3436;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #636e72;
  line-height: 1;
}

.modal-body {
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3436;
  font-size: 1rem;
}

.json-viewer {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Consolas', monospace;
  font-size: 0.85rem;
  color: #2d3436;
  border: 1px solid #dfe6e9;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .auditoria-container { padding: 1rem; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-group { flex-direction: column; }
}
</style>
