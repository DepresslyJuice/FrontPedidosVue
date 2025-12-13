<template>
  <div class="productos-container">
    <h1>Productos</h1>
    
    <div v-if="loading" class="loading">Cargando productos...</div>
    
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <div class="productos-grid">
        <div v-for="producto in productos" :key="producto.idProducto" class="producto-card">
          <h3>{{ producto.nombre }}</h3>
          <p class="descripcion">{{ producto.descripcion }}</p>
          <p class="precio">${{ producto.precio }}</p>
          <small class="fecha">Creado: {{ formatDate(producto.createdAt) }}</small>
        </div>
      </div>
      
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
    const response = await productoService.getProductos()
    productos.value = response.data
    total.value = response.total
    page.value = response.page
    totalPages.value = response.totalPages
  } catch (err) {
    error.value = 'Error al cargar los productos'
    console.error(err)
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

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.producto-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.producto-card h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.descripcion {
  color: #666;
  margin: 8px 0;
}

.precio {
  font-size: 20px;
  font-weight: bold;
  color: #27ae60;
  margin: 8px 0;
}

.fecha {
  color: #999;
  font-size: 12px;
}

.pagination-info {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}
</style>