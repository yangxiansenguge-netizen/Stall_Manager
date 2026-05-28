<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import {
  Sun,
  ChevronRight,
  TrendingUp,
  Store,
  Calendar,
  Clock3,
  CircleDollarSign,
  Trophy,
  Activity,
  Plus,
  MapPin
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api';
import stallCartImage from '../../摊位车.png';
import { useLocationStore } from '../stores/location';

const locationStore = useLocationStore();

const props = defineProps<{
  merchantName?: string;
  onNavigateToManagement: () => void;
  onNavigateToStallManagement: () => void;
  onNavigateToPlan: () => void;
  onNavigateToAddProduct: () => void;
}>();

const currentTime = ref(new Date());
let greetingTimer: ReturnType<typeof setInterval> | null = null;

const greetingText = computed(() => {
  const hour = currentTime.value.getHours();
  if (hour >= 6 && hour <= 11) return '早上好';
  if (hour >= 12 && hour <= 17) return '中午好';
  if (hour >= 18 && hour <= 23) return '晚上好';
  return '凌晨好';
});

const merchantNickName = computed(() => {
  const name = (props.merchantName ?? '').trim();
  return name ? `阿${name.slice(-1)}` : '阿掌柜';
});

const dashboardKpis = ref([
  { label: '今日收入', value: '¥ --', icon: CircleDollarSign, color: 'text-amber-600', bg: 'bg-amber-100/50', trend: '--', trendUp: true },
  { label: '售出商品', value: '--', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100/50', trend: '--', trendUp: true },
  { label: '今日订单', value: '--', icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-100/50', trend: '--', trendUp: true, isRank: true },
  { label: '转化率', value: '--', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100/50', trend: '售出件数/订单数', trendUp: true },
]);

const fetchDashboard = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || '';
    const resp = await fetch(buildApiUrl('/api/dashboard/home'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await resp.json();
    if (payload.success && payload.data) {
      const metrics = payload.data.overviewMetrics || [];
      if (metrics.length >= 1) { dashboardKpis.value[0].value = metrics[0].value; dashboardKpis.value[0].trend = metrics[0].trend || '--'; dashboardKpis.value[0].trendUp = metrics[0].trendUp !== false; }
      if (metrics.length >= 2) { dashboardKpis.value[1].value = metrics[1].value; dashboardKpis.value[1].trend = metrics[1].trend || '--'; dashboardKpis.value[1].trendUp = metrics[1].trendUp !== false; }
      if (metrics.length >= 3) { dashboardKpis.value[2].value = metrics[2].value; dashboardKpis.value[2].trend = metrics[2].trend || '--'; dashboardKpis.value[2].trendUp = metrics[2].trendUp !== false; }
      if (metrics.length >= 4) { dashboardKpis.value[3].value = metrics[3].value; dashboardKpis.value[3].trend = metrics[3].trend || '--'; dashboardKpis.value[3].trendUp = metrics[3].trendUp !== false; }
    }
  } catch { /* keep fallback */ }
};

onMounted(() => {
  fetchDashboard();
  greetingTimer = setInterval(() => {
    currentTime.value = new Date();
  }, 30 * 1000);
});

onUnmounted(() => {
  if (greetingTimer) clearInterval(greetingTimer);
});
</script>

<template>
  <div class="space-y-6 md:space-y-8 pb-32 font-sans max-w-[1400px] mx-auto">
    <!-- 顶部：首页问候区重做 -->
    <section class="space-y-3 px-1 sm:px-0">
      <div class="relative overflow-hidden rounded-[1.75rem] border border-amber-100/70 bg-[linear-gradient(135deg,#fff9ef_0%,#fff3d6_100%)] px-4 py-4 shadow-sm sm:px-5 sm:py-5 md:min-h-[220px] md:px-6 md:py-6 lg:px-7">
        <div class="absolute inset-y-0 right-0 w-[52%] bg-[radial-gradient(circle_at_right,rgba(251,191,36,0.18),transparent_68%)]"></div>
        <div class="absolute right-2 top-3 z-0 w-[7.6rem] sm:top-auto sm:bottom-0 sm:w-[10.5rem] md:right-5 md:bottom-0 md:top-auto md:w-[12rem] lg:w-[13rem]">
          <img
            :src="stallCartImage"
            alt="摊位车"
            class="w-full object-contain drop-shadow-[0_18px_28px_rgba(194,132,0,0.22)]"
          />
        </div>
        <div class="relative z-10 w-full space-y-3 text-left md:flex md:max-w-[58%] md:flex-col md:justify-between md:space-y-0 lg:max-w-[56%]">
          <div class="max-w-[58%] space-y-2 sm:max-w-[56%] md:max-w-none">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600/75">黄金营业时段</p>
            <h2 class="flex items-center gap-1.5 text-[1.65rem] font-black leading-none tracking-tight text-stone-900 sm:text-[1.9rem] md:text-[2.35rem]">
              {{ greetingText }}，{{ merchantNickName }} <span class="text-xl sm:text-2xl md:text-[1.9rem]">👋</span>
            </h2>
            <p class="max-w-[10rem] text-[11px] font-medium leading-relaxed text-stone-500 sm:max-w-[12rem] sm:text-xs md:max-w-[18rem] md:text-base">
              抓住黄金时间，开启今天的生意吧！
            </p>
          </div>

          <!-- <div class="grid grid-cols-3 gap-2.5 pt-1 md:gap-3 md:pt-0 lg:max-w-[36rem]">
            <div class="rounded-[1.05rem] border border-white/70 bg-white/72 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm md:rounded-[1.15rem] md:px-3.5 md:py-3 h-full">
              <div class="flex items-center gap-2.5 md:gap-3 h-full">
                <div class="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-amber-400 shadow-lg shadow-amber-400/15 md:h-9 md:w-9 md:rounded-[0.95rem]">
                  <Sun class="h-4 w-4 fill-white text-white md:h-4.5 md:w-4.5" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400 md:text-[10px] md:tracking-[0.14em]">晴朗 26°C</p>
                  <p class="mt-1 text-[13px] font-black leading-none text-stone-900 md:text-[1.05rem]">适合出摊</p>
                </div>
              </div>
            </div>
            <div class="rounded-[1.05rem] border border-white/70 bg-white/72 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm md:rounded-[1.15rem] md:px-3.5 md:py-3 h-full">
              <div class="flex items-center gap-2.5 md:gap-3 h-full">
                <div class="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-amber-400 shadow-lg shadow-amber-400/15 md:h-9 md:w-9 md:rounded-[0.95rem]">
                  <Clock3 class="h-4 w-4 text-white md:h-4.5 md:w-4.5" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400 md:text-[10px] md:tracking-[0.14em]">推荐出摊时段</p>
                  <p class="mt-1 text-[13px] font-black leading-none text-stone-900 md:text-[1.05rem]">17:00 - 22:00</p>
                </div>
              </div>
            </div>
            <div @click="locateMe" class="cursor-pointer rounded-[1.05rem] border border-white/70 bg-white/72 px-3 py-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] backdrop-blur-sm hover:shadow-md transition-all md:rounded-[1.15rem] md:px-3.5 md:py-3 h-full">
              <div class="flex items-center gap-2.5 md:gap-3 h-full">
                <div class="flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-amber-400 shadow-lg shadow-amber-400/15 md:h-9 md:w-9 md:rounded-[0.95rem]">
                  <MapPin class="h-4 w-4 fill-white text-white md:h-4.5 md:w-4.5" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-[9px] font-bold uppercase tracking-[0.12em] text-stone-400 md:text-[10px] md:tracking-[0.14em]">{{ locatingMe ? '定位中...' : '我的位置' }}</p>
                  <p class="mt-1 text-[13px] font-black leading-none text-stone-900 truncate md:text-[1.05rem]">{{ userLocation || '点击定位' }}</p>
                </div>
              </div>
            </div>
          </div> -->
              <div class="mt-3 flex flex-wrap items-center gap-2">
                <!-- 温度 -->
                <div
                  class="flex h-9 items-center gap-1.5 rounded-full
                  border border-stone-100
                  bg-white/85
                  px-3
                  shadow-sm">
              
                  <Sun class="h-3.5 w-3.5 text-amber-500" />
              
                  <span class="text-[13px] font-medium text-stone-700">
                    26°C 适合出摊
                  </span>
                </div>

                <!-- 时间 -->
                <div
                  class="flex h-9 items-center gap-1.5 rounded-full
                  border border-stone-100
                  bg-white/85
                  px-3
                  shadow-sm">
              
                  <Clock3 class="h-3.5 w-3.5 text-amber-500" />
              
                  <span class="text-[13px] font-medium text-stone-700">
                    17:00 - 22:00
                  </span>
              
                  <span
                    class="rounded-full
                    bg-orange-50
                    px-1.5 py-[2px]
                    text-[10px]
                    font-semibold
                    text-orange-600">
              
                    高峰
                  </span>
                </div>

                <!-- 定位 -->
                <div
                  @click="locationStore.locateMe"
                  class="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 shadow-sm transition-all hover:shadow"
                  :class="locationStore.locateFailed
                    ? 'border-red-200/60 bg-red-50/40 hover:bg-red-50'
                    : locationStore.displayAddress
                      ? 'border-emerald-200/60 bg-emerald-50/40 hover:bg-emerald-50'
                      : 'border-amber-200/60 bg-amber-50/40 hover:bg-amber-50'">

                  <MapPin class="h-3.5 w-3.5 shrink-0"
                    :class="locationStore.locatingMe ? 'animate-bounce' : ''"
                    :style="{ color: locationStore.locateFailed ? '#ef4444' : (locationStore.displayAddress ? '#10b981' : '#f59e0b') }" />

                  <span class="max-w-[160px] truncate text-[13px] font-semibold"
                    :class="locationStore.locateFailed ? 'text-red-600' : (locationStore.displayAddress ? 'text-emerald-800' : 'text-amber-700')">
                    {{ locationStore.locatingMe ? '定位中...' : (locationStore.locateFailed ? '定位失败' : (locationStore.displayAddress || '点击定位')) }}
                  </span>
                </div>
           </div>
        </div>
      </div>

      <div class="mx-1 overflow-hidden rounded-[1.6rem] border border-stone-100 bg-white shadow-sm sm:mx-0 sm:rounded-[1.9rem]">
        <div class="relative h-[142px] cursor-pointer group sm:h-[160px] md:h-[186px]">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&h=800&auto=format&fit=crop"
            alt="Creative Handmade Stall"
            class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/72 via-black/28 to-transparent"></div>
          <div class="absolute inset-x-4 bottom-4 space-y-2 text-left sm:inset-x-6 sm:bottom-6">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">今日精选</p>
            <h3 class="max-w-[15rem] text-lg font-black leading-tight tracking-tight text-white sm:max-w-[18rem] sm:text-2xl">
              文化广场 · 创意手工摊位
            </h3>
            <button class="flex items-center gap-1.5 text-[11px] font-bold text-white/90 transition-colors group-hover:text-amber-300 sm:text-sm">
              查看详情 <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 & 4. 经营概览与快捷入口 -->
    <div class="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6">
      <section 
        @click="onNavigateToManagement"
        class="md:col-span-3 lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-stone-100 cursor-pointer hover:shadow-md transition-all group relative overflow-hidden"
      >
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-lg font-black text-stone-900">今日经营概览</h3>
          <span class="text-xs font-bold text-stone-400 flex items-center gap-1 group-hover:text-amber-500 transition-colors">
            查看更多 <ChevronRight class="w-4 h-4" />
          </span>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div v-for="(item, idx) in dashboardKpis" :key="idx" class="space-y-4">
            <div class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-xl', item.bg, 'flex items-center justify-center']">
                <component :is="item.icon" :class="['w-5 h-5', item.color]" />
              </div>
              <p class="text-xs font-bold text-stone-400">{{ item.label }}</p>
            </div>
            <div>
              <p class="text-2xl font-black text-stone-900">{{ item.value }}</p>
              <div :class="['flex items-center gap-0.5 text-[10px] font-bold mt-1', item.trendUp ? 'text-emerald-600' : 'text-rose-600']">
                <TrendingUp v-if="item.trendUp && !item.isRank" class="w-3 h-3" />
                <span v-if="item.isRank" class="mr-0.5">↑</span>
                <span>较昨日 {{ item.trend }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="border border-stone-100 bg-white rounded-[1.85rem] p-5 shadow-sm sm:rounded-[2rem] sm:p-6 md:p-8 md:col-span-2 lg:col-span-1">
        <h3 class="mb-5 text-lg font-black text-stone-900 sm:mb-6">快捷入口</h3>
        <div class="grid grid-cols-3 gap-2 sm:gap-4">
          <button v-for="(item, idx) in [
            { label: '立即入驻', desc: '快速申请新摊位', icon: Store, color: 'text-amber-500', bg: 'bg-amber-50', action: props.onNavigateToStallManagement },
            { label: '手动点单', desc: '进入手动点单台', icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', action: props.onNavigateToPlan },
            { label: '添加商品', desc: '管理商品信息', icon: Plus, color: 'text-indigo-500', bg: 'bg-indigo-50', action: props.onNavigateToAddProduct },


          ]" :key="idx" @click="item.action" class="group flex min-w-0 flex-col items-center gap-2.5 sm:gap-3">
            <div :class="['flex h-12 w-12 items-center justify-center rounded-[1.1rem] transition-all group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-stone-200 sm:h-14 sm:w-14 md:h-16 md:w-16 md:rounded-[1.25rem]', item.bg]">
              <component :is="item.icon" :class="['h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8', item.color]" />
            </div>
            <div class="min-w-0 text-center">
              <p class="text-xs font-bold leading-tight text-stone-900">{{ item.label }}</p>
              <p class="text-[10px] font-medium leading-tight text-stone-400">{{ item.desc }}</p>
            </div>
          </button>
        </div>
      </section>
    </div>

    <!-- 5. 活动Banner -->
    <section class="rounded-[2.5rem] overflow-hidden relative shadow-xl shadow-stone-200 group cursor-pointer">
      <img src="https://picsum.photos/seed/market_night_carnival/1600/400" alt="Carnival Banner" class="w-full h-44 sm:h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
      <div class="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-900/20 to-transparent"></div>
      <div class="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
        <div class="max-w-md space-y-2">
          <h4 class="text-3xl md:text-4xl font-black text-white tracking-widest italic uppercase">夏日夜市狂欢季</h4>
          <p class="text-white/80 font-bold">参与活动赢取更多曝光机会与专属补贴</p>
          <button class="mt-4 px-8 py-2.5 bg-white text-indigo-900 font-black text-sm rounded-full shadow-lg active:scale-95 transition-all">立即参与</button>
        </div>
      </div>
    </section>

    <!-- 周边动态 -->
    <section class="space-y-6">
      <div class="flex items-center justify-between px-1">
        <h4 class="text-sm font-bold text-stone-400 uppercase tracking-[0.2em]">周边动态</h4>
        <button class="text-xs font-bold text-amber-500 flex items-center gap-1 group">查看全部 <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></button>
      </div>
      <div class="flex overflow-x-auto gap-6 no-scrollbar pb-4 px-1">
        <div v-for="(item, i) in [
          { title: '张记柠檬茶 · 排队超过20分钟', sub: '位于您推荐摊位的东侧 50 米', tag: '热门摊位', seed: 'market' },
          { title: '民谣之夜 · 19:30 准时开唱', sub: '预计吸引超过 500 名精准客群', tag: '活动快报', seed: 'concert' },
          { title: '美食节招募 · 最后 10 个名额', sub: '报名截止至本周日，享 8 折优惠', tag: '最新招募', seed: 'foodfest' },
        ]" :key="i" class="flex-none w-72 md:w-80 bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100 space-y-4 hover:shadow-md transition-shadow">
          <div class="w-full h-36 rounded-2xl overflow-hidden relative">
            <img 
              alt="动态" 
              class="w-full h-full object-cover" 
              :src="`https://picsum.photos/seed/${item.seed}/400/200`" 
              referrerPolicy="no-referrer"
            />
            <div class="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-wider">
              {{ item.tag }}
            </div>
          </div>
          <div class="space-y-1">
            <h5 class="font-bold text-base text-stone-900 leading-tight">{{ item.title }}</h5>
            <p class="text-xs text-stone-400 font-medium">{{ item.sub }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 销量排行 -->
    <section class="space-y-4">
      <div class="flex items-center justify-between px-1">
        <h4 class="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">销量排行</h4>
        <span class="rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-bold uppercase text-stone-400">实时更新</span>
      </div>
      <div class="rounded-[1.7rem] border border-stone-50 bg-white p-1.5 shadow-sm sm:rounded-[2rem] sm:p-2">
        <div v-for="(stall, i) in [
          { name: '老王特色烧烤', amount: '¥8,420', rank: 1, seed: 'bbq' },
          { name: '阿强冰镇奶茶', amount: '¥6,150', rank: 2, seed: 'tea' },
          { name: '苏式爆汁生煎', amount: '¥5,890', rank: 3, seed: 'food' },
          { name: '创意手工饰品', amount: '¥4,200', rank: 4, seed: 'art' },
        ]" :key="i" class="group flex items-center gap-3 rounded-[1.35rem] p-3 transition-colors hover:bg-stone-50 sm:gap-4 sm:p-3.5">
          <div :class="[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black italic shadow-sm sm:h-8 sm:w-8 sm:text-sm',
            stall.rank === 1 ? 'bg-amber-400 text-stone-900 ring-2 ring-amber-100' :
            stall.rank === 2 ? 'bg-stone-200 text-stone-900' :
            stall.rank === 3 ? 'bg-orange-100 text-orange-700' :
            'bg-stone-50 text-stone-300'
          ]">
            {{ stall.rank }}
          </div>
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-stone-100 sm:h-11 sm:w-11">
            <img
              :src="`https://picsum.photos/seed/${stall.seed}/100/100`"
              alt="Stall"
              class="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-3">
              <p class="truncate text-sm font-bold tracking-tight text-stone-900">{{ stall.name }}</p>
              <p class="shrink-0 text-sm font-black text-stone-900">{{ stall.amount }}</p>
            </div>
            <div class="mt-1.5 flex items-center justify-between gap-3">
              <div class="h-1.5 w-full max-w-[7.5rem] overflow-hidden rounded-full bg-stone-100 sm:max-w-[9rem]">
                <div
                  class="h-full transition-all duration-1000"
                  :class="stall.rank <= 3 ? 'bg-amber-400' : 'bg-stone-300'"
                  :style="{ width: `${100 - i * 15}%` }"
                />
              </div>
              <div class="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                <TrendingUp class="h-2.5 w-2.5" />
                <span>+3.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>