<template>
  <div class="factura-directa-container">
    <div class="page-header">
      <div class="header-left">
        <button class="btn-back" @click="$router.push('/facturas')">
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1>Nueva Factura Directa</h1>
          <p class="subtitle">Complete la información para emitir una nueva factura</p>
        </div>
      </div>
      <button class="btn-save" @click="guardarFactura" :disabled="loading || !isValid">
        <Save :size="18" /> {{ loading ? 'Emitiendo...' : 'Emitir Factura' }}
      </button>
    </div>

    <div class="content-grid">
      <!-- Sección Cliente -->
      <div class="card cliente-section">
        <div class="card-header">
          <h2><User :size="20" /> Datos del Cliente</h2>
        </div>
        <div class="card-body">
          <!-- Buscador de Clientes -->
          <div class="search-box mb-4">
             <Search :size="18" class="search-icon" />
             <input 
               type="text" 
               v-model="userSearch" 
               placeholder="Buscar cliente (Nombre o Cédula)..." 
               class="search-input"
               @input="buscarUsuarios"
               @focus="showUserResults = true"
               @blur="window.setTimeout(() => showUserResults = false, 200)"
             >
             <!-- Resultados de búsqueda -->
             <div v-if="userSearchResults.length > 0 && showUserResults" class="search-results">
               <div 
                 v-for="user in userSearchResults" 
                 :key="user.idUsuario" 
                 class="search-item"
                 @click="seleccionarUsuario(user)"
               >
                 <span>{{ user.nombre }}</span>
                 <span class="price">{{ user.cedula }}</span>
               </div>
             </div>
          </div>

          <div class="form-grid">
          <div class="form-group">
            <label>ID Cliente *</label>
            <input 
              type="number" 
              v-model.number="form.idCliente" 
              class="form-input" 
              placeholder="ID Usuario"
            >
          </div>
          <div class="form-group">
            <label>Cédula/RUC *</label>
            <input 
              type="text" 
              v-model="form.cedula" 
              class="form-input" 
              placeholder="Identificación"
            >
          </div>
          <div class="form-group span-2">
            <label>Nombre Completo *</label>
            <input 
              type="text" 
              v-model="form.nombreCliente" 
              class="form-input" 
              placeholder="Razón Social o Nombre"
            >
          </div>
          <div class="form-group span-2">
            <label>Correo Electrónico *</label>
            <input 
              type="email" 
              v-model="form.email" 
              class="form-input" 
              placeholder="cliente@ejemplo.com"
            >
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input 
              type="text" 
              v-model="form.telefono" 
              class="form-input" 
              placeholder="099..."
            >
          </div>
          <div class="form-group">
            <label>Forma de Pago *</label>
            <select v-model="form.formaPago" class="form-select">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta de Crédito/Débito</option>
            </select>
          </div>
          <div class="form-group span-2">
            <label>Dirección</label>
            <input 
              type="text" 
              v-model="form.direccion" 
              class="form-input" 
              placeholder="Dirección completa"
            >
          </div>
          <div class="form-group span-2">
            <label>Observaciones</label>
            <textarea 
              v-model="form.observaciones" 
              class="form-input" 
              rows="2"
              placeholder="Notas adicionales..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

      <!-- Sección Productos -->
      <div class="card productos-section">
        <div class="card-header">
          <h2><Package :size="20" /> Detalles de Factura</h2>
        </div>
        
        <div class="product-selector">
           <div class="search-box">
             <Search :size="18" class="search-icon" />
             <input 
               type="text" 
               v-model="productSearch" 
               placeholder="Buscar producto..." 
               class="search-input"
               @input="buscarProductos"
             >
             <!-- Resultados de búsqueda -->
             <div v-if="searchResults.length > 0 && showResults" class="search-results">
               <div 
                 v-for="prod in searchResults" 
                 :key="prod.idProducto" 
                 class="search-item"
                 @click="seleccionarProducto(prod)"
               >
                 <span>{{ prod.nombre }}</span>
                 <span class="price">{{ formatCurrency(Number(prod.precio)) }}</span>
               </div>
             </div>
           </div>
        </div>

        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Precio</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Desc. ($)</th>
                <th class="text-right">Subtotal</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="form.detalles.length === 0">
                <td colspan="6" class="empty-cell">No hay productos agregados</td>
              </tr>
              <tr v-for="(item, index) in form.detalles" :key="index">
                <td>
                  <span class="product-name">{{ item.nombreProducto }}</span>
                </td>
                <td class="text-right">
                   <input 
                     type="number" 
                     v-model.number="item.precioUnitario" 
                     class="input-mini"
                     min="0" step="0.01"
                   >
                </td>
                <td class="text-center">
                  <input 
                     type="number" 
                     v-model.number="item.cantidad" 
                     class="input-mini qty"
                     min="1"
                   >
                </td>
                <td class="text-right">
                  <input 
                     type="number" 
                     v-model.number="item.descuento" 
                     class="input-mini"
                     min="0" step="0.01"
                   >
                </td>
                <td class="text-right font-medium">
                  {{ formatCurrency((item.cantidad * item.precioUnitario) - (item.descuento || 0)) }}
                </td>
                <td class="text-center">
                  <button class="btn-remove" @click="quitarDetalle(index)">
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="totals-section">
           <div class="total-row">
             <span>Subtotal:</span>
             <span>{{ formatCurrency(totales.subtotal) }}</span>
           </div>
           <div class="total-row">
             <span>Descuento General:</span>
             <input type="number" v-model.number="form.descuento" class="input-mini" min="0">
           </div>
           <div class="total-row">
             <span>IVA (15%):</span> <!-- Asumiendo 15%, o traer de constantes -->
             <span>{{ formatCurrency(totales.iva) }}</span>
           </div>
           <div class="total-row grand-total">
             <span>TOTAL:</span>
             <span>{{ formatCurrency(totales.total) }}</span>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft, Save, User, Package, Search, Trash2 
} from 'lucide-vue-next'
import { createFacturaDirecta } from '@/services/facturacion/facturacion.service'
import { getProductos } from '@/services/producto/producto.service'
import type { CreateFacturaDto, CreateFacturaDetalleDto } from '@/models/factura.model'
import type { Producto } from '@/models/producto.model'
import { getUsuarios } from '@/services/usuario/usuario.service'
import type { Usuario } from '@/models/usuario.model'

