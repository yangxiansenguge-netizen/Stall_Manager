<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  auth.checkAuth()
})
</script>

<template>
  <router-view />
</template>

<style>
@import "tailwindcss";

:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body { margin: 0; padding: 0; min-height: 100vh; background-color: #F8F7F5; color: #1c1917; overflow-x: hidden; }
#app { width: 100%; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.writing-vertical-lr { writing-mode: vertical-lr; }
</style>
