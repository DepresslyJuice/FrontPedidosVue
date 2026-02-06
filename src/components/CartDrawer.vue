<template>
  <div v-if="isCartOpen" class="cart-overlay" @click="toggleCart">
    <div class="cart-drawer" @click.stop>
      <div class="cart-header">
        <h3>Tu Carrito ({{ cartCount }})</h3>
        <button @click="toggleCart" class="btn-close">×</button>
      </div>

      <div class="cart-body">
        <div v-if="cartItems.length === 0" class="empty-cart">
          <p>Tu carrito está vacío</p>
          <button @click="toggleCart" class="btn-shop">Ir a comprar</button>
        </div>
        
        <div v-else class="cart-items">
          <div v-for="item in cartItems" :key="item.idProducto" class="cart-item">
            <div class="item-info">
              <h4>{{ item.nombre }}</h4>
              <p class="item-price">${{ item.precio }} x {{ item.cantidad }}</p>
            </div>
            <div class="item-actions">
              <div class="quantity-controls">
                <button @click="updateQuantity(item.idProducto, item.cantidad - 1)" class="btn-micro">-</button>
                <span>{{ item.cantidad }}</span>
                <button @click="updateQuantity(item.idProducto, item.cantidad + 1)" class="btn-micro">+</button>
              </div>
              <p class="item-subtotal">${{ item.subtotal }}</p>
              <button @click="removeFromCart(item.idProducto)" class="btn-remove">×</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="total-row">
          <span>Total</span>
          <span class="total-amount">${{ total }}</span>
        </div>
        <button @click="goToCheckout" class="btn-checkout">
          Finalizar Pedido
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCart } from '@/composables/useCart'
import { useRouter } from 'vue-router'

const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, total, cartCount } = useCart()
const router = useRouter()

const goToCheckout = () => {
  toggleCart()
  router.push('/crear-pedido?checkout=true')
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  width: 100%;
  max-width: 400px;
  background: white;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0,0,0,0.1);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid #dae1e7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636e72;
}

.cart-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.empty-cart {
  text-align: center;
  padding-top: 3rem;
  color: #636e72;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.item-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.item-price {
  margin: 0;
  color: #636e72;
  font-size: 0.9rem;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f1f3f5;
  padding: 2px;
  border-radius: 4px;
}

.btn-micro {
  width: 24px;
  height: 24px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-subtotal {
  margin: 0;
  font-weight: bold;
}

.btn-remove {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: underline;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid #dae1e7;
  background: #f8f9fa;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  background: #0984e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  font-weight: 600;
}

.btn-checkout:hover {
  background: #00cec9;
}

.btn-shop {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background: #0984e3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
