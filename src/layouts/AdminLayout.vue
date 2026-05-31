<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  LayoutDashboard, ClipboardCheck, Users, Megaphone, Image, LogOut
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuItems = [
  { path: '/admin', label: '数据看板', icon: LayoutDashboard },
  { path: '/admin/review', label: '摊位审核', icon: ClipboardCheck },
  { path: '/admin/merchants', label: '商户管理', icon: Users },
  { path: '/admin/messages', label: '消息公告', icon: Megaphone },
  { path: '/admin/banner', label: 'Banner', icon: Image },
]

const currentPath = computed(() => route.path)

const navigate = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-stone-50 flex">
    <!-- Sidebar -->
    <aside class="w-[220px] bg-white border-r border-stone-200 flex flex-col shrink-0">
      <div class="h-16 flex items-center px-5 border-b border-stone-100">
        <span class="text-base font-black text-stone-900 tracking-tight">摊位管家 · 管理</span>
      </div>

      <nav class="flex-1 py-4 space-y-0.5 px-3">
        <button
          v-for="item in menuItems"
          :key="item.path"
          @click="navigate(item.path)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
            currentPath === item.path
              ? 'bg-amber-50 text-amber-700'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
          ]"
        >
          <component :is="item.icon" class="w-[18px] h-[18px]" />
          {{ item.label }}
        </button>
      </nav>

      <div class="p-3 border-t border-stone-100">
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-stone-400 hover:bg-red-50 hover:text-red-500 transition"
        >
          <LogOut class="w-4 h-4" />
          退出登录
        </button>
      </div>
    </aside>

    <!-- Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-16 bg-white border-b border-stone-200 flex items-center px-6 shrink-0">
        <button @click="router.push('/dashboard')" class="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-600 transition">
          &larr; 返回摊主端
        </button>
        <div class="ml-auto flex items-center gap-3">
          <span class="text-xs text-stone-400">{{ auth.session?.merchantName || '管理员' }}</span>
          <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
            {{ (auth.session?.merchantName || '管').charAt(0) }}
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