const router = useRouter()
const loading = ref(false)
const productSearch = ref('')
const searchResults = ref<Producto[]>([])
const showResults = ref(false)

const userSearch = ref('')
const userSearchResults = ref<Usuario[]>([])
const showUserResults = ref(false)

// Extended interface for UI mapping (needs name for display)
interface DetalleUI extends CreateFacturaDetalleDto {
  nombreProducto: string
}

const form = reactive({
  idCliente: null as number | null,
  nombreCliente: '',
  cedula: '',
  email: '',
  telefono: '',
  direccion: '',
  formaPago: 'efectivo',
  observaciones: '',
  descuento: 0,
  detalles: [] as DetalleUI[]
})

// Validation
const isValid = computed(() => {
  return form.idCliente && 
         form.nombreCliente && 
         form.cedula && 
         form.email && 
         form.detalles.length > 0
})

// Computed Totals
const totales = computed(() => {
  const subtotalItems = form.detalles.reduce((sum, item) => {
    return sum + (item.cantidad * item.precioUnitario) - (item.descuento || 0)
  }, 0)
  
  const subtotalNeto = subtotalItems - (form.descuento || 0)
  const iva = subtotalNeto * 0.15 // TODO: Import constant if available
  const total = subtotalNeto + iva

  return { subtotal: subtotalNeto, iva, total }
})



// Methods
const buscarUsuarios = async () => {
  if (userSearch.value.length < 2) {
    userSearchResults.value = []
    return
  }
  
  try {
    console.log('Buscando usuarios...')
    const response = await getUsuarios()
    console.log('Respuesta de usuarios:', response)
    console.log('Total usuarios:', response.data?.length)
    
    // Client-side filtering as simple implementation
    const term = userSearch.value.toLowerCase()
    userSearchResults.value = response.data.filter(u => 
      u.nombre.toLowerCase().includes(term) || 
      u.cedula.includes(term)
    )
    console.log('Usuarios filtrados:', userSearchResults.value.length)
    showUserResults.value = true
  } catch (error: any) {
    console.error('Error buscando usuarios', error)
    console.error('Error details:', error?.response?.data)
  }
}

const seleccionarUsuario = (user: Usuario) => {
  form.idCliente = user.idUsuario
  form.nombreCliente = user.nombre
  form.cedula = user.cedula
  form.email = user.email
  // form.telefono and direccion are not in Usuario model yet, leave as is or empty
  
  userSearch.value = user.nombre
  showUserResults.value = false
}

const buscarProductos = async () => {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    showResults.value = false
    return
  }
  
  try {
    const response = await getProductos({ search: productSearch.value })
    searchResults.value = response.data || []
    showResults.value = true
  } catch (error) {
    console.error('Error buscando productos', error)
  }
}

