<script setup lang="ts">
import { 
  LayoutDashboard, 
  Store, 
  TrendingUp, 
  MessageSquare,
  User 
} from 'lucide-vue-next';
import type { Tab } from '../types';

defineProps<{
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}>();

const tabs = [
  { id: 'home', label: '首页', icon: LayoutDashboard },
  { id: 'stall', label: '摊位', icon: Store },
  { id: 'business', label: '经营', icon: TrendingUp },
  { id: 'messages', label: '消息', icon: MessageSquare },
  { id: 'settings', label: '我的', icon: User },
] as const;
</script>

<template>
  <nav class="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center border-t border-stone-100 bg-white/95 px-2 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-2xl sm:pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:pb-6">
    <div class="mx-auto flex w-full max-w-4xl justify-between px-2.5 sm:px-4">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="onTabChange(tab.id as Tab)"
        :class="[
          'relative flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 md:px-6 md:py-3 transition-all duration-500 rounded-full group min-w-0',
          activeTab === tab.id 
            ? 'bg-amber-400 text-stone-900 shadow-lg shadow-amber-400/20' 
            : 'text-stone-400 hover:text-stone-600'
        ]"
      >
        <component :is="tab.icon" :class="['w-5 h-5', activeTab === tab.id ? 'fill-current' : '']" />
        
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 translate-x-1"
          enter-to-class="opacity-100 translate-x-0"
        >
          <span v-if="activeTab === tab.id" class="hidden font-bold text-sm tracking-tight sm:inline">{{ tab.label }}</span>
        </Transition>

        <Transition
          enter-active-class="transition-all duration-500"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
        >
          <div v-if="activeTab === tab.id" class="absolute inset-0 bg-amber-400 rounded-full -z-10" />
        </Transition>
      </button>
    </div>
  </nav>
</template>
