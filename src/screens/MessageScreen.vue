<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Bell,
  CheckCircle2,
  PartyPopper,
  ChevronRight,
  ShieldCheck
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api'
import { useMessageStore } from '../stores/messageStore'

const { markOneRead } = useMessageStore()

const iconComponents: Record<string, any> = { ShieldCheck, CheckCircle2, PartyPopper }

const categoryDefaults: Record<string, { icon: string, bg: string, color: string }> = {
  system: { icon: 'ShieldCheck', bg: 'bg-blue-50', color: 'text-blue-500' },
  audit: { icon: 'CheckCircle2', bg: 'bg-emerald-50', color: 'text-emerald-500' },
  announcement: { icon: 'PartyPopper', bg: 'bg-rose-50', color: 'text-rose-500' },
}

const messageCategories = ref<any[]>([])
const expandedId = ref<number | null>(null)
const collapsedCats = ref(new Set<string>())
const toggleCat = (type: string) => {
  if (collapsedCats.value.has(type)) collapsedCats.value.delete(type)
  else collapsedCats.value.add(type)
}
const openDetail = async (msg: any) => {
  if (expandedId.value === msg.id) { expandedId.value = null; return }
  expandedId.value = msg.id
  if (!msg.read && msg.id) {
    try {
      const token = localStorage.getItem('stall_auth_token') || ''
      await fetch(buildApiUrl(`/api/messages/${msg.id}/read`), {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` },
      })
      msg.read = true
      markOneRead()
    } catch { }
  }
}

const markAllRead = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    await fetch(buildApiUrl('/api/messages/read-all'), {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    })
    // 清空已读消息并刷新列表
    messageCategories.value = messageCategories.value
      .map((cat: any) => ({ ...cat, messages: (cat.messages || []).filter((m: any) => !m.read) }))
      .filter((cat: any) => (cat.messages || []).length > 0)
    const { fetchUnreadCount } = useMessageStore()
    fetchUnreadCount()
  } catch { }
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
        <div class="flex items-center gap-3 px-1 cursor-pointer select-none" @click="toggleCat(category.type)">
          <div :class="['p-2 rounded-xl', category.bg, category.color]">
            <component :is="category.icon" class="w-5 h-5" />
          </div>
          <h3 class="font-black text-stone-900 tracking-tight leading-none uppercase text-sm">{{ category.title }}</h3>
          <span class="text-[10px] font-bold text-stone-300">({{ (category.messages||[]).length }})</span>
          <div class="flex-1 border-b border-stone-100 mb-1"></div>
          <ChevronRight class="w-4 h-4 text-stone-300 shrink-0 transition-transform duration-200" :class="collapsedCats.has(category.type) ? '' : 'rotate-90'" />
        </div>

        <div v-if="!collapsedCats.has(category.type)" class="bg-white rounded-[2rem] overflow-hidden border border-stone-100 shadow-sm">
          <div v-for="(msg, idx) in category.messages" :key="idx" class="border-b last:border-none border-stone-50">
            <div
              class="p-5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group"
              @click="openDetail(msg)"
            >
              <span :class="['font-bold text-sm flex-1 min-w-0', msg.read ? 'text-stone-400' : 'text-stone-900']">
                {{ msg.title }}
              </span>
              <span class="flex items-center gap-2 shrink-0">
                <span class="text-[10px] font-medium text-stone-300">{{ msg.time }}</span>
                <span class="relative flex items-center">
                  <ChevronRight class="w-4 h-4 text-stone-200 group-hover:text-stone-400 transition-transform duration-200" :class="expandedId === msg.id ? 'rotate-90' : ''" />
                  <span v-if="!msg.read" class="absolute -right-0.5 -top-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                </span>
              </span>
            </div>
            <div v-if="expandedId === msg.id" class="px-5 pb-5 -mt-1">
              <p class="text-sm text-stone-600 leading-relaxed whitespace-pre-line bg-stone-50 rounded-2xl p-4">{{ msg.content || '暂无详细内容' }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <button @click="markAllRead" class="w-full py-4 bg-stone-100 text-stone-400 font-black text-[10px] rounded-2xl tracking-[0.2em] uppercase active:scale-95 transition-all hover:bg-stone-200 hover:text-stone-600">
      全部已读并清空
    </button>

  </div>
</template>
