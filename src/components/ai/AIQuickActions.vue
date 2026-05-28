<script setup lang="ts">
import { Sparkles, Utensils, Award, Tag, Bell, ArrowRightLeft } from 'lucide-vue-next'

// 定义事件
const emit = defineEmits<{
  (e: 'action', type: string): void
}>()

const actions = [
  { 
    type: 'CREATE_COMBO', 
    label: '一键生成套餐', 
    chars: ['一', '键', '生', '成', '套', '餐'], 
    sub: '智能',
    icon: Utensils, 
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    hoverBorder: 'hover:border-amber-300',
    hoverShadow: 'hover:shadow-md hover:shadow-amber-500/10',
    textHoverColor: 'group-hover:text-amber-600',
    subHoverClass: 'group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-100'
  },
  { 
    type: 'CREATE_DISCOUNT', 
    label: '一键开启促销', 
    chars: ['一', '键', '开', '启', '促', '销'], 
    sub: '第二半价',
    icon: Tag, 
    color: 'text-orange-600 bg-orange-50 border-orange-100',
    hoverBorder: 'hover:border-orange-300',
    hoverShadow: 'hover:shadow-md hover:shadow-orange-500/10',
    textHoverColor: 'group-hover:text-orange-600',
    subHoverClass: 'group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100'
  },
  { 
    type: 'GENERATE_POSTER', 
    label: '一键生成海报', 
    chars: ['一', '键', '生', '成', '海', '报'], 
    sub: 'AI极速',
    icon: Award, 
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    hoverBorder: 'hover:border-rose-300',
    hoverShadow: 'hover:shadow-md hover:shadow-rose-500/10',
    textHoverColor: 'group-hover:text-rose-600',
    subHoverClass: 'group-hover:bg-rose-50 group-hover:text-rose-600 group-hover:border-rose-100'
  },
  { 
    type: 'UPDATE_SORT', 
    label: '智能菜单排序', 
    chars: ['智', '能', '菜', '单', '排', '序'], 
    sub: '高利优先',
    icon: ArrowRightLeft, 
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    hoverBorder: 'hover:border-purple-300',
    hoverShadow: 'hover:shadow-md hover:shadow-purple-500/10',
    textHoverColor: 'group-hover:text-purple-600',
    subHoverClass: 'group-hover:bg-purple-50 group-hover:text-purple-600 group-hover:border-purple-100'
  },
  { 
    type: 'STOCK_ALERT', 
    label: '一键补货提醒', 
    chars: ['一', '键', '补', '货', '提', '醒'], 
    sub: '缺货预警',
    icon: Bell, 
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    hoverBorder: 'hover:border-indigo-300',
    hoverShadow: 'hover:shadow-md hover:shadow-indigo-500/10',
    textHoverColor: 'group-hover:text-indigo-600',
    subHoverClass: 'group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100'
  }
]
</script>

<template>
  <div class="space-y-4 select-none">
    
    <!-- Title Area -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1">
        <Sparkles class="w-4 h-4 text-orange-500 animate-pulse" />
        <h3 class="font-bold text-[#3a352d] text-[14px]">智能快捷决策操作</h3>
      </div>
      <span class="text-[9px] text-stone-400 font-bold">交互操作流</span>
    </div>
    
    <!-- 移动端：5列竖排 -->
    <div class="grid grid-cols-5 gap-2 sm:hidden items-center">
      <div
        v-for="(action, idx) in actions"
        :key="action.type"
        @click="emit('action', action.type)"
        class="bg-white/95 rounded-2xl border border-stone-200/80 p-2.5 shadow-sm cursor-pointer active:scale-95 transition-all duration-300 flex flex-col items-center justify-between text-center gap-2 h-[215px] group"
        :class="[
          action.hoverBorder, action.hoverShadow,
          idx % 2 === 0 ? '-translate-y-1.5' : 'translate-y-2.5'
        ]"
      >
        <div class="w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border" :class="action.color">
          <component :is="action.icon" class="w-4 h-4" />
        </div>
        <div class="flex flex-col items-center justify-center flex-1 py-1">
          <span v-for="(char, cIdx) in action.chars" :key="cIdx" class="text-[11px] font-black text-[#5c5446] leading-none block py-px">{{ char }}</span>
        </div>
        <div class="w-fit bg-stone-50 border border-stone-200 rounded-sm py-1 px-1 flex flex-col items-center min-w-[20px]" :class="action.subHoverClass">
          <span v-for="(subChar, sIdx) in action.sub.split('')" :key="sIdx" class="text-[8px] font-black leading-none py-0.5">{{ subChar }}</span>
        </div>
      </div>
    </div>

    <!-- 桌面端：横向长条胶囊，错开排列 -->
    <div class="hidden sm:flex justify-center gap-3 flex-wrap">
      <div
        v-for="(action, idx) in actions"
        :key="action.type"
        @click="emit('action', action.type)"
        class="bg-white rounded-full border border-stone-200/80 shadow-sm cursor-pointer active:scale-95 transition-all duration-300 hover:shadow-md flex items-center gap-3 px-5 py-3 group"
        :class="[
          action.hoverBorder, action.hoverShadow,
          idx % 2 === 0 ? '-translate-y-2' : 'translate-y-2'
        ]"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border" :class="action.color">
          <component :is="action.icon" class="w-[1.125rem] h-[1.125rem]" />
        </div>
        <div class="flex flex-col items-start leading-tight">
          <span class="text-sm font-black text-stone-700 whitespace-nowrap">{{ action.label }}</span>
          <span class="text-[10px] font-semibold text-stone-400 -mt-0.5">{{ action.sub }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
