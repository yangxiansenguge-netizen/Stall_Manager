<script setup lang="ts">
import { ArrowUpRight, Clock3, Flame } from 'lucide-vue-next';

const props = defineProps<{
  status?: 'none' | 'pending' | 'active';
}>();

const emit = defineEmits(['apply']);

const opportunityStats = [
  {
    label: '黄金时段',
    value: '17:00 - 22:00',
    icon: Clock3,
    iconWrap: 'bg-orange-50 text-orange-500',
    cardClass: 'border-orange-100 bg-orange-50/80',
    labelClass: 'text-orange-500'
  },
  {
    label: '热门商圈',
    value: '文化广场',
    icon: Flame,
    iconWrap: 'bg-white text-orange-400',
    cardClass: 'border-stone-100 bg-stone-50',
    labelClass: 'text-stone-400'
  }
];
</script>

<template>
  <article class="relative overflow-hidden rounded-[2.2rem] border border-stone-50 bg-white p-5 shadow-[0_10px_20px_rgba(0,0,0,0.05)] sm:p-6 md:p-8">
    <div class="absolute -top-14 right-5 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-50/80 text-orange-400 shadow-[0_18px_35px_rgba(251,146,60,0.14)] sm:right-6 sm:top-6 sm:h-24 sm:w-24">
      <Flame class="h-8 w-8" />
    </div>

    <div class="relative z-10 flex h-full flex-col gap-5 text-left">
      <div class="flex flex-wrap items-center gap-2 text-left">
        <div class="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Current Opportunities</span>
        <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-500">空余 23 处</span>
        <span
          v-if="props.status === 'pending'"
          class="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-700"
        >
          审核中
        </span>
      </div>

      <div class="space-y-3 pr-14 sm:pr-20">
        <h2 class="text-[2rem] font-black leading-[0.92] tracking-tighter text-stone-900 sm:text-[2.35rem] md:text-5xl">
          开启你的
          <span class="block text-orange-500">烟火气生意</span>
        </h2>
        <p class="max-w-md text-sm font-medium leading-relaxed text-stone-500">
          在热门商圈里更快找到可申请摊位、查看推荐区域，并直接进入入驻申请。
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div
          v-for="item in opportunityStats"
          :key="item.label"
          :class="['rounded-[1.4rem] border p-3 text-left sm:p-4', item.cardClass]"
        >
          <div :class="['flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm', item.iconWrap]">
            <component :is="item.icon" class="h-4 w-4" />
          </div>
          <p :class="['mt-3 text-[10px] font-black uppercase tracking-widest', item.labelClass]">{{ item.label }}</p>
          <p class="mt-1 text-sm font-black text-stone-900 sm:text-base">{{ item.value }}</p>
        </div>
      </div>

      <button
        type="button"
        @click="emit('apply')"
        class="group mt-auto inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-stone-900/10 transition-all hover:-translate-y-0.5 active:scale-95"
      >
        {{ props.status === 'pending' ? '查看申请进度' : '立即申请入驻' }}
        <ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </button>
    </div>
  </article>
</template>
