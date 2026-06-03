<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Bell,
  CheckCircle2,
  PartyPopper,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api'

const iconComponents: Record<string, any> = { ShieldCheck, CheckCircle2, PartyPopper }

const categoryDefaults: Record<string, { icon: string, bg: string, color: string }> = {
  system: { icon: 'ShieldCheck', bg: 'bg-blue-50', color: 'text-blue-500' },
  audit: { icon: 'CheckCircle2', bg: 'bg-emerald-50', color: 'text-emerald-500' },
  announcement: { icon: 'PartyPopper', bg: 'bg-rose-50', color: 'text-rose-500' },
}

const messageCategories = ref<any[]>([])
const selectedMsg = ref<any>(null)
const openDetail = (msg: any) => {
  selectedMsg.value = msg
}
const closeDetail = () => {
  selectedMsg.value = null
}

onMounted(async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/messages/center'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data?.categories) {
      messageCategories.value = p.data.categories.map((c: any) => {
        const def = categoryDefaults[c.type] || categoryDefaults.system
        return {
          ...c,
          icon: iconComponents[def.icon],
          bg: def.bg,
          color: def.color,
        }
      })
    }
  } catch { /* keep empty */ }
})
</script>

<template>
  <div class="space-y-6 md:space-y-8 pb-10 text-left">
    <!-- 头部 -->
    <div class="flex justify-between items-end px-1">
      <div>
        <h1 class="text-3xl font-black text-stone-900 tracking-tighter">消息中心</h1>
        <p class="text-sm font-medium text-stone-400 mt-1">Notifications & Audit Results</p>
      </div>
      <button class="relative p-3 rounded-full hover:bg-stone-100 transition-colors">
        <Bell class="w-6 h-6 text-stone-900" />
        <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
      </button>
    </div>

    <!-- 消息分类展示 -->
    <div class="space-y-8">
      <section v-for="(category, i) in messageCategories" :key="i" class="space-y-4">
        <div class="flex items-center gap-3 px-1">
          <div :class="['p-2 rounded-xl', category.bg, category.color]">
            <component :is="category.icon" class="w-5 h-5" />
          </div>
          <h3 class="font-black text-stone-900 tracking-tight leading-none uppercase text-sm">{{ category.title }}</h3>
          <div class="flex-1 border-b border-stone-100 mb-1"></div>
        </div>

        <div class="bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm">
          <div 
            v-for="(msg, idx) in category.messages" 
            :key="idx" 
            class="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors border-b last:border-none border-stone-50 cursor-pointer group"
            @click="openDetail(msg)"
          >
            <div class="flex items-center gap-3">
              <div v-if="!msg.read" class="w-2 h-2 bg-rose-500 rounded-full shrink-0"></div>
              <span :class="['font-bold text-sm', msg.read ? 'text-stone-400' : 'text-stone-900']">
                {{ msg.title }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[10px] font-medium text-stone-300">{{ msg.time }}</span>
              <ChevronRight class="w-4 h-4 text-stone-200 group-hover:text-stone-400 transition-colors" />
            </div>
          </div>
        </div>
      </section>
    </div>

    <button class="w-full py-4 bg-stone-100 text-stone-400 font-black text-[10px] rounded-2xl tracking-[0.2em] uppercase active:scale-95 transition-all hover:bg-stone-200 hover:text-stone-600">
      清空全部已读消息
    </button>

    <!-- 消息详情弹窗 -->
    <Teleport to="body">
      <div v-if="selectedMsg" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="closeDetail">
        <div class="absolute inset-0 bg-stone-900/20 backdrop-blur-sm"></div>
        <div class="relative mx-4 max-w-sm w-full bg-white rounded-2xl p-6 shadow-2xl">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-base font-black text-stone-900 pr-8">{{ selectedMsg.title }}</h3>
            <button @click="closeDetail" class="shrink-0 text-stone-400 hover:text-stone-600">
              <X class="w-5 h-5" />
            </button>
          </div>
          <p class="text-xs text-stone-400 mb-4">{{ selectedMsg.time }}</p>
          <p class="text-sm text-stone-700 leading-relaxed whitespace-pre-line">{{ selectedMsg.content || '暂无详细内容' }}</p>
          <button @click="closeDetail" class="mt-6 w-full bg-stone-100 hover:bg-stone-200 rounded-xl py-2.5 text-xs font-bold text-stone-600">关闭</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
