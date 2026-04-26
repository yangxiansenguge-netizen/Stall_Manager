<script setup lang="ts">
import { 
  X, 
  Clock, 
  ChevronRight, 
  Activity, 
  Users, 
  ArrowUp, 
  Layout, 
  TrendingUp, 
  Sparkles,
  User,
  Home,
  Briefcase
} from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';
import { ref } from 'vue';

const emit = defineEmits(['back']);
const reportRange = ref('今日数据');

const stats = [
  { 
    label: '成交转化率', 
    value: '8.42%', 
    trend: '+12.4%', 
    health: '健康度 优', 
    industryAvg: '5.1%', 
    icon: Activity, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50',
    borderColor: 'border-amber-100/50',
    chartId: 'conversion-rate',
    series: [{
      name: '转化率',
      data: [2, 2.5, 4, 8.42, 6, 12, 8]
    }],
    options: {
      chart: { sparkline: { enabled: true }, animations: { enabled: true } },
      stroke: { curve: 'smooth', width: 4, colors: ['#f59e0b'] },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 100], colorStops: [{ offset: 0, color: '#f59e0b', opacity: 0.3 }, { offset: 100, color: '#f59e0b', opacity: 0 }] }
      },
      markers: { size: [0, 0, 0, 6, 0, 0, 0], colors: ['#f59e0b'], strokeColors: '#fff', strokeWidth: 2 },
      tooltip: { theme: 'light', x: { show: false }, y: { formatter: (val: number) => `${val}%` } }
    }
  },
  { 
    label: '客流转化率', 
    value: '24.5%', 
    trend: '+8.7%', 
    health: '健康度 优', 
    industryAvg: '12.4%', 
    icon: Users, 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-50',
    borderColor: 'border-indigo-100/50',
    chartId: 'traffic-conversion',
    series: [{
      name: '转化率',
      data: [10, 8, 15, 24.5, 20, 32, 25]
    }],
    options: {
      chart: { sparkline: { enabled: true }, animations: { enabled: true } },
      stroke: { curve: 'smooth', width: 4, colors: ['#6366f1'] },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 100], colorStops: [{ offset: 0, color: '#6366f1', opacity: 0.3 }, { offset: 100, color: '#6366f1', opacity: 0 }] }
      },
      markers: { size: [0, 0, 0, 6, 0, 0, 0], colors: ['#6366f1'], strokeColors: '#fff', strokeWidth: 2 },
      tooltip: { theme: 'light', x: { show: false }, y: { formatter: (val: number) => `${val}%` } }
    }
  }
];

const personaOptions = {
  chart: { type: 'donut', fontFamily: 'Inter, sans-serif' },
  labels: ['学生群体', '上班白领', '周边居民', '自由职业'],
  colors: ['#6366f1', '#f97316', '#10b981', '#cbd5e1'],
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: { show: true, fontSize: '10px', color: '#A8A29E', fontWeight: 700, offsetY: -10 },
          value: { show: true, fontSize: '24px', fontWeight: 900, color: '#1C1917', offsetY: 8 },
          total: { shadow: false, show: true, label: '总访客数', formatter: () => '1.2k' }
        }
      }
    }
  },
  legend: { show: false },
  stroke: { width: 4, colors: ['#fff'] },
  dataLabels: { enabled: false }
};

const personaSeries = [45, 30, 15, 10];

const personaSegments = [
  { name: '学生群体 (18-24)', value: 45, icon: Users, color: 'bg-[#6366f1]' },
  { name: '上班白领 (25-35)', value: 30, icon: Briefcase, color: 'bg-[#f97316]' },
  { name: '周边居民 (35+)', value: 15, icon: Home, color: 'bg-[#10b981]' },
  { name: '自由职业', value: 10, icon: Activity, color: 'bg-[#cbd5e1]' },
];

