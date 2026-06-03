<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Store,
  Search,
  Bell,
  ChevronDown
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api'

defineProps<{
  onOpenMessages?: () => void;
  merchantName?: string;
  avatarUrl?: string;
}>();

interface NotifItem {
  id: number; title: string; content: string; time: string; category: string;
}

const showNotifications = ref(false);
const unreadCount = ref(0)
const notifications = ref<NotifItem[]>([])

const fetchNotifications = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/messages/center'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data?.categories) {
      const all: NotifItem[] = []
      for (const cat of p.data.categories) {
        for (const m of (cat.messages || [])) {
          all.push({ id: m.id, title: m.title, content: m.content || '', time: m.time, category: cat.type })
        }
      }
      notifications.value = all.slice(0, 5)
      unreadCount.value = all.filter((m: any) => !m.read).length
    }
  } catch { }
}

onMounted(() => { fetchNotifications() })
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-stone-100 bg-white/88 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
    <div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-3 sm:px-4 md:min-h-20 md:gap-6">
      <!-- Logo -->
      <div class="shrink-0">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 shadow-lg shadow-amber-400/20 sm:h-11 sm:w-11">
          <Store class="h-5 w-5 text-white fill-white sm:h-6 sm:w-6" />
        </div>
      </div>

      <!-- Search Bar -->
      <div class="relative min-w-0 flex-1">
        <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <Search class="h-4 w-4 text-stone-400" />
        </div>
        <input 
          type="text" 
          placeholder="搜索功能 / 摊位 / 数据" 
          class="w-full rounded-full border border-stone-100 bg-stone-50 py-2.5 pl-11 pr-4 text-sm font-medium text-stone-700 outline-none transition-all placeholder:text-stone-300 focus:border-amber-300 focus:ring-4 focus:ring-amber-100/70"
        />
      </div>

      <!-- Actions -->
      <div class="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button 
          @click="showNotifications = !showNotifications"
          class="relative rounded-full p-2 transition-colors hover:bg-stone-50 sm:p-2.5"
        >
          <Bell class="h-5 w-5 text-stone-900" />
          <span v-if="unreadCount > 0" class="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[8px] font-black text-white sm:right-2 sm:top-2">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>

        <div class="flex items-center gap-2 border-l border-stone-100 pl-2 sm:gap-3 sm:pl-4">
          <div class="h-8 w-8 overflow-hidden rounded-full border-2 border-stone-50 sm:h-9 sm:w-9">
            <img :src="avatarUrl || 'https://picsum.photos/seed/merchant/100/100'" alt="Avatar" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div class="hidden sm:flex items-center gap-1.5 cursor-pointer group">
            <span class="text-sm font-bold text-stone-900">{{ merchantName || '商户' }}</span>
            <ChevronDown class="w-4 h-4 text-stone-400 group-hover:translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="showNotifications" class="absolute top-full right-4 mt-2 w-80 bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 overflow-hidden">
          <div>
            <div class="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
              <h4 class="font-bold text-sm">最新通知</h4>
              <span class="text-[10px] font-black text-amber-500 uppercase tracking-widest">{{ notifications.length }} 条消息</span>
            </div>
            <div class="max-h-[320px] overflow-y-auto">
              <div v-for="msg in notifications" :key="msg.id" class="p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                <div class="flex justify-between items-start mb-1">
                  <h5 :class="['font-bold text-xs', msg.type === 'success' ? 'text-emerald-600' : 'text-amber-600']">{{ msg.title }}</h5>
                  <span class="text-[9px] font-medium text-stone-400">{{ msg.time }}</span>
                </div>
                <p class="text-[11px] font-medium text-stone-500 leading-relaxed truncate">{{ msg.content }}</p>
              </div>
            </div>
            <button 
              @click="showNotifications = false; onOpenMessages?.()"
              class="w-full py-4 bg-stone-50 text-stone-400 font-bold text-xs hover:bg-stone-100 transition-colors"
            >
              查看全部历史消息
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>
