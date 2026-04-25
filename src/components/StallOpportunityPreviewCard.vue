<script setup lang="ts">
import { ChevronRight, Clock3, Flame, MapPin, Navigation } from 'lucide-vue-next';

const emit = defineEmits(['apply']);

const previewStats = [
  {
    label: '通过率',
    value: '92%',
    sub: '高通过率',

    icon: Clock3
  },
  {
    label: '步行距离',
    value: '1.2km',
    sub: '距离推荐区域',
    icon: Navigation
  }
];
</script>

<template>
  <article class="overflow-hidden rounded-[2.2rem] border border-stone-100 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
    <div class="relative overflow-hidden rounded-b-[1.6rem] rounded-t-[2.2rem]">
      <div class="relative h-[260px] sm:h-[320px] lg:h-full lg:min-h-[420px]">
        <img
          src="https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=1200&auto=format&fit=crop"
          alt="Night Market"
          class="h-full w-full object-cover transition-transform duration-[2000ms] hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-stone-950/78 via-stone-900/10 to-transparent"></div>

        <div class="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-stone-900 backdrop-blur-md">
          <Flame class="h-3.5 w-3.5 text-orange-500" />
          热门推荐区
        </div>

        <div class="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-gradient-to-t from-stone-950/90 to-stone-950/30 px-4 py-4 backdrop-blur-[2px] sm:px-5">
          <div class="flex items-end justify-between gap-3">
            <div class="flex min-w-0 items-start gap-3 text-left text-white">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50/10 text-orange-300 backdrop-blur-md">
                <MapPin class="h-5 w-5" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-black uppercase tracking-widest text-white/60">推荐区域</p>
                <p class="truncate text-sm font-black text-white sm:text-base">文化广场·夜市区</p>
              </div>
            </div>

            <button
              type="button"
              @click="emit('apply')"
              class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-black text-white backdrop-blur-md transition-all hover:bg-white hover:text-stone-900"
            >
              查看详情
              <ChevronRight class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 p-4 sm:p-5">
      <div
        v-for="item in previewStats"
        :key="item.label"
        class="rounded-[1.45rem] border border-stone-100 bg-stone-50/70 px-4 py-3 text-left"
      >
        <div class="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-orange-400 shadow-sm">
          <component :is="item.icon" class="h-4 w-4" />
        </div>
        <p class="mt-3 text-[10px] font-bold uppercase tracking-widest text-stone-400">{{ item.label }}</p>
        <p class="mt-1 text-xl font-black tracking-tight text-stone-900">{{ item.value }}</p>
        <p class="mt-1 text-[10px] font-bold text-stone-300">{{ item.sub }}</p>
      </div>
    </div>
  </article>
</template>
