<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudSnow,
  CloudDrizzle,
  ChevronRight,
  TrendingUp,
  Store,
  Calendar,
  Clock3,
  CircleDollarSign,
  Trophy,
  Activity,
  Plus,
  MapPin,
  ArrowUpRight
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api';
import stallCartImage from '../../摊位车.png';
import { useLocationStore } from '../stores/location';
import NearbyMarketCard from '../components/NearbyMarketCard.vue';

const locationStore = useLocationStore();
const weather = ref('26°C 适合出摊');

// 天气文字 → 图标映射
const weatherIcon = shallowRef<any>(Sun);

const updateWeatherIcon = (w: string) => {
  if (w.includes('雷暴')) weatherIcon.value = CloudLightning;
  else if (w.includes('雨') || w.includes('阵雨')) weatherIcon.value = CloudRain;
  else if (w.includes('雪')) weatherIcon.value = CloudSnow;
  else if (w.includes('雾')) weatherIcon.value = CloudFog;
  else if (w.includes('多云')) weatherIcon.value = Cloud;
  else if (w.includes('阴')) weatherIcon.value = Cloud;
  else weatherIcon.value = Sun;
};

const fetchWeather = async () => {
  console.log('[天气] 开始获取...');
  try {
    const token = localStorage.getItem('stall_auth_token') || '';
    const url = buildApiUrl('/api/ai/weather');
    console.log('[天气] 请求:', url);
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const p = await resp.json();
    if (p.success && p.data) { weather.value = p.data; updateWeatherIcon(p.data); }
  } catch { /* keep default */ }
};

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

const bannerSections = ref<Record<string, any[]>>({})

const nearbyMarkets = ref([
  { id: 1, name: '大学城创意夜市', distance: '500m', tag: '今晚热门', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=600' },
  { id: 2, name: '滨江周末集市', distance: '1.2km', tag: '周末限定', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600' },
  { id: 3, name: '老街美食广场', distance: '1.8km', tag: '老牌集市', image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600' },
  { id: 4, name: '花城文创市集', distance: '2.3km', tag: '新开推荐', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600' },
  { id: 5, name: '星河潮流摊区', distance: '3.0km', tag: '🔥 今晚热门', image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=600' },
  { id: 6, name: '学院路跳蚤市场', distance: '3.5km', tag: '学生最爱', image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=600' },
])

const fetchBanners = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/admin/banners/public/active?positions=HOME_HERO,HOME_TREND,HOME_FEATURED'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data) {
      bannerSections.value = p.data
    }
  } catch { /* keep defaults */ }
}

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
  fetchWeather();
  fetchBanners();
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

              <div class="mt-3 flex flex-wrap items-center gap-2">
                <!-- 温度 -->
                <div
                  class="flex h-9 items-center gap-1.5 rounded-full
                  border border-stone-100
                  bg-white/85
                  px-3
                  shadow-sm">
              
                  <component :is="weatherIcon" class="h-3.5 w-3.5 text-amber-500" />
                  <span class="text-[13px] font-medium text-stone-700">{{ weather }}</span>
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

      <div v-if="(bannerSections.HOME_FEATURED || []).length > 0" v-for="b in bannerSections.HOME_FEATURED" :key="b.id" class="mx-1 overflow-hidden rounded-[1.6rem] border border-stone-100 bg-white shadow-sm sm:mx-0 sm:rounded-[1.9rem]">
        <div @click="b.linkUrl && window.open(b.linkUrl)" class="relative h-[142px] cursor-pointer group sm:h-[160px] md:h-[186px]">
          <img
            :src="b.imageUrl || b.image_url"
            :alt="b.title"
            class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-gradient-to-r from-black/72 via-black/28 to-transparent"></div>
          <div class="absolute inset-x-4 bottom-4 space-y-2 text-left sm:inset-x-6 sm:bottom-6">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">今日精选</p>
            <h3 class="max-w-[15rem] text-lg font-black leading-tight tracking-tight text-white sm:max-w-[18rem] sm:text-2xl">
              {{ b.title }}
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
    <section v-if="(bannerSections.HOME_HERO || []).length > 0" v-for="b in bannerSections.HOME_HERO" :key="b.id" @click="b.linkUrl && window.open(b.linkUrl)" class="rounded-[2.5rem] overflow-hidden relative shadow-xl shadow-stone-200 group cursor-pointer">
      <img :src="b.imageUrl || b.image_url" :alt="b.title" class="w-full h-44 sm:h-48 md:h-52 object-cover group-hover:scale-105 transition-transform duration-1000" referrerPolicy="no-referrer" />
      <div class="absolute inset-0 bg-gradient-to-r from-indigo-900/80 via-indigo-900/20 to-transparent"></div>
      <div class="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
        <div class="max-w-md space-y-2">
          <h4 class="text-3xl md:text-4xl font-black text-white tracking-widest italic uppercase">{{ b.title }}</h4>
          <p v-if="b.subtitle" class="text-white/80 font-bold">{{ b.subtitle }}</p>
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
        <div v-for="item in (bannerSections.HOME_TREND || [])" :key="item.id" class="flex-none w-72 md:w-80 bg-white rounded-[2rem] p-5 shadow-sm border border-stone-100 space-y-4 hover:shadow-md transition-shadow">
          <div class="w-full h-36 rounded-2xl overflow-hidden relative">
            <img
              alt="动态"
              class="w-full h-full object-cover"
              :src="item.imageUrl || item.image_url"
              referrerPolicy="no-referrer"
            />
            <div class="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-wider">
              {{ item.tag }}
            </div>
          </div>
          <div class="space-y-1">
            <h5 class="font-bold text-base text-stone-900 leading-tight">{{ item.title }}</h5>
            <p class="text-xs text-stone-400 font-medium">{{ item.subtitle }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 发现附近集市 -->
    <section class="space-y-4 px-1">
      <div class="flex items-end justify-between">
        <div>
          <h4 class="text-lg font-black tracking-tight text-stone-900">发现附近集市</h4>
          <p class="flex items-center gap-1.5 mt-1 text-xs font-semibold text-stone-400">   
          </p>
        </div>
        <button class="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors shrink-0">
          查看地图 <ArrowUpRight class="h-3.5 w-3.5" />
        </button>
      </div>

      <div v-if="nearbyMarkets.length > 0" class="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
        <NearbyMarketCard
          v-for="(market, i) in nearbyMarkets"
          :key="market.id"
          :market="market"
          :index="i"
        />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-14 text-center">
        <div class="text-5xl mb-3">🗺️</div>
        <p class="text-sm font-bold text-stone-400">附近暂无可推荐集市</p>
        <p class="mt-1 text-xs text-stone-400">切换位置或等待新的集市开放</p>
      </div>
    </section>
  </div>
</template>