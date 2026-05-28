<script setup lang="ts">
import { Sparkles, ArrowUpRight } from 'lucide-vue-next'

defineProps<{
  todaySummary: string
  peakTime: string
  recommendedItem: string
  expectedIncrease: string
}>()

const emit = defineEmits<{ (e: 'viewPlan'): void }>()
</script>

<template>
  <div class="bg-gradient-to-br from-[#FFFDF9] to-[#FFF6EA] sm:from-amber-50 sm:to-orange-100/80 border border-orange-100 sm:border-orange-200/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
    <div class="absolute right-0 bottom-0 top-0 w-1/4 sm:w-1/3 opacity-[.05] sm:opacity-[.08] pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:10px_10px] sm:[background-size:12px_12px]" />
    <div class="relative z-10 space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:justify-between sm:items-stretch sm:gap-5 sm:text-left">
      <div class="space-y-3 sm:flex-1 sm:min-w-0">
        <div class="flex items-center justify-between sm:justify-start gap-2 sm:border-0 border-b border-orange-100/20 pb-2 sm:pb-0">
          <span class="bg-orange-500/10 text-orange-700 text-[11px] sm:text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 select-none">
            <Sparkles class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-500" />
            今日 AI 特别经营决策
          </span>
          <span class="bg-emerald-500/15 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-md shrink-0 sm:hidden">
            预计收益 {{ expectedIncrease }}
          </span>
        </div>
        <p class="text-[13px] sm:text-sm font-extrabold text-stone-800 leading-relaxed">{{ todaySummary }}</p>
        <div class="grid grid-cols-2 gap-2 sm:gap-3">
          <div class="bg-white/70 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-orange-100/15 sm:border-orange-100/40">
            <span class="text-[9px] sm:text-[10px] text-stone-400 font-bold block">主推商品</span>
            <span class="text-xs sm:text-[11px] font-black text-stone-800 mt-1 block truncate">{{ recommendedItem }}</span>
          </div>
          <div class="bg-white/70 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-orange-100/15 sm:border-orange-100/40">
            <span class="text-[9px] sm:text-[10px] text-stone-400 font-bold block">主力客时时段</span>
            <span class="text-xs sm:text-[11px] font-black text-stone-800 mt-1 block truncate">{{ peakTime }}</span>
          </div>
        </div>
        <button @click="emit('viewPlan')" class="w-full sm:hidden bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full py-1.5 text-[11px] font-extrabold shadow-md flex items-center justify-center gap-1">
          查看方案<ArrowUpRight class="w-3.5 h-3.5" />
        </button>
      </div>
      <div class="hidden sm:flex w-full sm:w-[240px] md:w-[260px] flex-col items-center justify-center p-3.5 bg-white/95 rounded-xl border border-[#EBE3D5] shadow-sm shrink-0 text-center">
        <span class="text-[9.5px] text-stone-400 font-bold select-none">策略预计带来收益</span>
        <span class="my-1 tracking-tight font-black text-lg sm:text-xl md:text-2xl text-emerald-600 max-w-full">{{ expectedIncrease }}</span>
        <button @click="emit('viewPlan')" class="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-[1.02] active:scale-[0.98] text-white font-extrabold text-xs py-2 px-3 rounded-lg shadow-sm shadow-orange-500/10 transition-all duration-200 flex items-center justify-center gap-1 group mt-1.5">
          查看方案<ArrowUpRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  </div>
</template>
