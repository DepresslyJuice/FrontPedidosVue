<template>
  <div class="productos-container">
    <h1>Productos</h1>
    
    <div v-if="loading" class="loading">Cargando productos...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <table class="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="producto in productos" :key="producto.idProducto">
            <td>{{ producto.idProducto }}</td>
            <td>{{ producto.nombre }}</td>
            <td>{{ producto.descripcion }}</td>
            <td>${{ producto.precio }}</td>
            <td>{{ formatDate(producto.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="pagination-info">
        Página {{ page }} de {{ totalPages }} - Total: {{ total }} productos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productoService } from '@/service/producto.service'
import type { Producto } from '@/models/producto.model'

const productos = ref<Producto[]>([])
const loading = ref(true)
const error = ref('')
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const loadProductos = async () => {
  try {
    loading.value = true
    console.log('Cargando productos...')
    const response = await productoService.getProductos()
    console.log('Respuesta de la API:', response)
    productos.value = response.data
    total.value = response.total
    page.value = response.page
    totalPages.value = response.totalPages
  } catch (err) {
    error.value = `Error al cargar los productos: ${err}`
    console.error('Error completo:', err)
  } finally {
    loading.value = false
  }
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

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: #e74c3c;
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
  color: #2c3e50;
}

.productos-table tr:hover {
  background-color: #f5f5f5;
}

.pagination-info {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}
</style>