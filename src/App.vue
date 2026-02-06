<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import CartDrawer from '@/components/CartDrawer.vue'

const route = useRoute()
const showNav = computed(() => route.name !== 'login')
</script>

<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <RouterView />
    <CartDrawer />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background: #f8f9fa;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #2d3436;
}

* {
  box-sizing: border-box;
}
</style>
