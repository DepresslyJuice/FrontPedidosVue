<template>
  <div class="productos-container">
    <div class="header">
      <h1>Productos</h1>
      <button @click="openModal()" class="btn-primary">Nuevo Producto</button>
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
            <th>Estado</th>
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
              <span :class="producto.activo ? 'status-active' : 'status-inactive'">
                {{ producto.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions">
              <button @click="openModal(producto)" class="btn-edit">Editar</button>
              <button @click="handleToggleActivo(producto.idProducto)" class="btn-toggle">
                {{ producto.activo ? 'Desactivar' : 'Activar' }}
              </button>
              <button @click="handleDelete(producto.idProducto)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination">
        <button 
          @click="changePage(pagination.currentPage - 1)" 
          :disabled="pagination.currentPage <= 1"
          class="btn-secondary"
        >
          Anterior
        </button>
        <span>Página {{ pagination.currentPage }} de {{ pagination.totalPages }}</span>
        <button 
          @click="changePage(pagination.currentPage + 1)" 
          :disabled="pagination.currentPage >= pagination.totalPages"
          class="btn-secondary"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
          <button @click="closeModal" class="btn-close">×</button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-body">
          <div class="form-group">
            <label>Nombre:</label>
            <input v-model="form.nombre" type="text" required />
          </div>
          <div class="form-group">
            <label>Descripción:</label>
            <textarea v-model="form.descripcion" required></textarea>
          </div>
          <div class="form-group">
            <label>Precio:</label>
            <input v-model="form.precio" type="number" step="0.01" required />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  getProductos, 
  createProducto, 
  updateProducto, 
  deleteProducto, 
  toggleProductoActivo 
} from '@/services/producto/producto.service'
import type { Producto, CreateProductoDto, UpdateProductoDto, FilterProductoDto } from '@/models/producto.model'

const productos = ref<Producto[]>([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editingProduct = ref<Producto | null>(null)
const filters = ref<FilterProductoDto>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC'
})
const pagination = ref({
  total: 0,
  totalPages: 0,
  currentPage: 1
})

const form = ref<CreateProductoDto>({
  nombre: '',
  descripcion: '',
  precio: ''
})

const loadProductos = async () => {
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
    error.value = 'Error al cargar productos'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openModal = (product?: Producto) => {
  if (product) {
    editingProduct.value = product
    form.value = {
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio
    }
  } else {
    editingProduct.value = null
    form.value = {
      nombre: '',
      descripcion: '',
      precio: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      await updateProducto(editingProduct.value.idProducto, form.value)
    } else {
      await createProducto(form.value)
    }
    closeModal()
    loadProductos()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al guardar producto'
  }
}

const handleDelete = async (id: number) => {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    try {
      await deleteProducto(id)
      loadProductos()
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error al eliminar producto'
    }
  }
}

const handleToggleActivo = async (id: number) => {
  try {
    await toggleProductoActivo(id)
    loadProductos()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al cambiar estado'
  }
}

const search = ref('')
const handleSearch = () => {
  filters.value.search = search.value
  filters.value.page = 1
  loadProductos()
}

const changePage = (page: number) => {
  filters.value.page = page
  loadProductos()
}

onMounted(() => {
  loadProductos()
})
</script>

<style scoped>
.productos-container {
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

.btn-primary, .btn-secondary, .btn-edit, .btn-delete, .btn-toggle {
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-edit {
  background: #28a745;
  color: white;
  margin-right: 5px;
}

.btn-toggle {
  background: #ffc107;
  color: black;
  margin-right: 5px;
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

.status-active {
  color: #28a745;
  font-weight: bold;
}

.status-inactive {
  color: #dc3545;
  font-weight: bold;
}

.actions {
  white-space: nowrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
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
  max-width: 500px;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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
</style>