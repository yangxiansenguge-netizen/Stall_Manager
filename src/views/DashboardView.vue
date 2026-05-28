<script setup lang="ts">
import { useRouter } from 'vue-router'
import DashboardScreen from '../screens/DashboardScreen.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
</script>

<template>
  <DashboardScreen
    :merchant-name="auth.merchantName"
    @navigate-to-management="router.push('/business')"
    @navigate-to-stall-management="router.push('/stall')"
    @navigate-to-plan="router.push('/business?view=manualOrder')"
    @navigate-to-add-product="router.push('/business?add=true')"
  />
</template>
