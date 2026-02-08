<template>
  <div class="factura-detalle-overlay" @click.self="$emit('close')">
    <div class="factura-modal">
      <div class="modal-header">
        <div class="header-content">
          <h2>Factura {{ factura.numeroFactura }}</h2>
          <span :class="`estado-badge ${factura.estado.toLowerCase()}`">{{ factura.estado }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-body">
        <div class="info-section">
          <div class="info-card">
            <h3>Cliente</h3>
            <p><strong>Nombre:</strong> {{ factura.nombreCliente }}</p>
            <p><strong>Cédula:</strong> {{ factura.cedula }}</p>
            <p><strong>Email:</strong> {{ factura.email }}</p>
            <p><strong>Teléfono:</strong> {{ factura.telefono }}</p>
            <p><strong>Dirección:</strong> {{ factura.direccion }}</p>
          </div>
          <div class="info-card">
             <h3>Detalles Factura</h3>
             <p><strong>Fecha Emisión:</strong> {{ formatDate(factura.fechaEmision) }}</p>
             <p><strong>Forma de Pago:</strong> {{ factura.formaPago }}</p>
             <p v-if="factura.idPedido"><strong>Pedido Asociación:</strong> #{{ factura.idPedido }}</p>
             <p v-if="factura.observaciones" class="obs"><strong>Observaciones:</strong> {{ factura.observaciones }}</p>
          </div>
        </div>

        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Desc.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="detalle in factura.detalles" :key="detalle.idDetalle">
                <td>{{ detalle.nombreProducto }}</td>
                <td class="text-right">{{ formatCurrency(detalle.precioUnitario) }}</td>
                <td class="text-center">{{ detalle.cantidad }}</td>
                <td class="text-right">{{ formatCurrency(detalle.descuento) }}</td>
                <td class="text-right font-bold">{{ formatCurrency(detalle.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="text-right">Subtotal</td>
                <td class="text-right">{{ formatCurrency(factura.subtotal) }}</td>
              </tr>
              <tr>
                <td colspan="4" class="text-right">IVA ({{ factura.porcentajeIva }}%)</td>
                <td class="text-right">{{ formatCurrency(factura.iva) }}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" class="text-right">Total</td>
                <td class="text-right">{{ formatCurrency(factura.total) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="modal-footer" v-if="canAction">
         <button 
          v-if="factura.estado === EstadoFactura.EMITIDA"
          class="btn-action pay"
          @click="$emit('change-status', factura.idFactura, EstadoFactura.PAGADA)"
         >
           <CheckCircle :size="18" /> Marcar como Pagada
         </button>
         
         <button 
          v-if="factura.estado !== EstadoFactura.ANULADA"
          class="btn-action cancel"
          @click="$emit('change-status', factura.idFactura, EstadoFactura.ANULADA)"
         >
           <Ban :size="18" /> Anular Factura
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type Factura, EstadoFactura } from '@/models/factura.model'
import { X, CheckCircle, Ban } from 'lucide-vue-next'

const props = defineProps<{
  factura: Factura
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change-status', id: number, estado: EstadoFactura): void
}>()

const canAction = computed(() => {
  return props.isAdmin && props.factura.estado !== EstadoFactura.ANULADA
})

const formatDate = (date: string | Date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-ES')
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD' }).format(val)
}
</script>

<style scoped>
.factura-detalle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.factura-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f1f3f5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content h2 {
  margin: 0 0 0.5rem 0;
  color: #2d3436;
}

.estado-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.estado-badge.emitida { background: #e2e6ea; color: #4b4b4b; }
.estado-badge.pagada { background: #d4edda; color: #155724; }
.estado-badge.anulada { background: #ffeaa7; color: #d63031; }

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #b2bec3;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f3f5;
  color: #2d3436;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
}

.info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-card h3 {
  font-size: 1rem;
  color: #0984e3;
  margin-bottom: 0.8rem;
  border-bottom: 2px solid #f1f3f5;
  padding-bottom: 0.5rem;
}

.info-card p {
  margin: 0.4rem 0;
  font-size: 0.95rem;
  color: #2d3436;
}

.items-table-container {
  border: 1px solid #dfe6e9;
  border-radius: 8px;
  overflow: hidden;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.items-table th, .items-table td {
  padding: 0.8rem 1rem;
  text-align: left;
}

.items-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #636e72;
}

.items-table td {
  border-top: 1px solid #f1f3f5;
}

.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.font-bold { font-weight: bold; }

.total-row td {
  background: #f8f9fa;
  font-weight: 800;
  color: #2d3436;
  font-size: 1.1rem;
}

.modal-footer {
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #f1f3f5;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.pay {
  background: #00b894;
  color: white;
}
.btn-action.pay:hover { background: #00a884; }

.btn-action.cancel {
  background: white;
  border: 1px solid #d63031;
  color: #d63031;
}
.btn-action.cancel:hover { background: #fff5f5; }

@media (max-width: 768px) {
  .info-section { grid-template-columns: 1fr; }
}
</style>