const insightsDiscover = [
  { title: '学生群体占...', sub: '建议推出更多平价套餐', icon: Layout, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { title: '上班族转化...', sub: '可尝试午餐时段促销活动', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: '周末客流增...', sub: '建议增加周末备货量', icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];
</script>

<template>
  <div class="space-y-5 md:space-y-8 bg-white rounded-[2rem] md:rounded-[3rem] p-4 sm:p-5 md:p-10 min-h-screen border border-stone-50 shadow-2xl text-left">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 pb-1 md:pb-2">
      <div class="flex items-center gap-4 md:gap-6 w-full md:w-auto">
        <button @click="emit('back')" class="w-11 h-11 md:w-14 md:h-14 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0">
          <X class="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <div class="flex flex-col items-start text-left">
          <h2 class="text-2xl md:text-3xl font-black text-stone-900 tracking-tight leading-none">智能看板</h2>
          <p class="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Deep Analytics</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2 md:gap-3 w-full md:w-auto">
        <div class="flex-1 md:flex-none">
          <button class="w-full flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-2.5 md:py-3.5 bg-stone-50 rounded-xl md:rounded-2xl border border-stone-100 text-[11px] md:text-xs font-black text-stone-500">
            {{ reportRange }}
            <Clock class="w-3.5 h-3.5 md:w-4 md:h-4 text-stone-300" />
          </button>
        </div>
        <button class="flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3.5 bg-white border border-stone-100 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black text-stone-900 hover:bg-stone-50 transition-all shadow-sm whitespace-nowrap">
          导出报告 <ChevronRight class="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-2 md:mt-4 text-left">
      <div v-for="(stat, i) in stats" :key="i" :class="['bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] border shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[260px] sm:h-[290px] lg:h-[340px] transition-all', stat.borderColor]">
        <div class="space-y-4 md:space-y-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3 md:gap-5">
              <div :class="['w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner', stat.bg, stat.color]">
                <component :is="stat.icon" class="w-5 h-5 md:w-7 md:h-7" />
              </div>
              <div class="space-y-1 flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <p class="text-[9px] md:text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none">{{ stat.label }}</p>
                </div>
                <div class="flex items-baseline gap-2">
                   <h4 class="text-3xl md:text-4xl font-black text-stone-900 tracking-tighter">{{ stat.value }}</h4>
                </div>
              </div>
            </div>
            <span class="text-[9px] md:text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-widest leading-none">{{ stat.health }}</span>
          </div>
          <div class="flex items-center gap-2 pl-1 md:pl-2">
            <span class="text-[9px] md:text-[10px] font-bold text-stone-300">较昨日</span>
            <span class="text-[10px] md:text-[11px] font-black text-emerald-500 flex items-center gap-1">
              <ArrowUp class="w-2.5 h-2.5 md:w-3 md:h-3" /> {{ stat.trend.replace('+', '') }}
            </span>
          </div>
        </div>

        <div class="flex-1 w-full mt-2 md:mt-4 relative">
          <div class="absolute top-0 right-0 text-[9px] md:text-[10px] font-bold text-stone-300">
            行业平均 {{ stat.industryAvg }}
          </div>
          <VueApexCharts
            type="area"
            height="130"
            :options="stat.options"
            :series="stat.series"
          />
        </div>
      </div>
    </div>

    <!-- 核心用户画像 -->
    <div class="bg-white rounded-[2rem] md:rounded-[3rem] p-5 md:p-12 border border-stone-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-left">
      <div class="mb-6 md:mb-10">
        <h3 class="text-xl md:text-2xl font-black text-stone-900 tracking-tight leading-none">核心用户画像</h3>
        <p class="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-2">Persona Insights</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-10 items-center">
        <!-- Donut Chart -->
        <div class="lg:col-span-4 flex justify-center">
           <div class="w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 relative">
              <VueApexCharts
                type="donut"
                width="100%"
                :options="personaOptions"
                :series="personaSeries"
              />
           </div>
        </div>

        <!-- Progress Bars -->
        <div class="lg:col-span-4 space-y-5 md:space-y-8">
           <div v-for="(p, idx) in personaSegments" :key="idx" class="flex items-center gap-3 md:gap-4">
              <div class="w-9 h-9 md:w-10 md:h-10 bg-stone-50 rounded-lg md:rounded-xl flex items-center justify-center text-stone-400">
                <component :is="p.icon" class="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div class="flex-1 space-y-1.5 md:space-y-2">
                <div class="flex justify-between items-center text-[10px] md:text-[11px] font-black">
                  <span class="text-stone-500">{{ p.name }}</span>
                  <span class="text-stone-900">{{ p.value }}%</span>
                </div>
                <div class="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                   <div :class="['h-full rounded-full transition-all duration-1000', p.color]" :style="{ width: `${p.value}%` }"></div>
                </div>
              </div>
           </div>
        </div>

        <!-- Sidebar Discovery -->
        <div class="lg:col-span-4 bg-[#FFFCF5] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-7 border-2 border-[#FEF3C7] shadow-inner relative overflow-hidden">
          <div class="flex items-center gap-2 mb-4 md:mb-6">
            <div class="w-3 h-3 bg-red-400 rounded-sm flex items-center justify-center">
              <X class="w-2 h-2 text-white" />
            </div>
            <h4 class="text-xs md:text-sm font-black text-stone-700 tracking-tight">洞察发现</h4>
          </div>
          <div class="space-y-3 md:space-y-4">
             <div v-for="(insight, i) in insightsDiscover" :key="i" class="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center gap-3 md:gap-4 group hover:shadow-md transition-all">
                <div :class="['w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm', insight.bg, insight.color]">
                  <component :is="insight.icon" class="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div class="text-left">
                  <h5 class="text-[11px] md:text-xs font-black text-stone-900 leading-none mb-1">{{ insight.title }}</h5>
                  <p class="text-[8px] md:text-[9px] font-bold text-stone-400 leading-tight">{{ insight.sub }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
