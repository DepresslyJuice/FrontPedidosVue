<template>
  <div class="product-card">
    <div class="card-image">
      <div class="placeholder-img">
        <span>{{ producto.nombre.charAt(0).toUpperCase() }}</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="product-title">{{ producto.nombre }}</h3>
      <p class="product-desc">{{ producto.descripcion }}</p>
      <div class="product-footer">
        <span class="price">${{ producto.precio }}</span>
        <div class="actions">
          <div v-if="quantityInCart > 0" class="quantity-controls">
            <button @click="updateQty(-1)" class="btn-micro">-</button>
            <span class="qty">{{ quantityInCart }}</span>
            <button @click="updateQty(1)" class="btn-micro">+</button>
          </div>
          <button v-else @click="add" class="btn-add">
            Agregar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Producto } from '@/models/producto.model'
import { useCart } from '@/composables/useCart'

const props = defineProps<{
  producto: Producto
}>()

const { addToCart, cartItems, updateQuantity } = useCart()

const quantityInCart = computed(() => {
  const item = cartItems.value.find(i => i.idProducto === props.producto.idProducto)
  return item ? item.cantidad : 0
})

const add = () => {
  addToCart(props.producto)
}

const updateQty = (delta: number) => {
  const newQty = quantityInCart.value + delta
  updateQuantity(props.producto.idProducto, newQty)
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.card-image {
  height: 160px;
  background: #f1f3f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-img {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6c5ce7, #a29bfe);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #2d3436;
}

.product-desc {
  font-size: 0.9rem;
  color: #636e72;
  margin-bottom: auto;
  line-height: 1.4;
}

.product-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2d3436;
}

.btn-add {
  background: #0984e3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #00cec9;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f3f5;
  padding: 2px;
  border-radius: 6px;
}

.btn-micro {
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #2d3436;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.qty {
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
</style>
