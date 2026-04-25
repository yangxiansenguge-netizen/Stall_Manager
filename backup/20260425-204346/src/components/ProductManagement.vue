<script setup lang="ts">
import {
  ShoppingBag,
  Users,
  CircleDollarSign,
  Sparkles,
  Search,
  Plus,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Settings,
  BarChart4
} from 'lucide-vue-next';
import { ref } from 'vue';
import lemonTeaImage from '../assets/lemon-tea.svg';
import spicyCutletImage from '../assets/spicy-cutlet.svg';
import skewerPlatterImage from '../assets/skewer-platter.svg';
import doubleSkinMilkImage from '../assets/double-skin-milk.svg';
import iceJellyImage from '../assets/ice-jelly.svg';

const emit = defineEmits(['back']);
const activeCategory = ref('全部商品');
const searchQuery = ref('');

const productStats = [
  { label: '商品总数', value: '64', trend: '+ 6', icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: '热销商品', value: '12', trend: '占比 18.8%', icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: '商品访客数', value: '3.2k', trend: '+ 15.6%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: '商品成交额', value: '¥8,560', trend: '+ 8.2%', icon: CircleDollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const categories = [
  { name: '全部商品', count: 64 },
  { name: '热销商品', count: 12 },
  { name: '新品', count: 8 },
  { name: '饮品', count: 28 },
  { name: '小吃', count: 20 },
  { name: '其他', count: 8 },
];

const tableProducts = [
  { 
    id: 1, 
    name: '柠檬冰茶', 
    tag: '热销', 
    type: '饮品', 
    price: 18, 
    stock: 45, 
    monthlySales: 856, 
    trend: '+ 12%', 
    visitors: '1.2k', 
    vTrend: '+ 18%', 
    revenue: '2,480', 
    rTrend: '+ 15%', 
    ctr: '28.9%', 
    cTrend: '+ 5%', 
    img: lemonTeaImage 
  },
  { 
    id: 2, 
    name: '香辣鸡排', 
    tag: '热销', 
    type: '小吃', 
    price: 22, 
    stock: 32, 
    monthlySales: 642, 
    trend: '+ 8%', 
    visitors: '980', 
    vTrend: '+ 12%', 
    revenue: '1,860', 
    rTrend: '+ 10%', 
    ctr: '28.9%', 
    cTrend: '+ 4%', 
    img: spicyCutletImage 
  },
  { 
    id: 3, 
    name: '烤串组合', 
    tag: '热销', 
    type: '小吃', 
    price: 28, 
    stock: 28, 
    monthlySales: 523, 
    trend: '+ 5%', 
    visitors: '860', 
    vTrend: '+ 6%', 
    revenue: '1,420', 
    rTrend: '+ 8%', 
    ctr: '27.2%', 
    cTrend: '+ 3%', 
    img: skewerPlatterImage 
  },
  { 
    id: 4, 
    name: '双皮奶', 
    tag: '新品', 
    type: '甜品', 
    price: 16, 
    stock: 50, 
    monthlySales: 412, 
    trend: '+ 10%', 
    visitors: '720', 
    vTrend: '+ 9%', 
    revenue: '960', 
    rTrend: '+ 7%', 
    ctr: '23.3%', 
    cTrend: '+ 2%', 
    img: doubleSkinMilkImage 
  },
  { 
    id: 5, 
    name: '杨梅冰粉', 
    tag: '新品', 
    type: '饮品', 
    price: 15, 
    stock: 40, 
    monthlySales: 387, 
    trend: '- 3%', 
    visitors: '680', 
    vTrend: '- 2%', 
    revenue: '780', 
    rTrend: '- 1%', 
    ctr: '20.2%', 
    cTrend: '- 1%', 
    img: iceJellyImage 
  },
];
</script>

<template>
  <div class="min-h-screen space-y-4 rounded-[1.7rem] border border-stone-50 bg-white p-3.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:space-y-6 sm:rounded-[2.5rem] sm:p-6 md:p-8">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-start justify-between gap-3 sm:gap-4 md:justify-start">
        <div class="flex items-center gap-3 sm:gap-4">
          <button @click="emit('back')" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-50 text-stone-400 transition-all hover:text-stone-900 sm:h-11 sm:w-11">
            <X class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div class="flex flex-col items-start text-left">
            <h2 class="text-xl font-black leading-none tracking-tight text-stone-900 sm:text-2xl">商品管理</h2>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Product Overview</p>
          </div>
        </div>

        <button class="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#FF6B00] px-3.5 text-[11px] font-black text-white shadow-lg shadow-orange-100 transition-colors hover:bg-orange-600 md:hidden">
          <Plus class="h-3.5 w-3.5" /> 上架商品
        </button>
      </div>

      <div class="grid grid-cols-1 gap-2 sm:gap-3 md:flex md:w-auto md:items-center">
        <div class="relative md:w-72">
          <input
            type="text"
            placeholder="搜索商品名称"
            class="w-full rounded-2xl border-none bg-[#F5F5F7] py-3 pl-11 pr-4 text-xs font-bold placeholder:text-stone-300 transition-all focus:ring-2 focus:ring-orange-500/20"
            v-model="searchQuery"
          />
          <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
        </div>
        <button class="hidden items-center justify-center gap-2.5 rounded-2xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white shadow-xl shadow-orange-100 transition-colors hover:bg-orange-600 md:flex md:px-6">
          <Plus class="h-4 w-4" /> 上架商品
        </button>
      </div>
    </div>

    <!-- KPI 数据栏 -->
    <div class="grid grid-cols-4 gap-1.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      <div v-for="(stat, i) in productStats" :key="i" class="group relative overflow-hidden rounded-[0.95rem] border border-stone-50 bg-white p-2 shadow-[0_15px_36px_rgba(0,0,0,0.02)] transition-all hover:border-orange-100 sm:min-w-0 sm:min-h-[9.5rem] sm:rounded-[2rem] sm:p-5">
        <div class="flex h-full min-h-[4.8rem] flex-col justify-start gap-1.5 sm:min-h-0 sm:justify-between sm:gap-0">
          <div class="flex items-start justify-between gap-1">
            <div :class="['flex h-6 w-6 items-center justify-center rounded-[0.75rem] shadow-inner transition-transform group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-2xl', stat.bg, stat.color]">
              <component :is="stat.icon" class="h-3 w-3 sm:h-6 sm:w-6" />
            </div>
            <p :class="['flex items-center gap-0.5 text-[6px] font-black leading-none sm:gap-1 sm:text-[9px]', stat.trend.includes('+') ? 'text-emerald-500' : 'text-stone-400']">
              <ArrowUp v-if="stat.trend.includes('+')" class="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
              {{ stat.trend }}
            </p>
          </div>
          <div class="space-y-0 text-left">
            <p class="text-[7px] font-bold uppercase tracking-tight leading-tight text-stone-300 sm:text-[10px]">{{ stat.label }}</p>
            <h3 class="text-[0.9rem] font-black leading-none tracking-tighter text-stone-900 sm:text-2xl">{{ stat.value }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- 经营建议栏 -->
    <div class="flex flex-col gap-2.5 rounded-[1.45rem] border border-amber-100/40 bg-amber-50/60 p-3.5 text-left sm:rounded-[2.2rem] sm:p-5 md:flex-row md:items-center md:justify-between">
      <div class="flex items-start gap-3 sm:gap-4">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] bg-white text-amber-500 shadow-sm sm:h-10 sm:w-10 sm:rounded-2xl">
          <Sparkles class="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </div>
        <p class="text-[13px] font-black leading-snug text-stone-700 sm:text-sm">
          <span class="mr-2 text-orange-500">经营建议</span>
          下午 15:00-17:00 转化率较低，建议推出下午茶优惠套餐提升转化率！
        </p>
      </div>
      <button class="flex items-center gap-1.5 text-[11px] font-black text-orange-500 transition-all hover:opacity-70 whitespace-nowrap sm:text-xs">
        查看详情 <ChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- 筛选与排序 -->
    <div class="flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
      <div class="flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="activeCategory = cat.name"
          :class="['whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black transition-all', activeCategory === cat.name ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-stone-50 text-stone-400 hover:bg-stone-100']"
        >
          {{ cat.name }} {{ cat.count }}
        </button>
      </div>
      <button class="flex items-center justify-center gap-2 rounded-xl bg-stone-50 px-4 py-2.5 text-xs font-black text-stone-400 transition-all hover:bg-stone-100 md:px-5">
        默认排序 <Filter class="h-4 w-4" />
      </button>
    </div>

    <!-- 手机端商品卡片 -->
    <div class="space-y-2.5 md:hidden">
      <article v-for="(p, idx) in tableProducts" :key="p.id" class="rounded-[1.45rem] border border-stone-100 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.03)]">
        <div class="flex items-start gap-3">
          <div class="relative shrink-0">
            <div class="h-14 w-14 overflow-hidden rounded-[1rem] border border-stone-50">
              <img :src="p.img" :alt="p.name" class="h-full w-full object-cover" />
            </div>
            <div v-if="idx < 3" :class="['absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-black text-white shadow-md', idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-stone-400' : 'bg-orange-300']">
              {{ idx + 1 }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="truncate text-[15px] font-black leading-none text-stone-900">{{ p.name }}</h4>
                <div class="mt-2 flex items-center gap-2">
                  <span :class="['rounded-full px-2 py-0.5 text-[9px] font-black leading-none', p.tag === '热销' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600']">
                    {{ p.tag }}
                  </span>
                  <span class="text-[10px] font-bold text-stone-300">{{ p.type }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-base font-black tracking-tighter text-orange-500">¥{{ p.price }}</p>
                <p class="mt-1 text-[9px] font-bold uppercase tracking-widest text-stone-300">库存 {{ p.stock }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">销量</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.monthlySales }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.trend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.trend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">访客</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.visitors }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.vTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.vTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.vTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">成交额</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">¥{{ p.revenue }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.rTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.rTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.rTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">转化率</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.ctr }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.cTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.cTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.cTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <button class="flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-stone-50 px-3 py-2.5 text-[11px] font-black text-stone-500 transition-all hover:bg-stone-100">
            <Settings class="h-4 w-4" /> 编辑
          </button>
          <button class="flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-orange-50 px-3 py-2.5 text-[11px] font-black text-orange-600 transition-all hover:bg-orange-100">
            <BarChart4 class="h-4 w-4" /> 数据
          </button>
        </div>
      </article>

      <div class="flex items-center justify-between rounded-[1.5rem] border border-stone-100 bg-stone-50/60 px-4 py-3">
        <p class="text-[10px] font-bold uppercase tracking-widest text-stone-300">共 64 条商品</p>
        <div class="flex items-center gap-1 text-[10px] font-black text-stone-400">
          10 条/页 <ChevronRight class="h-3 w-3 rotate-90" />
        </div>
      </div>
    </div>

    <!-- 桌面端表格 -->
    <div class="hidden overflow-hidden rounded-[2.4rem] border border-stone-50 bg-white text-left shadow-sm md:block">
      <div class="overflow-x-auto">
        <table class="min-w-[920px] w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-stone-100/50 bg-stone-50/50">
              <th class="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-stone-300">商品信息</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">价格</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-orange-500">销量</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">访客数</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">成交额</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="(p, idx) in tableProducts" :key="p.id" class="group transition-colors hover:bg-stone-50/50">
              <td class="py-6 pl-10">
                <div class="flex items-center gap-4">
                  <div class="relative shrink-0">
                    <div class="h-16 w-16 overflow-hidden rounded-2xl border border-stone-50">
                      <img :src="p.img" :alt="p.name" class="h-full w-full object-cover" />
                    </div>
                    <div v-if="idx < 3" :class="['absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-lg', idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-stone-400' : 'bg-orange-300']">
                      {{ idx + 1 }}
                    </div>
                  </div>
                  <div class="flex flex-col items-start text-left">
                    <h4 class="flex items-center gap-2 text-base font-black leading-none text-stone-900">
                      {{ p.name }}
                      <span :class="['rounded-full px-2 py-0.5 text-[9px] leading-none', p.tag === '热销' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600']">
                        {{ p.tag }}
                      </span>
                    </h4>
                    <p class="mt-1 text-[10px] font-bold text-stone-300">{{ p.type }}</p>
                    <p class="mt-0.5 text-[9px] font-bold text-stone-400 opacity-60">库存 {{ p.stock }} | 月销 {{ p.monthlySales }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <span class="text-xl font-black tracking-tighter text-orange-500">¥{{ p.price }}</span>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">{{ p.monthlySales }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.trend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.trend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">{{ p.visitors }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.vTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.vTrend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.vTrend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">¥{{ p.revenue }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.rTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.rTrend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.rTrend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="flex justify-end gap-2 pr-6">
                  <button class="flex flex-col items-center gap-1 rounded-xl p-2 px-3 transition-all hover:bg-white hover:shadow-md">
                    <Settings class="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                    <span class="text-[9px] font-black text-stone-400">编辑</span>
                  </button>
                  <button class="flex flex-col items-center gap-1 rounded-xl p-2 px-3 transition-all hover:bg-white hover:shadow-md">
                    <BarChart4 class="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                    <span class="text-[9px] font-black text-stone-400">数据</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-stone-100 p-8">
        <p class="text-[10px] font-bold uppercase tracking-widest leading-none text-stone-300">共 64 条商品</p>
        <div class="flex items-center gap-2">
          <button
            v-for="(num, i) in [1, 2, 3, 4, 5, '...', 13]"
            :key="i"
            :class="['flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black transition-all', num === 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-stone-300 hover:bg-stone-50 hover:text-stone-600']"
          >
            {{ num }}
          </button>
          <div class="ml-4 flex cursor-pointer items-center gap-2 rounded-xl bg-stone-50 px-4 py-1.5 text-[10px] font-black text-stone-400">
            10 条/页 <ChevronRight class="h-3 w-3 rotate-90" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
