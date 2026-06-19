<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../components/Header.vue'
import BottomNav from '../components/BottomNav.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useAuthStore } from '../stores/auth'
import { buildApiUrl } from '../utils/api'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const avatarUrl = ref('')

// 心跳检测：每 15 秒检查是否被踢
let kickPollTimer: ReturnType<typeof setInterval> | null = null
const checkAlive = async () => {
  if (!auth.isLoggedIn) return
  await auth.checkAuth()
}
onMounted(async () => {
  kickPollTimer = setInterval(checkAlive, 15000)
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/settings/overview'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data?.profile) {
      avatarUrl.value = p.data.profile.avatarUrl || ''
    }
  } catch { /* ignore */ }
})

const currentTab = computed(() => {
  const map: Record<string, string> = { dashboard: 'home', stall: 'stall', business: 'business', settings: 'settings', messages: 'messages', ai: 'business' }
  return map[route.name as string] || 'home'
})

const onTabChange = (tab: string) => {
  const map: Record<string, string> = { home: '/dashboard', stall: '/stall', business: '/business', settings: '/settings', messages: '/messages' }
  router.push(map[tab] || '/dashboard')
}

defineExpose({})

onBeforeUnmount(() => {
  if (kickPollTimer) clearInterval(kickPollTimer)
})
</script>

<template>
  <div class="min-h-screen bg-[#F8F7F5] pb-[calc(6.5rem+env(safe-area-inset-bottom))] flex flex-col items-center">
    <Header :merchant-name="auth.merchantName" :avatar-url="avatarUrl" @open-messages="router.push('/messages')" />
    <main class="w-full max-w-screen-xl mx-auto flex-1 px-3 sm:px-4 md:px-6 pt-[calc(5rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-12">
      <router-view />
    </main>
    <BottomNav :active-tab="currentTab" @tab-change="onTabChange" />
    <ToastNotification />

    <!-- 被踢出提示 -->
    <Teleport to="body">
      <div v-if="auth.kickedMsg" class="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl text-center">
          <div class="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span class="text-2xl">⚠️</span>
          </div>
          <h3 class="text-lg font-black text-stone-900 mb-2">登录已失效</h3>
          <p class="text-sm text-stone-500 leading-relaxed mb-6">{{ auth.kickedMsg }}</p>
          <button @click="auth.clearKicked(); router.push('/login')" class="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-3 text-sm font-bold transition">知道了</button>
        </div>
      </div>
    </Teleport>
  </div>
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

.page-fade-enter-active, .page-fade-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.page-fade-enter-from { opacity: 0; transform: translateY(15px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-15px); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.writing-vertical-lr { writing-mode: vertical-lr; }
</style>
