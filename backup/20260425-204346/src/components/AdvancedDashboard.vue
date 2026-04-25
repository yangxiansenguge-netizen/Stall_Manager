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
  <div class="space-y-8 bg-white rounded-[3rem] p-6 md:p-10 min-h-screen border border-stone-50 shadow-2xl text-left">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
      <div class="flex items-center gap-6 w-full md:w-auto">
        <button @click="emit('back')" class="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-all shrink-0">
          <X class="w-6 h-6" />
        </button>
        <div class="flex flex-col items-start text-left">
          <h2 class="text-3xl font-black text-stone-900 tracking-tight leading-none">智能看板</h2>
          <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Deep Analytics</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <div class="flex-1 md:flex-none">
          <button class="w-full flex items-center justify-between gap-8 px-6 py-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs font-black text-stone-500">
            {{ reportRange }}
            <Clock class="w-4 h-4 text-stone-300" />
          </button>
        </div>
        <button class="flex items-center gap-2 px-6 py-3.5 bg-white border border-stone-100 rounded-2xl text-xs font-black text-stone-900 hover:bg-stone-50 transition-all shadow-sm">
          导出报告 <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 text-left">
      <div v-for="(stat, i) in stats" :key="i" :class="['bg-white p-8 rounded-[3rem] border shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[340px] transition-all', stat.borderColor]">
        <div class="space-y-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-5">
              <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner', stat.bg, stat.color]">
                <component :is="stat.icon" class="w-7 h-7" />
              </div>
              <div class="space-y-1 flex flex-col items-start text-left">
                <div class="flex items-center gap-2">
                  <p class="text-[10px] font-black text-stone-300 uppercase tracking-widest leading-none">{{ stat.label }}</p>
                </div>
                <div class="flex items-baseline gap-2">
                   <h4 class="text-4xl font-black text-stone-900 tracking-tighter">{{ stat.value }}</h4>
                </div>
              </div>
            </div>
            <span class="text-[10px] font-black text-emerald-500 bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-widest leading-none">{{ stat.health }}</span>
          </div>
          <div class="flex items-center gap-2 pl-2">
            <span class="text-[10px] font-bold text-stone-300">较昨日</span>
            <span class="text-[11px] font-black text-emerald-500 flex items-center gap-1">
              <ArrowUp class="w-3 h-3" /> {{ stat.trend.replace('+', '') }}
            </span>
          </div>
        </div>

        <div class="flex-1 w-full mt-4 relative">
          <div class="absolute top-0 right-0 text-[10px] font-bold text-stone-300">
            行业平均 {{ stat.industryAvg }}
          </div>
          <VueApexCharts
            type="area"
            height="180"
            :options="stat.options"
            :series="stat.series"
          />
        </div>
      </div>
    </div>

    <!-- 核心用户画像 -->
    <div class="bg-white rounded-[3rem] p-8 md:p-12 border border-stone-50 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-left">
      <div class="mb-10">
        <h3 class="text-2xl font-black text-stone-900 tracking-tight leading-none">核心用户画像</h3>
        <p class="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-2">Persona Insights</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- Donut Chart -->
        <div class="lg:col-span-4 flex justify-center">
           <div class="w-56 h-56 sm:w-64 sm:h-64 relative">
              <VueApexCharts
                type="donut"
                width="100%"
                :options="personaOptions"
                :series="personaSeries"
              />
           </div>
        </div>

        <!-- Progress Bars -->
        <div class="lg:col-span-4 space-y-8">
           <div v-for="(p, idx) in personaSegments" :key="idx" class="flex items-center gap-4">
              <div class="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                <component :is="p.icon" class="w-5 h-5" />
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex justify-between items-center text-[11px] font-black">
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
        <div class="lg:col-span-4 bg-[#FFFCF5] rounded-[2.5rem] p-7 border-2 border-[#FEF3C7] shadow-inner relative overflow-hidden">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-3 h-3 bg-red-400 rounded-sm flex items-center justify-center">
              <X class="w-2 h-2 text-white" />
            </div>
            <h4 class="text-sm font-black text-stone-700 tracking-tight">洞察发现</h4>
          </div>
          <div class="space-y-4">
             <div v-for="(insight, i) in insightsDiscover" :key="i" class="bg-white p-4 rounded-3xl border border-white shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex items-center gap-4 group hover:shadow-md transition-all">
                <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', insight.bg, insight.color]">
                  <component :is="insight.icon" class="w-6 h-6" />
                </div>
                <div class="text-left">
                  <h5 class="text-xs font-black text-stone-900 leading-none mb-1.5">{{ insight.title }}</h5>
                  <p class="text-[9px] font-bold text-stone-400 leading-tight">{{ insight.sub }}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
