<script setup lang="ts">
import { computed } from 'vue'
import { Flame, MapPin } from 'lucide-vue-next'

const props = defineProps<{
  market: {
    id: number
    name: string
    distance: string
    tag: string
    image: string
    aspect?: number
  }
  index: number
}>()

// 根据索引错开图片比例，形成自然瀑布流
const aspectRatio = computed(() => {
  if (props.market.aspect) return props.market.aspect
  const ratios = [5/4, 3/4, 4/5, 2/3, 1/1, 4/3]
  return ratios[props.index % ratios.length]
})

// 错开左右边距，产生轻微偏移感
const marginOffset = computed(() => {
  return props.index % 2 === 0 ? 'mt-0' : 'mt-4'
})
</script>

<template>
  <article
    :class="['break-inside-avoid overflow-hidden rounded-[1.25rem] transition active:scale-[0.98] cursor-pointer', marginOffset]"
    style="background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(245,242,237,0.4) 100%);"
  >
    <div class="relative overflow-hidden rounded-[1.25rem]">
      <img
        :src="market.image"
        :alt="market.name"
        :style="{ aspectRatio: String(aspectRatio) }"
        class="w-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />
      <span class="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/15 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white/95">
        <Flame class="h-3 w-3 text-orange-400" />
        {{ market.tag }}
      </span>
    </div>
    <div class="px-3.5 pb-3.5 pt-2.5">
      <h5 class="text-[13px] font-black leading-snug text-stone-900 line-clamp-2">{{ market.name }}</h5>
      <p class="flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-stone-400">
        <MapPin class="h-3 w-3 text-amber-500" />
        {{ market.distance }}
      </p>
    </div>
  </article>
</template>
