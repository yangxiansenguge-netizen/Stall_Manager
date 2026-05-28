<script setup lang="ts">
import { useRouter } from 'vue-router'
import SettingsScreen from '../screens/SettingsScreen.vue'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
</script>

<template>
  <SettingsScreen :on-logout="() => { auth.logout(); router.push('/login'); }" />
</template>
