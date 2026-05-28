<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import AIThinkingAnimation from './AIThinkingAnimation.vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  problem?: string
  reasons?: string[]
  schemes?: { name: string; desc: string; actionType: string }[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'applyStrategy', actionType: string): void
}>()

const loading = ref(true)
watch(() => props.isOpen, (v) => { if (v) loading.value = true })
function done() { loading.value = false }
</script>

<template>
  <Transition name="drawer">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-md" @click="emit('close')" />
      <div class="relative w-full sm:w-[480px] h-[85vh] sm:h-[80vh] sm:max-h-[640px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-100">
        <div class="px-5 py-3.5 shrink-0 border-b border-stone-100 flex items-center justify-between">
          <h2 class="text-sm font-black text-stone-800">AI 分析报告 · {{ title }}</h2>
          <button @click="emit('close')" class="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200"><X class="w-3.5 h-3.5" /></button>
        </div>

        <div class="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div v-if="loading" class="py-8"><AIThinkingAnimation @done="done" /></div>

          <template v-else>
            <!-- 问题 -->
            <div v-if="problem" class="space-y-1.5">
              <p class="text-[10px] font-bold text-rose-500 uppercase tracking-wider">问题</p>
              <p class="text-sm font-bold text-stone-700 leading-relaxed">{{ problem }}</p>
            </div>

            <!-- 分析（归因） -->
            <div v-if="reasons && reasons.length" class="space-y-2">
              <p class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">分析</p>
              <div class="space-y-1.5">
                <p v-for="(r, i) in reasons" :key="i" class="text-xs text-stone-600 leading-relaxed pl-3 border-l-2 border-emerald-200">{{ r }}</p>
              </div>
            </div>

            <!-- 建议（纯报告，无按钮） -->
            <div v-if="schemes && schemes.length" class="space-y-2.5">
              <p class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">建议</p>
              <div v-for="(s, i) in schemes" :key="i" class="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-1.5">
                <p class="text-xs font-black text-stone-800">{{ s.name }}</p>
                <p class="text-[11px] text-stone-600 leading-relaxed whitespace-pre-line">{{ s.desc }}</p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-enter-active, .drawer-leave-active { transition: all 0.3s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
.drawer-enter-from > div:last-child { transform: translateY(100%); }
.drawer-leave-to > div:last-child { transform: translateY(100%); }
@media (min-width: 640px) {
  .drawer-enter-from > div:last-child { transform: translateY(20px) scale(0.96); }
  .drawer-leave-to > div:last-child { transform: translateY(20px) scale(0.96); }
}
</style>
