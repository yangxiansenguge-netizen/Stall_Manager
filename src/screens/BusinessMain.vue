<script setup lang="ts">
import { ref } from 'vue';
import {
  ShoppingBag,
  Clock,
  Filter,
  ArrowUp,
  ArrowDown,
  Activity,
  Lightbulb,
  Bot,
  ChevronRight,
  Trophy,
  BadgeDollarSign
} from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';
import robotImage from '../../机器人.png';
import lemonTeaImage from '../assets/lemon-tea.svg';
import berrySodaImage from '../assets/berry-soda.svg';
import milkTeaImage from '../assets/milk-tea.svg';
import coconutDrinkImage from '../assets/coconut-drink.svg';
import coconutLatteImage from '../assets/coconut-latte.svg';

const timeRange = ref<'today' | 'week' | 'month'>('today');

const hourlyData = [
  { time: '08:00', revenue: 120, traffic: 400 },
  { time: '10:00', revenue: 350, traffic: 800 },
  { time: '12:00', revenue: 1100, traffic: 2200 },
  { time: '14:00', revenue: 800, traffic: 1500 },
  { time: '16:00', revenue: 600, traffic: 1200 },
  { time: '18:00', revenue: 2100, traffic: 4500 },
  { time: '20:00', revenue: 4200, traffic: 8000 },
  { time: '22:00', revenue: 1800, traffic: 3200 },
];

const revenueSeries = [{
  name: '收入',
  data: hourlyData.map(d => d.revenue)
}];

const trafficSeries = [{
  name: '客流',
  data: hourlyData.map(d => d.traffic)
}];

