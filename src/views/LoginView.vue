<script setup lang="ts">
import { useRouter } from 'vue-router'
import AuthScreen from '../screens/AuthScreen.vue'

const router = useRouter()

const onLogin = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7]">
    <AuthScreen @login="onLogin" />
  </div>
</template>
