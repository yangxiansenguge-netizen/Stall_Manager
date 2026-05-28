<script setup lang="ts">
interface Suggestion {
  id: string | number
  title: string
  label: string
  labelType: string
  text: string
  rightText: string
  actionType?: string
}

defineProps<{ item: Suggestion; applied?: boolean }>()

const emit = defineEmits<{
  (e: 'analyze', id: string | number): void
  (e: 'apply', id: string | number): void
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-stone-100 p-4 shadow-xs hover:border-orange-100 transition-all space-y-2.5">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="w-1.5 h-1.5 rounded-full shrink-0"
        :class="{ 'bg-rose-500': item.labelType==='danger', 'bg-emerald-500': item.labelType==='opportunity', 'bg-amber-500': item.labelType==='risk', 'bg-blue-500': item.labelType==='info' }" />
      <h3 class="font-bold text-stone-800 text-sm truncate">{{ item.title }}</h3>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0"
        :class="{ 'bg-rose-50 text-rose-600': item.labelType==='danger', 'bg-emerald-50 text-emerald-600': item.labelType==='opportunity', 'bg-amber-50 text-amber-600': item.labelType==='risk', 'bg-indigo-50 text-indigo-600': item.labelType==='info' }">
        {{ item.label }}
      </span>
      <div class="ml-auto text-right leading-tight">
        <span class="text-[11px] font-bold text-stone-400 block">预计提升</span>
        <span class="text-base font-black text-emerald-600">{{ item.rightText }}</span>
      </div>
    </div>

    <p class="text-xs text-stone-500 leading-relaxed line-clamp-2">{{ item.text }}</p>

    <div class="flex gap-2 pt-0.5">
      <button @click="emit('analyze', item.id)"
        class="border border-[#E5D6BD] text-stone-500 bg-white hover:border-orange-300 hover:text-orange-600 text-[11px] font-extrabold py-1.5 px-3.5 rounded-xl transition-all active:scale-95">
        AI 分析
      </button>
      <button v-if="applied" disabled
        class="text-white text-[11px] font-extrabold py-1.5 px-3.5 rounded-xl bg-emerald-500 cursor-default">
        已应用 ✓
      </button>
      <button v-else @click="emit('apply', item.id)"
        class="text-white text-[11px] font-extrabold py-1.5 px-3.5 rounded-xl transition-all active:scale-95"
        :class="{ 'bg-orange-500 hover:bg-orange-600': item.labelType==='danger', 'bg-emerald-500 hover:bg-emerald-600': item.labelType==='opportunity', 'bg-amber-500 hover:bg-amber-600': item.labelType==='risk', 'bg-blue-500 hover:bg-blue-600': item.labelType==='info' }">
        一键应用
      </button>
    </div>
  </div>
</template>
