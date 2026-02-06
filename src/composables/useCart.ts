import { ref, computed } from 'vue'
import type { Producto } from '@/models/producto.model'

export interface CartItem extends Producto {
    cantidad: number
    subtotal: number
}

const cartItems = ref<CartItem[]>([])

const isCartOpen = ref(false)

export function useCart() {
    const addToCart = (product: Producto, quantity: number = 1) => {
        const existingItem = cartItems.value.find(item => item.idProducto === product.idProducto)

        if (existingItem) {
            existingItem.cantidad += quantity
            existingItem.subtotal = existingItem.cantidad * Number(existingItem.precio)
        } else {
            cartItems.value.push({
                ...product,
                cantidad: quantity,
                subtotal: quantity * Number(product.precio)
            })
        }
    }

    const removeFromCart = (productId: number) => {
        const index = cartItems.value.findIndex(item => item.idProducto === productId)
        if (index > -1) {
            cartItems.value.splice(index, 1)
        }
    }

    const updateQuantity = (productId: number, quantity: number) => {
        const item = cartItems.value.find(item => item.idProducto === productId)
        if (item) {
            if (quantity <= 0) {
                removeFromCart(productId)
            } else {
                item.cantidad = quantity
                item.subtotal = item.cantidad * Number(item.precio)
            }
        }
    }

    const clearCart = () => {
        cartItems.value = []
    }

    const total = computed(() => {
        return cartItems.value.reduce((acc, item) => acc + item.subtotal, 0)
    })

    const cartCount = computed(() => {
        return cartItems.value.reduce((acc, item) => acc + item.cantidad, 0)
    })

    const toggleCart = () => {
        isCartOpen.value = !isCartOpen.value
    }

    return {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        cartCount,
        isCartOpen,
        toggleCart
    }
}
