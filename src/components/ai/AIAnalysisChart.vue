<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  topItems?: { rank: number; name: string; value: string; percent: number }[]
  heatmap?: number[][]
}>(), {
  topItems: () => [],
  heatmap: () => [],
})

// 使用传入数据或 fallback
const displayTopItems = computed(() => {
  if (props.topItems && props.topItems.length) return props.topItems
  return [
    { rank: 1, name: '—', value: '暂无', percent: 0 },
  ]
})

const heatGridColors = [
  'bg-stone-50/50', 'bg-orange-100/60', 'bg-orange-200/85', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500'
]

const displayHeatmap = computed(() => {
  if (props.heatmap && props.heatmap.length) return props.heatmap
  return [
    [1, 2, 4, 5, 2, 1], [1, 3, 5, 5, 3, 1], [2, 3, 4, 4, 3, 1],
    [2, 4, 5, 5, 4, 2], [3, 5, 5, 5, 5, 3], [4, 5, 5, 5, 5, 4],
    [4, 5, 5, 5, 5, 4],
  ]
})

function rankBadge(r: number): string {
  if (r === 1) return 'bg-orange-500 text-white'
  if (r === 2) return 'bg-amber-500 text-white'
  if (r === 3) return 'bg-yellow-400 text-stone-900'
  return 'bg-[#ECE5D8] text-stone-600'
}
</script>

<template>
  <div class="space-y-4 pt-1">

    <div class="bg-white/80 border border-[#EBE3D5] rounded-2xl p-4 space-y-3.5 shadow-xs">
      <div class="text-[11.5px] font-extrabold text-[#7C6E59] select-none uppercase tracking-wider flex items-center justify-between">
        <span>🔥 热销排行 TOP5</span>
        <span class="text-[9.5px] text-[#A69276]">基于实际数据</span>
      </div>

      <div class="space-y-3 select-none">
        <div v-for="item in displayTopItems" :key="item.rank" class="space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span :class="['w-4.5 h-4.5 rounded-full flex items-center justify-center font-black text-[10px] shadow-xs', rankBadge(item.rank)]">{{ item.rank }}</span>
              <span class="text-stone-800 font-extrabold text-[12px]">{{ item.name }}</span>
            </div>
            <span class="text-stone-600 font-extrabold font-mono text-[11px]">{{ item.value }}</span>
          </div>
          <div class="h-2 bg-[#EFEAE2]/60 rounded-full w-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-700" :style="{ width: item.percent + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white/80 border border-[#EBE3D5] rounded-2xl p-4 space-y-3.5 shadow-xs">
      <div class="space-y-0.5 select-none">
        <div class="text-[12px] font-extrabold text-stone-800 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          <span>时段交易活跃度</span>
        </div>
        <span class="text-[9.5px] text-stone-400 block ml-3">星期（一至日）vs 时段区间</span>
      </div>

      <div class="grid grid-cols-7 gap-1.5 px-1 pt-1 select-none">
        <span class="text-[10px] text-stone-500 font-black text-center" v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</span>
      </div>

      <div class="space-y-1.5 px-1 select-none">
        <div v-for="rowIdx in [0,1,2,3,4,5]" :key="rowIdx" class="grid grid-cols-7 gap-1.5">
          <div v-for="colIdx in [0,1,2,3,4,5,6]" :key="colIdx"
            class="h-4.5 rounded-md transition-all duration-200 hover:scale-110 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border border-[#EBE3D5]/40"
            :class="heatGridColors[displayHeatmap[colIdx]?.[rowIdx] ?? 0]"
            :title="`活跃指数: ${displayHeatmap[colIdx]?.[rowIdx] ?? 0}级`" />
        </div>
      </div>

      <div class="flex items-center justify-between text-[9px] text-stone-400 font-mono px-1 pt-1 select-none bg-[#FAF8F5] p-2 rounded-xl border border-[#EBE3D5]/40">
        <span>淡季</span>
        <span class="flex gap-1.5 items-center">
          <span class="w-2.5 h-2.5 bg-stone-50/50 border border-[#EBE3D5]/50 rounded-xs" />
          <span class="w-2.5 h-2.5 bg-orange-100 rounded-xs" />
          <span class="w-2.5 h-2.5 bg-orange-300 rounded-xs" />
          <span class="w-2.5 h-2.5 bg-orange-500 rounded-xs" />
        </span>
        <span>热点</span>
      </div>
    </div>
  </div>
</template>
