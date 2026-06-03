<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ClipboardCheck,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const menuItems = [
  { path: '/admin', label: '运营总览', desc: '平台健康与趋势', icon: LayoutDashboard },
  { path: '/admin/review', label: '摊位审核', desc: '申请、复审、分配', icon: ClipboardCheck },
  { path: '/admin/merchants', label: '商户管理', desc: '状态与经营画像', icon: Users },
  { path: '/admin/messages', label: '消息公告', desc: '定向触达商户', icon: Megaphone },
  { path: '/admin/banner', label: '首页 Banner', desc: '活动曝光位', icon: Image },
]

const currentPath = computed(() => route.path)
const currentMenu = computed(() => menuItems.find((item) => item.path === currentPath.value) || menuItems[0])
const displayName = computed(() => auth.session?.merchantName || '运营管理员')
const roleLabel = computed(() => auth.session?.role === 'super_admin' ? '超级管理员' : '区域管理员')

const navigate = (path: string) => {
  router.push(path)
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-frame flex min-h-screen flex-col lg:flex-row">
    <aside class="admin-sidebar sticky top-0 z-30 flex shrink-0 flex-col border-b px-4 py-4 lg:h-screen lg:w-[272px] lg:border-b-0 lg:px-5 lg:py-6">
      <div class="flex items-center justify-between gap-3 lg:block">
        <button class="flex items-center gap-3 text-left" @click="router.push('/admin')">
          <div class="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#24201A] text-[#FFF8E8] shadow-lg shadow-stone-900/10">
            <Store class="h-6 w-6" />
          </div>
          <div>
            <p class="text-base font-black leading-tight text-stone-950">摊位管家</p>
            <p class="text-xs font-bold text-stone-400">运营工作台</p>
          </div>
        </button>

        <button class="ds-button ds-button-soft h-10 px-3 lg:hidden" @click="handleLogout">
          <LogOut class="h-4 w-4" />
        </button>
      </div>

      <div class="mt-5 hidden rounded-[24px] border border-amber-100 bg-amber-50/60 p-4 lg:block">
        <div class="flex items-center gap-2 text-xs font-black text-amber-700">
          <ShieldCheck class="h-4 w-4" />
          {{ roleLabel }}
        </div>
        <p class="mt-2 text-sm font-black text-stone-900">{{ displayName }}</p>
        <p class="mt-1 text-xs leading-relaxed text-stone-500">关注审核效率、商户活跃和首页曝光位表现。</p>
      </div>

      <nav class="mt-4 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:flex-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0">
        <button
          v-for="item in menuItems"
          :key="item.path"
          :class="['admin-nav-item shrink-0 lg:shrink', currentPath === item.path ? 'is-active' : '']"
          @click="navigate(item.path)"
        >
          <component :is="item.icon" class="h-[18px] w-[18px] shrink-0" />
          <span class="whitespace-nowrap lg:whitespace-normal">{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-5 hidden space-y-2 lg:block">
        <button class="admin-nav-item" @click="router.push('/dashboard')">
          <ChevronLeft class="h-[18px] w-[18px]" />
          返回商户端
        </button>
        <button class="admin-nav-item text-red-500 hover:bg-red-50 hover:text-red-600" @click="handleLogout">
          <LogOut class="h-[18px] w-[18px]" />
          退出登录
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 border-b border-[#EADFCC]/70 bg-[#FFFDF8]/82 px-4 py-3 backdrop-blur-xl lg:px-7 lg:py-4">
        <div class="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <BarChart3 class="h-4 w-4 text-amber-600" />
              <span class="text-xs font-black uppercase tracking-[0.14em] text-amber-700">{{ currentMenu.desc }}</span>
            </div>
            <h1 class="mt-1 truncate text-xl font-black tracking-tight text-stone-950 lg:text-2xl">{{ currentMenu.label }}</h1>
          </div>

          <div class="flex items-center gap-2">
            <button class="ds-button ds-button-soft hidden sm:flex" @click="router.push('/dashboard')">
              <ChevronLeft class="h-4 w-4" />
              商户端
            </button>
            <button class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm ring-1 ring-stone-100">
              <Bell class="h-4 w-4" />
            </button>
            <div class="hidden items-center gap-2 rounded-full bg-white py-1.5 pl-2 pr-3 shadow-sm ring-1 ring-stone-100 sm:flex">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                {{ displayName.charAt(0) }}
              </div>
              <div class="leading-tight">
                <p class="text-xs font-black text-stone-900">{{ displayName }}</p>
                <p class="text-[10px] font-bold text-stone-400">{{ roleLabel }}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="admin-content flex-1">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style>
@import '../assets/admin.css';
</style>