const seleccionarProducto = (prod: Producto) => {
  const existing = form.detalles.find(d => d.idProducto === prod.idProducto)
  
  if (existing) {
    existing.cantidad++
  } else {
    form.detalles.push({
      idProducto: prod.idProducto,
      nombreProducto: prod.nombre,
      cantidad: 1,
      precioUnitario: Number(prod.precio),
      descuento: 0
    })
  }
  
  productSearch.value = ''
  showResults.value = false
}

const quitarDetalle = (index: number) => {
  form.detalles.splice(index, 1)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(val)
}

const guardarFactura = async () => {
  if (!isValid.value) return
  if (!confirm('¿Confirma la emisión de esta factura?')) return

  loading.value = true
  try {
    const dto: CreateFacturaDto = {
      idCliente: form.idCliente!,
      nombreCliente: form.nombreCliente,
      cedula: form.cedula,
      email: form.email,
      telefono: form.telefono,
      direccion: form.direccion,
      formaPago: form.formaPago,
      observaciones: form.observaciones,
      descuento: form.descuento,
      detalles: form.detalles.map(d => ({
        idProducto: d.idProducto,
        nombreProducto: d.nombreProducto,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        descuento: d.descuento
      }))
    }

    console.log('Enviando factura:', dto)
    await createFacturaDirecta(dto)
    alert('Factura emitida correctamente')
    router.push('/facturas')
  } catch (error: any) {
    console.error('Error al emitir factura:', error)
    console.error('Error response:', error?.response?.data)
    
    // Show detailed validation errors
    const errorMsg = error?.response?.data?.message
    const validationErrors = error?.response?.data?.errors
    
    let fullErrorMsg = 'Error al emitir factura:\n\n'
    if (Array.isArray(errorMsg)) {
      fullErrorMsg += errorMsg.join('\n')
    } else if (typeof errorMsg === 'string') {
      fullErrorMsg += errorMsg
    }
    
    if (validationErrors && Array.isArray(validationErrors)) {
      fullErrorMsg += '\n\nDetalles:\n' + validationErrors.join('\n')
    }
    
    alert(fullErrorMsg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.factura-directa-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: white;
  border: 1px solid #dfe6e9;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  color: #636e72;
  transition: all 0.2s;
  display: flex;
}
.btn-back:hover { background: #f1f3f5; color: #2d3436; }

.page-header h1 { font-size: 1.8rem; margin: 0; color: #2d3436; }
.subtitle { color: #636e72; margin: 0; font-size: 0.9rem; }

.btn-save {
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
  transition: background 0.2s;
}
.btn-save:hover { background: #00cec9; }
.btn-save:disabled { background: #b2bec3; cursor: not-allowed; }

.content-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  border: 1px solid #f1f3f5;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  background: #fdfdfd;
}
.card-header h2 {
  font-size: 1.1rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2d3436;
}

.card-body { padding: 1.5rem; }

.card-body { padding: 1.5rem; }

.mb-4 { margin-bottom: 1rem; }

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group.span-2 { grid-column: span 2; }

label { font-size: 0.85rem; font-weight: 600; color: #636e72; }

.form-input, .form-select, textarea {
  padding: 0.6rem;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.form-input:focus, .form-select:focus { border-color: #0984e3; }

/* Product Selector */
.product-selector {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
}

.search-box { position: relative; }
.search-icon { position: absolute; left: 12px; top: 10px; color: #b2bec3; }
.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  margin-top: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.search-item {
  padding: 0.8rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #f1f3f5;
}
.search-item:hover { background: #f1f3f5; }
.search-item .price { color: #636e72; font-size: 0.9rem; }

/* Table */
.table-container { padding: 0 1.5rem; }
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.items-table th {
  text-align: left;
  font-size: 0.85rem;
  color: #b2bec3;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dfe6e9;
}
.items-table td {
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #f1f3f5;
  font-size: 0.95rem;
}

.input-mini {
  width: 70px;
  padding: 4px;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  text-align: right;
}
.input-mini.qty { text-align: center; }

.btn-remove {
  background: none;
  border: none;
  color: #ff7675;
  cursor: pointer;
}
.btn-remove:hover { color: #d63031; }

.text-right { text-align: right; }
.text-center { text-align: center; }
.font-medium { font-weight: 600; color: #2d3436; }
.empty-cell { text-align: center; color: #b2bec3; padding: 2rem !important; }

/* Totals */
.totals-section {
  padding: 1.5rem;
  background: #fcfcfc;
  border-top: 1px solid #f1f3f5;
  margin-top: auto;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #636e72;
}

.grand-total {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dfe6e9;
  font-size: 1.2rem;
  font-weight: 800;
  color: #2d3436;
}

@media (max-width: 1024px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>
