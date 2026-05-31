<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthScreen from '../screens/AuthScreen.vue'

const router = useRouter()
const auth = useAuthStore()

const onLogin = () => {
  if (auth.session?.userType === 'admin') {
    router.push('/admin')
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FDFBF7]">
    <AuthScreen @login="onLogin" />
  </div>
</template>