const revenueChartOptions = {
  chart: {
    id: 'revenue-chart',
    toolbar: { show: false },
    sparkline: { enabled: false },
    fontFamily: 'Inter, sans-serif'
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    colors: ['#f97316']
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [50, 100],
      colorStops: [
        { offset: 0, color: '#f97316', opacity: 0.4 },
        { offset: 100, color: '#f97316', opacity: 0 }
      ]
    }
  },
  xaxis: {
    categories: hourlyData.map(d => d.time),
    labels: { style: { colors: '#A8A29E', fontSize: '10px', fontWeight: 900 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#A8A29E', fontSize: '10px', fontWeight: 900 } }
  },
  grid: {
    borderColor: '#F1F5F9',
    strokeDashArray: 4,
    xaxis: { lines: { show: false } }
  },
  tooltip: {
    theme: 'light',
    x: { show: true },
    y: { formatter: (val: number) => `¥${val}` }
  },
  colors: ['#f97316']
};

const trafficChartOptions = {
  chart: {
    id: 'traffic-chart',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif'
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
      distributed: true
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: hourlyData.map(d => d.time),
    labels: { style: { colors: '#A8A29E', fontSize: '10px', fontWeight: 900 } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#A8A29E', fontSize: '10px', fontWeight: 900 } }
  },
  grid: {
    borderColor: '#F1F5F9',
    strokeDashArray: 4,
  },
  legend: { show: false },
  colors: hourlyData.map(d => d.time === '20:00' ? '#f97316' : '#818cf8')
};

const topProducts = [
  { name: '招牌手打柠檬茶', sales: 142, revenue: 2556, ctr: '8.4%', trend: '+12%', img: lemonTeaImage },
  { name: '爆捶草莓野山蓝', sales: 98, revenue: 1960, ctr: '6.2%', trend: '+8%', img: berrySodaImage },
  { name: '经典港式奶茶', sales: 86, revenue: 1376, ctr: '5.1%', trend: '-2%', img: milkTeaImage },
  { name: '泰式椰奶冰', sales: 74, revenue: 1628, ctr: '7.5%', trend: '+24%', img: coconutDrinkImage },
  { name: '生椰拿铁', sales: 62, revenue: 1240, ctr: '4.8%', trend: '+5%', img: coconutLatteImage },
];

const kpis = [
  { title: '预计收入', value: '¥1,280', icon: BadgeDollarSign, color: 'text-orange-500', cardBg: 'from-orange-50 to-white', trend: '+12.5%', chartColor: '#f97316', points: '0,40 10,25 20,35 30,15 40,20 50,5' },
  { title: '售出商品', value: '148', icon: ShoppingBag, color: 'text-indigo-500', cardBg: 'from-indigo-50 to-white', trend: '+8.3%', chartColor: '#6366f1', points: '0,35 10,30 20,40 30,25 40,35 50,15' },
  { title: '曝光量', value: '2,560', icon: Trophy, color: 'text-blue-500', cardBg: 'from-blue-50 to-white', trend: '+6.1%', chartColor: '#3b82f6', points: '0,25 10,35 20,20 30,30 40,15 50,25' },
  { title: '转化率', value: '18.5%', icon: Activity, color: 'text-fuchsia-500', cardBg: 'from-fuchsia-50 to-white', trend: '-2.6%', chartColor: '#ef4444', points: '0,15 10,20 20,10 30,25 40,20 50,30' },
];
</script>

<template>
  <div class="space-y-4 text-left sm:space-y-6">
    <!-- KPI 概览 -->
    <section class="grid grid-cols-4 gap-1 sm:gap-3 lg:gap-4">
      <article
        v-for="(kpi, i) in kpis"
        :key="i"
        class="group relative overflow-hidden rounded-[0.95rem] border border-white/80 bg-white p-2 shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)] sm:rounded-[1.5rem] sm:p-4 lg:rounded-[1.65rem]"
      >
        <div :class="['absolute inset-0 bg-gradient-to-br opacity-90', kpi.cardBg]"></div>
        <div class="absolute inset-x-0 bottom-0 h-10 opacity-30 transition-opacity group-hover:opacity-50 sm:h-20">
          <svg viewBox="0 0 50 40" class="h-full w-full">
            <polyline
              fill="none"
              :stroke="kpi.chartColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="kpi.points"
            />
          </svg>
        </div>

        <div class="relative z-10 flex h-full min-h-[4.8rem] flex-col justify-start gap-1.5 sm:min-h-[9.8rem] sm:justify-between sm:gap-0">
          <div class="flex items-start justify-between gap-1">
            <div :class="['flex h-6 w-6 items-center justify-center rounded-[0.75rem] shadow-inner sm:h-10 sm:w-10 sm:rounded-[0.95rem]', kpi.color.replace('text-', 'bg-').replace('500', '50'), kpi.color]">
              <component :is="kpi.icon" class="h-3 w-3 sm:h-5 sm:w-5" />
            </div>
            <div :class="['inline-flex items-center gap-0.5 rounded-full px-1 py-0.5 text-[6px] font-black sm:px-2 sm:py-1 sm:text-[9px]', kpi.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600']">
              <ArrowUp v-if="kpi.trend.startsWith('+')" class="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
              <ArrowDown v-else class="h-1.5 w-1.5 sm:h-2.5 sm:w-2.5" />
              {{ kpi.trend.replace('+', '').replace('-', '') }}
            </div>
          </div>

          <div class="space-y-0 text-left">
            <p class="text-[7px] font-bold leading-tight tracking-tight text-stone-400 sm:text-[10px]">{{ kpi.title }}</p>
            <h3 class="text-[0.9rem] font-black leading-none tracking-tight text-stone-900 sm:text-[1.7rem]">{{ kpi.value }}</h3>
            <p class="text-[6px] font-bold text-stone-400 sm:text-[9px]">较昨日 <span :class="kpi.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'">{{ kpi.trend }}</span></p>
          </div>
        </div>
      </article>
    </section>

    <!-- 收入趋势 -->
    <section class="overflow-hidden rounded-[1.7rem] border border-stone-100 bg-white p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:rounded-[2.3rem] sm:p-5 md:p-6">
      <div class="mb-3 flex flex-col gap-3 sm:mb-5 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1 text-left">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-black tracking-tight text-stone-900 sm:text-xl">收入趋势分析</h3>
            <span class="rounded-full bg-stone-100 px-2 py-0.5 text-[8px] font-black text-stone-400 sm:text-[9px]">●</span>
          </div>
          <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-[10px]">Revenue Forecast</p>
        </div>

        <div class="flex w-full items-center gap-1 rounded-[1.15rem] bg-stone-50 p-1 sm:w-auto sm:rounded-2xl">
          <button
            v-for="range in (['today', 'week', 'month'] as const)"
            :key="range"
            @click="timeRange = range"
            :class="['flex-1 rounded-[0.9rem] px-2.5 py-2 text-[10px] font-black transition-all sm:flex-none sm:px-4', timeRange === range ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-stone-400 hover:text-stone-900']"
          >
            {{ range === 'today' ? '今日' : range === 'week' ? '本周' : '本月' }}
          </button>
        </div>
      </div>

      <div class="h-[220px] w-full sm:h-[285px]">
        <VueApexCharts
          type="area"
          height="100%"
          :options="revenueChartOptions"
          :series="revenueSeries"
        />
      </div>
    </section>

    <!-- AI 建议 + 机器人 -->
    <section class="relative overflow-hidden rounded-[1.7rem] border border-stone-100 bg-white p-3.5 pb-14 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:rounded-[2.3rem] sm:p-5 sm:pb-5 md:p-6">
      <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,rgba(251,146,60,0.16),transparent_62%)]"></div>
      <div class="absolute bottom-2 right-2 h-20 w-20 rounded-full bg-orange-100/80 blur-2xl sm:bottom-4 sm:right-4 sm:h-28 sm:w-28"></div>
      <img
        :src="robotImage"
        alt="AI 机器人"
        class="pointer-events-none absolute bottom-0 right-0 z-0 w-24 opacity-100 drop-shadow-[0_20px_30px_rgba(249,115,22,0.3)] sm:w-28 md:right-4 md:w-36 lg:w-40"
      />

      <div class="relative z-10 max-w-[calc(100%-4.75rem)] space-y-2.5 sm:max-w-[calc(100%-6.5rem)] sm:space-y-3 lg:max-w-[calc(100%-8rem)]">
        <div class="flex items-start justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-[0.95rem] bg-orange-50 text-orange-500 sm:h-10 sm:w-10 sm:rounded-2xl">
              <Bot class="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 class="text-[15px] font-black tracking-tight text-stone-900 sm:text-lg">AI 经营建议</h4>
              <p class="text-[8px] font-bold uppercase tracking-[0.16em] text-stone-400 sm:text-[10px]">智能经营助手</p>
            </div>
          </div>
          <span class="rounded-full bg-indigo-50 px-2 py-1 text-[8px] font-black text-indigo-500 sm:px-2.5 sm:text-[10px]">AI 推荐</span>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
          <article class="rounded-[1rem] border border-stone-100 bg-stone-50/80 p-2.5 shadow-sm sm:rounded-[1.25rem] sm:p-3">
            <div class="flex items-start gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-white text-orange-500 shadow-sm sm:h-9 sm:w-9 sm:rounded-[1rem]">
                <Clock class="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div class="min-w-0 space-y-1 text-left">
                <p class="text-[8px] font-bold uppercase tracking-[0.14em] text-stone-400 sm:text-[9px]">最佳营业时段</p>
                <h5 class="text-[13px] font-black leading-tight text-stone-900 sm:text-sm">15:00 - 21:00</h5>
                <p class="text-[9px] font-bold leading-snug text-stone-400 sm:text-[10px]">建议主推套餐与第二杯半价活动。</p>
              </div>
            </div>
          </article>

          <article class="rounded-[1rem] border border-stone-100 bg-stone-50/80 p-2.5 shadow-sm sm:rounded-[1.25rem] sm:p-3">
            <div class="flex items-start gap-2.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-white text-amber-500 shadow-sm sm:h-9 sm:w-9 sm:rounded-[1rem]">
                <Lightbulb class="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div class="min-w-0 space-y-1 text-left">
                <p class="text-[8px] font-bold uppercase tracking-[0.14em] text-stone-400 sm:text-[9px]">推荐动作</p>
                <h5 class="text-[13px] font-black leading-tight text-stone-900 sm:text-sm">提升高客单曝光</h5>
                <p class="text-[9px] font-bold leading-snug text-stone-400 sm:text-[10px]">爆款饮品前置，可提升傍晚转化。</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 热销 TOP 5 -->
    <section class="overflow-hidden rounded-[1.7rem] border border-stone-100 bg-white p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:rounded-[2.3rem] sm:p-5 md:p-6">
      <div class="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-[1rem] bg-amber-50 text-amber-500 sm:h-9 sm:w-9 sm:rounded-2xl">
            <Trophy class="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div>
            <h4 class="text-base font-black tracking-tight text-stone-900 sm:text-lg">热销单品 TOP 5</h4>
            <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-[10px]">热度实时更新</p>
          </div>
        </div>
        <button class="hidden items-center gap-1 text-[10px] font-black text-stone-400 transition-colors hover:text-orange-500 sm:flex">
          查看更多 <ChevronRight class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="space-y-2.5 sm:space-y-3">
        <article
          v-for="(product, i) in topProducts"
          :key="product.name"
          class="group flex items-start gap-2.5 rounded-[1.2rem] border border-stone-100 bg-white p-2.5 transition-all hover:border-orange-100 hover:bg-orange-50/20 sm:items-center sm:gap-4 sm:rounded-[1.35rem] sm:p-4"
        >
          <div :class="['mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow-sm sm:mt-0 sm:h-7 sm:w-7 sm:text-[11px]', i === 0 ? 'bg-orange-400 text-white' : i === 1 ? 'bg-stone-200 text-stone-700' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-stone-50 text-stone-400']">
            {{ i + 1 }}
          </div>
          <div class="h-11 w-11 shrink-0 overflow-hidden rounded-[0.9rem] border border-stone-100 bg-stone-100 sm:h-14 sm:w-14 sm:rounded-xl">
            <img :src="product.img" class="h-full w-full object-cover" :alt="product.name" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h5 class="truncate text-[13px] font-black text-stone-900 sm:text-base">{{ product.name }}</h5>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold text-stone-400 sm:text-[10px]">
                  <span>销量 {{ product.sales }}</span>
                  <span>CTR {{ product.ctr }}</span>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-[13px] font-black text-stone-900 sm:text-base">¥{{ product.revenue }}</p>
                <span :class="['mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-black', product.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600']">
                  {{ product.trend }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 分时客流 -->
    <section class="overflow-hidden rounded-[1.7rem] border border-stone-100 bg-white p-3.5 shadow-[0_18px_45px_rgba(0,0,0,0.04)] sm:rounded-[2.3rem] sm:p-5 md:p-6">
      <div class="mb-3 flex items-center justify-between gap-3 sm:mb-4">
        <div>
          <h3 class="text-base font-black tracking-tight text-stone-900 sm:text-xl">分时段客流分布</h3>
          <p class="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-stone-400 sm:text-[10px]">Traffic Analysis</p>
        </div>
        <div class="flex h-9 w-9 items-center justify-center rounded-[1rem] bg-stone-50 text-stone-300 sm:h-10 sm:w-10 sm:rounded-2xl">
          <Filter class="h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
      </div>
      <div class="h-[205px] w-full sm:h-64">
        <VueApexCharts
          type="bar"
          height="100%"
          :options="trafficChartOptions"
          :series="trafficSeries"
        />
      </div>
    </section>
  </div>
</template>
