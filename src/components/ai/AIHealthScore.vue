<script setup lang="ts">
import { ShieldCheck, Flame, TrendingUp, AlertCircle, RefreshCw } from 'lucide-vue-next'

// 定义经营评分属性
defineProps<{
  score: number
  factors: {
    attraction: number
    profit: number
    repurchase: number
  }
  risks: string[]
}>()
</script>

<template>
  <div class="bg-white rounded-3xl border border-stone-100/80 p-5 shadow-sm space-y-5 select-none">
    
    <!-- Title & Score Badge -->
    <div class="flex items-center justify-between gap-2.5">
      <div class="space-y-0.5">
        <h3 class="font-bold text-[#3a352d] text-[14.5px] tracking-tight flex items-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
          <span>AI 经营健康度</span>
        </h3>
        <p class="text-[9.5px] text-stone-400 leading-tight">基于近7天交易数据、天气与周边竞品计算</p>
      </div>
      
      <!-- Big Circle Score Indicator -->
      <div class="bg-orange-50/50 h-[52px] w-[52px] rounded-full flex flex-col items-center justify-center border border-orange-100/80 shrink-0">
        <span class="text-lg font-black text-orange-600 leading-none">{{ score }}</span>
        <span class="text-[8px] text-orange-500/80 font-black scale-95 leading-none mt-0.5">{{ score >= 80 ? '优秀' : score >= 60 ? '良好' : '需改进' }}</span>
      </div>
    </div>
    
    <!-- 3 Core Factor Progress Bars -->
    <div class="space-y-3.5 pt-0.5">
      <!-- 1. 商品吸引力 (Re-labeled: 商品吸引客流度) -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs font-bold text-stone-600">
          <span class="flex items-center gap-1 text-[11px]"><Flame class="w-3.5 h-3.5 text-orange-500 shrink-0" /> 商品吸引客流度</span>
          <span class="font-mono text-stone-700 text-[11px]">{{ factors.attraction }}分</span>
        </div>
        <div class="h-2 bg-stone-100/80 rounded-full overflow-hidden">
          <div class="h-full bg-orange-400 rounded-full transition-all duration-700" :style="{ width: factors.attraction + '%' }"></div>
        </div>
      </div>
      
      <!-- 2. 平均商品利润率 (Re-labeled: 平均商品利润空间) -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs font-bold text-stone-600">
          <span class="flex items-center gap-1 text-[11px]"><TrendingUp class="w-3.5 h-3.5 text-emerald-500 shrink-0" /> 平均商品利润空间</span>
          <span class="font-mono text-stone-700 text-[11px]">{{ factors.profit }}分</span>
        </div>
        <div class="h-2 bg-stone-100/80 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-400 rounded-full transition-all duration-700" :style="{ width: factors.profit + '%' }"></div>
        </div>
      </div>

      <!-- 3. 粘性与复购转化能力 -->
      <div class="space-y-1.5">
        <div class="flex justify-between items-center text-xs font-bold text-stone-600">
          <span class="flex items-center gap-1 text-[11px]"><RefreshCw class="w-3.5 h-3.5 text-blue-500 shrink-0" /> 粘性与复购转化能力</span>
          <span class="font-mono text-stone-700 text-[11px]">{{ factors.repurchase }}分</span>
        </div>
        <div class="h-2 bg-stone-100/80 rounded-full overflow-hidden">
          <div class="h-full bg-blue-400 rounded-full transition-all duration-700" :style="{ width: factors.repurchase + '%' }"></div>
        </div>
      </div>
    </div>
    
    <!-- Loopholes List Box matching the Pink Alert Card with 3 items in Mockup -->
    <div class="bg-[#FFF5F5] border border-rose-100 rounded-2xl p-4 space-y-2.5">
      <div class="text-[11px] font-extrabold text-[#C0392B] flex items-center gap-1.5">
        <AlertCircle class="w-3.5 h-3.5 text-rose-500 shrink-0" />
        <span>待防范解决经营漏洞 ({{ risks.length }}项)</span>
      </div>
      
      <ul class="space-y-2 text-[10.5px] text-[#7A4A4A] leading-relaxed">
        <li v-for="(risk, idx) in risks" :key="idx" class="flex items-start gap-1">
          <span class="text-rose-400 font-black mr-1">•</span>
          <span>{{ risk }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
