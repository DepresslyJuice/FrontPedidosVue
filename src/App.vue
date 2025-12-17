<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from '@/components/NavBar.vue'

const route = useRoute()
const showNav = computed(() => route.name !== 'login')
</script>

<template>
  <div id="app">
    <NavBar v-if="showNav" />
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  background: #f8f9fa;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

* {
  box-sizing: border-box;
}
</style>
