<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { 
  ArrowUpRight,
  Search,
  Plus, 
  MapPin, 
  Flame,
  ChevronRight, 
  Clock,
  TrendingUp,
  Sparkles,
  Store,
  X,
  Send,
  Navigation,
  Brain,
  Target,
  Zap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Map as MapIcon
} from 'lucide-vue-next';

const userStatus = ref<'none' | 'pending' | 'active'>('none');
const showApplyModal = ref(false);
const searchQuery = ref('');

const hotAreas = [
  { title: '文化广场夜市', heat: '9.8', distance: '1.2km', img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=400&auto=format&fit=crop' },
  { title: '滨江创意街区', heat: '9.5', distance: '2.5km', img: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=400&auto=format&fit=crop' },
  { title: '老街美食巷', heat: '9.2', distance: '0.8km', img: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?q=80&w=400&auto=format&fit=crop' },
];

const MOBILE_MODAL_BASE_WIDTH = 375;
const MOBILE_MODAL_BASE_HEIGHT = 760;
const MOBILE_MODAL_GUTTER_X = 16;
const MOBILE_MODAL_GUTTER_Y = 20;

const viewportWidth = ref(390);
const viewportHeight = ref(844);

const updateViewport = () => {
  if (typeof window === 'undefined') return;

  viewportWidth.value = window.innerWidth;
  viewportHeight.value = window.innerHeight;
};

const isMobileViewport = computed(() => viewportWidth.value < 640);

const mobileModalScale = computed(() => {
  if (!isMobileViewport.value) return 1;

  const widthScale = (viewportWidth.value - MOBILE_MODAL_GUTTER_X) / MOBILE_MODAL_BASE_WIDTH;
  const heightScale = (viewportHeight.value - MOBILE_MODAL_GUTTER_Y) / MOBILE_MODAL_BASE_HEIGHT;

  return Math.min(widthScale, heightScale, 1);
});

const mobileModalViewportStyle = computed(() => {
  if (!isMobileViewport.value) return {};

  return {
    width: `${Math.round(MOBILE_MODAL_BASE_WIDTH * mobileModalScale.value)}px`,
    height: `${Math.round(MOBILE_MODAL_BASE_HEIGHT * mobileModalScale.value)}px`
  };
});

const mobileModalCardStyle = computed(() => {
  if (!isMobileViewport.value) return {};

  return {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: `${MOBILE_MODAL_BASE_WIDTH}px`,
    height: `${MOBILE_MODAL_BASE_HEIGHT}px`,
    transform: `translate(-50%, -50%) scale(${mobileModalScale.value})`,
    transformOrigin: 'center center'
  };
});

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport);
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateViewport);
  }
});

const handleApply = () => {
  showApplyModal.value = true;
  updateViewport();
};

const submitApply = () => {
  userStatus.value = 'pending';
  showApplyModal.value = false;
};
</script>

<template>
  <div class="relative mx-auto min-h-screen w-full overflow-x-hidden overscroll-x-none bg-[#F9F9F9] pb-32 pt-1 text-center space-y-6 sm:space-y-8 sm:pt-2 sm:text-left">
    <!-- 1. 核心主卡片 -->
    <section class="relative px-1 sm:px-2">
      <div class="absolute -top-12 -left-12 h-48 w-48 -z-10 animate-pulse rounded-full bg-orange-200/20 blur-3xl"></div>
      <div class="absolute -bottom-24 -right-12 h-64 w-64 -z-10 rounded-full bg-indigo-200/10 blur-3xl"></div>

      <div 
        @click="handleApply"
        class="group relative overflow-hidden rounded-[2.2rem] border border-stone-50 bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <div class="z-10 grid gap-4 p-5 sm:p-6 md:p-8">
          <div class="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-start sm:text-left">
            <div class="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Current Opportunities</span>
            <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-500">空余 23 处</span>
          </div>

          <div class="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:items-start">
            <div class="space-y-3 text-center sm:text-left">
              <h2 class="text-[2rem] font-black leading-[0.92] tracking-tighter text-stone-900 sm:text-[2.35rem] md:text-5xl">
                开启你的
                <span class="block text-orange-500">烟火气生意</span>
              </h2>
              <p class="mx-auto max-w-md text-sm font-medium leading-relaxed text-stone-500 sm:mx-0">
                在热门商圈里更快找到可申请摊位、查看推荐区域，并直接进入入驻申请。
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <div class="rounded-[1.4rem] border border-orange-100 bg-orange-50/80 p-3 text-center sm:text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-orange-500">黄金时段</p>
                <p class="mt-1 text-sm font-black text-stone-900">17:00 - 22:00</p>
              </div>
              <div class="rounded-[1.4rem] border border-stone-100 bg-stone-50 p-3 text-center sm:text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-stone-400">热门商圈</p>
                <p class="mt-1 text-sm font-black text-stone-900">文化广场</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button class="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-stone-900/10 transition-all active:scale-95 sm:w-auto">
              立即申请入驻
              <ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <div class="grid w-full max-w-xs grid-cols-2 gap-2 sm:w-auto sm:min-w-[12rem]">
              <div class="rounded-2xl border border-stone-100 bg-white px-3 py-2 text-center shadow-sm sm:text-left">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">通过率</p>
                <p class="mt-1 text-sm font-black text-stone-900">92%</p>
              </div>
              <div class="rounded-2xl border border-stone-100 bg-white px-3 py-2 text-center shadow-sm sm:text-left">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">步行距离</p>
                <p class="mt-1 text-sm font-black text-stone-900">1.2km</p>
              </div>
            </div>
          </div>
        </div>

        <div class="relative grid min-h-[220px] grid-rows-[minmax(0,1fr)_auto] overflow-hidden border-t border-stone-100 lg:min-h-full lg:border-l lg:border-t-0">
          <div class="relative overflow-hidden">
            <div class="absolute inset-0 z-10 bg-gradient-to-t from-stone-950/45 via-stone-900/5 to-transparent"></div>
            <img 
              src="https://images.unsplash.com/photo-1505843513577-22bb7d21e455?q=80&w=1200&auto=format&fit=crop" 
              alt="Night Market" 
              class="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            <div class="absolute left-4 top-4 z-20 rounded-full border border-white/60 bg-white/88 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-stone-900 backdrop-blur-md">
              热门推荐区
            </div>
          </div>
          <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center justify-center gap-3 border-t border-stone-100 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-5">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Flame class="h-5 w-5" />
            </div>
            <div class="min-w-0 text-center sm:text-left">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-400">推荐区域</p>
              <p class="truncate text-sm font-black text-stone-900">文化广场·夜市区</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. AI 智能经营助手 -->
    <section class="px-1">
      <div class="relative overflow-hidden rounded-[2.5rem] border border-stone-50 bg-white p-8 text-center shadow-[0_10px_20px_rgba(0,0,0,0.05)] sm:text-left">
        <div class="pointer-events-none absolute inset-0 opacity-[0.03]" style="background-image: radial-gradient(#6366f1 1px, transparent 1px); background-size: 16px 16px;"></div>
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-50 blur-[80px] -z-10"></div>
        
        <div class="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
          <div class="flex-1 space-y-6">
            <div class="flex items-center justify-center gap-3 lg:justify-start">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-200">
                <Brain class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-black leading-none tracking-tight text-stone-900">AI 智能经营规划</h3>
                <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Master Sales Strategy Assistant</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="mx-auto flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 sm:mx-0">
                <span class="relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                  <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
                </span>
                <span class="text-[9px] font-black uppercase tracking-widest text-indigo-600">AI 正在根据实时人流深度分析中...</span>
              </div>
              
              <p class="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-stone-500 sm:mx-0">
                基于周边 3km 实时活跃度，AI 已初步构建 <span class="font-black text-indigo-600">今日致富蓝图</span>。接入后将为您提供精准的单品配比建议与话术方案。
              </p>
              
              <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div v-for="(item, idx) in [
                  { label: '核心类目', value: '潮玩模型', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { label: '预计流水', value: '¥1,500+', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: '黄金时段', value: '19:30', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: '转化预估', value: '8.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ]" :key="idx" class="rounded-[1.35rem] border border-stone-100/50 bg-stone-50/60 p-3.5 text-center transition-all hover:bg-white hover:shadow-md sm:rounded-3xl sm:p-4">
                  <div :class="['mb-2 flex h-8 w-8 items-center justify-center rounded-xl', item.bg, item.color, 'mx-auto']">
                    <component :is="item.icon" class="w-4 h-4" />
                  </div>
                  <p class="text-[9px] font-black uppercase tracking-widest text-stone-400">{{ item.label }}</p>
                  <p class="text-sm font-black text-stone-900">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="w-full shrink-0 self-center lg:w-48 lg:self-auto">
             <button class="group flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-indigo-50 py-3.5 text-sm font-black text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white sm:rounded-3xl sm:py-4">
                启动AI分析
                <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
             </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. 探索更多潜力区域 -->
    <section class="space-y-4 pt-2">
      <div class="flex flex-col items-center justify-center gap-3 px-1 sm:flex-row sm:justify-between">
        <div class="flex items-center justify-center gap-2.5">
          <div class="h-5 w-1 rounded-full bg-orange-500"></div>
          <h4 class="text-lg font-black tracking-tight text-stone-900">发现城市盲盒</h4>
        </div>
        <div class="group flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-stone-400 cursor-pointer transition-colors hover:text-orange-500">
          查看更多 <ChevronRight class="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 px-1 md:grid-cols-2">
        <div
          v-for="(area, i) in hotAreas.slice(0, 2)"
          :key="i"
          class="group flex h-32 cursor-pointer overflow-hidden rounded-[1.9rem] border border-stone-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:h-36 sm:rounded-[2.2rem]"
        >
          <div class="relative h-full w-2/5 overflow-hidden">
            <img :src="area.img" :alt="area.title" class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent"></div>
          </div>
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 text-center sm:p-5 sm:text-left">
            <div class="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-500">Heat {{ area.heat }}</span>
              <span class="text-[9px] font-black uppercase tracking-widest text-stone-300">{{ area.distance }}</span>
            </div>
            <div class="space-y-1">
              <h5 class="truncate text-base font-black leading-tight text-stone-900">{{ area.title }}</h5>
              <p class="text-[10px] font-bold tracking-wider text-stone-400">查看摊位分布与实时动态</p>
            </div>
            <div class="flex items-center justify-center gap-1 text-[10px] font-black text-orange-500 sm:justify-start">
              立即查看
              <ArrowUpRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 避坑指南 -->
    <section class="px-1 space-y-6 pt-4 pb-12 text-center sm:text-left">
      <div class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-between">
        <div class="flex items-center justify-center gap-3">
          <div class="w-1 h-6 rounded-full bg-stone-900"></div>
          <h4 class="text-2xl font-black tracking-tight text-stone-900">摊主周刊·避坑指南</h4>
        </div>
        <div class="flex justify-center gap-2">
           <div class="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-300">
              <ChevronRight class="w-4 h-4 rotate-180" />
           </div>
           <div class="w-8 h-8 rounded-full border border-stone-900 flex items-center justify-center text-stone-900">
              <ChevronRight class="w-4 h-4" />
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          class="md:col-span-2 relative h-[440px] rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-stone-200"
        >
          <img 
            src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=800&auto=format&fit=crop" 
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            alt="Story Cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div class="absolute top-8 left-8 flex items-center gap-3">
            <span class="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
              Hot Story
            </span>
            <span class="text-[10px] font-black text-white/60">Vol. 042</span>
          </div>
          <div class="absolute bottom-10 left-10 right-10 space-y-4 text-white">
            <h5 class="text-4xl font-black tracking-tighter leading-[0.95]">
              如何选择最佳<br/>
              <span class="text-orange-400 underline decoration-4 underline-offset-8">出摊黄金时段？</span>
            </h5>
            <div class="flex items-center gap-6 pt-4 border-t border-white/20">
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <BookOpen class="w-4 h-4 text-white" />
                 </div>
                 <span class="text-xs font-bold text-white/80">经验分享</span>
              </div>
              <div class="flex items-center gap-2">
                 <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Clock class="w-4 h-4 text-white" />
                 </div>
                 <span class="text-xs font-bold text-white/80">阅读 12k+</span>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div 
            class="bg-white p-8 rounded-[3rem] border border-stone-100 shadow-sm relative overflow-hidden group h-1/2 flex flex-col justify-center hover:-translate-y-2 transition-transform"
          >
            <div class="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight class="w-6 h-6 text-stone-900" />
            </div>
            <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-6 shadow-inner">
              <Sparkles class="w-6 h-6" />
            </div>
            <h6 class="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Visual Marketing</h6>
            <h5 class="text-xl font-black text-stone-900 leading-tight tracking-tight">
              光影魔法：灯光布置<br/>提升门店转化率
            </h5>
          </div>

          <div 
            class="relative flex h-auto min-h-[200px] flex-col justify-center overflow-hidden rounded-[2.25rem] bg-stone-900 p-6 text-white transition-transform hover:-translate-y-2 sm:h-1/2 sm:rounded-[3rem] sm:p-8"
          >
            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div class="absolute top-8 right-8 writing-vertical-lr grayscale opacity-20 font-black text-4xl select-none">TIPS</div>
            <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
              <Zap class="w-6 h-6" />
            </div>
            <h6 class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Inventory Control</h6>
            <h5 class="text-xl font-black text-white leading-tight tracking-tight">
              夏季冷饮：<br/>库存损耗管理秘籍
            </h5>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速申请弹窗 -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showApplyModal" class="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
        <div class="absolute inset-0 bg-stone-900/45 backdrop-blur-md" @click="showApplyModal = false"></div>
        
        <Transition
          enter-active-class="transition duration-500 ease-out transform"
          enter-from-class="translate-y-full opacity-0 sm:translate-y-8 sm:scale-[0.98]"
          enter-to-class="translate-y-0 opacity-100 sm:scale-100"
          leave-active-class="transition duration-300 ease-in transform"
          leave-from-class="translate-y-0 opacity-100 sm:scale-100"
          leave-to-class="translate-y-full opacity-0 sm:translate-y-8 sm:scale-[0.98]"
          appear
        >
          <div class="relative flex w-full max-w-full justify-center overflow-hidden sm:block" :style="isMobileViewport ? mobileModalViewportStyle : {}">
            <div
              class="relative mx-auto flex flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[#FCFBF8] shadow-2xl sm:rounded-[2.8rem]"
              :class="isMobileViewport ? 'max-w-none' : 'h-[90vh] w-full max-w-4xl'"
              :style="isMobileViewport ? mobileModalCardStyle : {}"
            >
              <div class="relative shrink-0 overflow-hidden border-b border-stone-100/80 bg-gradient-to-br from-[#fffaf3] via-white to-[#f7f1e8] px-4 pb-4 pt-4 text-center sm:px-10 sm:pb-6 sm:pt-8 sm:text-left">
                <div class="absolute right-3 top-3 h-24 w-20 overflow-hidden rounded-[1.2rem] border border-white/80 shadow-lg shadow-stone-200/70 sm:right-8 sm:top-6 sm:h-36 sm:w-28 sm:rounded-[1.8rem]">
                  <img 
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400&auto=format&fit=crop" 
                    alt="Stall Illustration" 
                    class="h-full w-full object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-stone-950/35 via-stone-950/5 to-transparent"></div>
                </div>
                
                <button 
                  @click="showApplyModal = false"
                  class="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-stone-100 bg-white/95 text-stone-400 shadow-md transition-all hover:text-stone-900 sm:right-4 sm:top-4"
                >
                  <X class="h-5 w-5" />
                </button>

                <div class="relative z-10 mx-auto max-w-[calc(100%-5.75rem)] space-y-3 sm:mx-0 sm:max-w-[calc(100%-12rem)] sm:space-y-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="inline-flex items-center rounded-full bg-[#A37B24]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#A37B24]">
                      5步快速入驻
                    </span>
                    <span class="inline-flex items-center rounded-full border border-stone-200 bg-white/85 px-2.5 py-1 text-[10px] font-black text-stone-500">
                      预计 3 分钟完成
                    </span>
                  </div>

                  <div class="space-y-1.5">
                    <h4 class="text-[2rem] font-black leading-[0.95] tracking-tight text-stone-900 sm:text-4xl">申请入驻摊位</h4>
                    <p class="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400 opacity-70 sm:text-xs">Stall Onboarding Application</p>
                  </div>

                  <p class="pr-2 text-[13px] font-medium leading-relaxed text-stone-500 sm:max-w-xl sm:pr-0 sm:text-sm">
                    选择经营位置、完成实名认证，并上传经营展示图，快速完成您的摊位入驻申请。
                  </p>
                </div>

                <div class="relative z-10 mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:max-w-2xl sm:gap-3">
                  <div
                    v-for="item in [
                      { label: '位置锁定', value: '推荐商圈', icon: MapPin, tone: 'bg-[#A37B24]/10 text-[#A37B24]' },
                      { label: '证件核验', value: '2小时初审', icon: ShieldCheck, tone: 'bg-emerald-50 text-emerald-600' },
                      { label: '经营展示', value: '支持方案图', icon: TrendingUp, tone: 'bg-orange-50 text-orange-500' }
                    ]"
                    :key="item.label"
                    class="rounded-[1rem] border border-white/80 bg-white/85 p-2.5 shadow-sm shadow-stone-100/80 backdrop-blur-sm sm:rounded-[1.2rem] sm:p-3"
                  >
                    <div :class="['mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-[0.9rem] sm:mx-0 sm:h-9 sm:w-9 sm:rounded-xl', item.tone]">
                      <component :is="item.icon" class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <p class="text-[8px] font-black uppercase tracking-[0.16em] text-stone-400 sm:text-[9px]">{{ item.label }}</p>
                    <p class="mt-1 text-[11px] font-black leading-tight text-stone-900 sm:text-sm">{{ item.value }}</p>
                  </div>
                </div>
              </div>

              <div class="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6 pt-4 text-center sm:px-10 sm:pb-10 sm:pt-6 sm:text-left">
                <div class="space-y-5 sm:space-y-6">
                  <div class="space-y-3">
                    <div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                      <div class="flex items-center justify-center gap-3 sm:justify-start">
                        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#A37B24] text-[10px] font-black text-white">01</div>
                        <div>
                          <h5 class="text-sm font-black text-stone-900">选择摊位位置</h5>
                          <p class="text-[10px] font-bold text-stone-400">优先选择推荐商圈，提升申请通过率</p>
                        </div>
                      </div>
                      <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-500">AI 热荐</span>
                    </div>
                    
                    <div class="space-y-4 rounded-[1.6rem] border border-stone-100 bg-white p-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.04)] sm:rounded-[2rem] sm:p-6">
                      <div class="relative">
                        <div class="absolute inset-y-0 left-4 flex items-center">
                          <Search class="h-4 w-4 text-stone-300" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="搜索地点或区域，如：文化广场、美食街..." 
                          class="w-full rounded-2xl border border-stone-100 bg-stone-50 py-3.5 pl-12 pr-4 text-xs font-bold text-stone-700 outline-none transition-all ring-[#A37B24]/10 placeholder:text-stone-300 focus:ring-2 sm:py-4 sm:pl-14 sm:pr-6"
                          @input="e => searchQuery = (e.target as HTMLInputElement).value"
                        />
                      </div>

                      <div class="relative h-40 overflow-hidden rounded-[1.35rem] border border-stone-100 bg-[#F5F1E9] sm:h-60 sm:rounded-[1.5rem]">
                        <div class="absolute inset-0 opacity-[0.05]" style="background-image: linear-gradient(#A37B24 1px, transparent 1px), linear-gradient(90deg, #A37B24 1px, transparent 1px); background-size: 40px 40px;"></div>
                        
                        <div class="absolute left-[22%] top-[28%] cursor-pointer transition-transform hover:scale-110">
                           <div class="rounded-lg border border-stone-200 bg-white/90 p-1.5 shadow-sm">
                             <Store class="h-3 w-3 text-[#A37B24]/60" />
                           </div>
                        </div>
                        <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 px-3 text-center">
                          <div class="flex items-center gap-2 rounded-full border border-white bg-white/95 px-3 py-1.5 shadow-xl backdrop-blur-md sm:px-4 sm:py-2">
                            <span class="text-[10px] font-black text-stone-900">文化广场 · 默认区域</span>
                          </div>
                          <div class="relative">
                            <MapPin class="h-8 w-8 fill-[#A37B24]/20 text-[#A37B24]" />
                            <div class="absolute -bottom-1 left-1/2 h-0.5 w-2 -translate-x-1/2 rounded-full bg-black/10"></div>
                          </div>
                        </div>
                        <button class="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl border border-stone-100 bg-white px-2.5 py-1.5 shadow-sm transition-colors hover:bg-stone-50 sm:right-4 sm:top-4 sm:gap-2 sm:px-3 sm:py-2">
                          <MapIcon class="h-3 w-3 text-[#A37B24]" />
                          <span class="text-[8px] font-black text-stone-900 sm:text-[9px]">切换地图模式</span>
                        </button>
                      </div>

                      <div class="flex flex-col gap-3 rounded-[1.25rem] border border-stone-100 bg-stone-50/80 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:p-4">
                        <div class="flex items-center gap-3">
                          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#A37B24] shadow-sm">
                            <MapPin class="h-5 w-5" />
                          </div>
                          <div>
                            <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-stone-400">当前位置</p>
                            <p class="text-sm font-black text-stone-900">文化广场 · 默认区域</p>
                          </div>
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                          <span class="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-stone-500 shadow-sm">步行 3 分钟</span>
                          <span class="inline-flex items-center gap-1.5 rounded-full border border-[#A37B24]/10 bg-[#A37B24]/5 px-3 py-1.5 text-[10px] font-black text-[#A37B24]">
                            可选 12 处
                            <ChevronRight class="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <div class="space-y-3">
                      <div class="flex items-center justify-center gap-3 sm:justify-start">
                        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#A37B24] text-[10px] font-black text-white">02</div>
                        <div>
                          <h5 class="text-sm font-black text-stone-900">经营类目</h5>
                          <p class="text-[10px] font-bold text-stone-400">选择主营类目，匹配推荐点位</p>
                        </div>
                      </div>
                      <div class="group flex cursor-pointer flex-col items-center gap-3 rounded-[1.4rem] border border-stone-100 bg-white p-4 text-center shadow-sm transition-all hover:border-[#A37B24]/30 sm:flex-row sm:justify-between sm:rounded-[1.7rem] sm:text-left">
                        <div class="flex items-center justify-center gap-3.5 sm:justify-start">
                          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#A37B24]">
                            <Store class="h-5 w-5" />
                          </div>
                          <div>
                            <p class="text-sm font-black text-stone-900">创意手工</p>
                            <p class="text-[10px] font-bold text-stone-400">适配文创夜市与手作展区</p>
                          </div>
                        </div>
                        <ChevronRight class="h-4 w-4 text-stone-300 transition-colors group-hover:text-[#A37B24]" />
                      </div>
                    </div>

                    <div class="space-y-3">
                      <div class="flex items-center justify-center gap-3 sm:justify-start">
                        <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#A37B24] text-[10px] font-black text-white">03</div>
                        <div>
                          <h5 class="text-sm font-black text-stone-900">申请时间</h5>
                          <p class="text-[10px] font-bold text-stone-400">选择计划出摊时间，便于审核安排</p>
                        </div>
                      </div>
                      <div class="group flex cursor-pointer flex-col items-center gap-3 rounded-[1.4rem] border border-stone-100 bg-white p-4 text-center shadow-sm transition-all hover:border-[#A37B24]/30 sm:flex-row sm:justify-between sm:rounded-[1.7rem] sm:text-left">
                        <div class="flex items-center justify-center gap-3.5 sm:justify-start">
                          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#A37B24]">
                            <Clock class="h-5 w-5" />
                          </div>
                          <div>
                            <p class="text-sm font-black text-stone-900">明日起出摊</p>
                            <p class="text-[10px] font-bold text-stone-400">推荐从黄金时段前完成入场</p>
                          </div>
                        </div>
                        <ChevronRight class="h-4 w-4 text-stone-300 transition-colors group-hover:text-[#A37B24]" />
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center justify-center gap-3 sm:justify-start">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#A37B24] text-[10px] font-black text-white">04</div>
                      <div>
                        <h5 class="text-sm font-black text-stone-900">身份验证（证件上传）</h5>
                        <p class="text-[10px] font-bold text-stone-400">实名认证信息仅用于审核，不会向第三方披露</p>
                      </div>
                    </div>
                    <div class="rounded-[1.6rem] border border-stone-100 bg-white p-4 text-center shadow-sm sm:rounded-[2rem] sm:p-5 sm:text-left">
                      <div class="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-50 text-stone-300 transition-colors hover:text-[#A37B24]">
                          <Plus class="h-6 w-6" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="flex items-start justify-between gap-3">
                            <div>
                              <p class="text-sm font-black text-stone-900">上传有效证件</p>
                              <p class="mt-1 text-[10px] font-bold leading-relaxed text-stone-400">仅用于摊主实名认证，支持身份证、营业执照等材料</p>
                            </div>
                            <ChevronRight class="mt-1 h-4 w-4 shrink-0 text-stone-300" />
                          </div>

                          <div class="mt-3 grid grid-cols-2 gap-2">
                            <div class="rounded-xl bg-stone-50 px-3 py-2">
                              <p class="text-[9px] font-black uppercase tracking-[0.16em] text-stone-400">格式</p>
                              <p class="mt-1 text-[11px] font-black text-stone-900">JPG / PNG / PDF</p>
                            </div>
                            <div class="rounded-xl bg-stone-50 px-3 py-2">
                              <p class="text-[9px] font-black uppercase tracking-[0.16em] text-stone-400">审核</p>
                              <p class="mt-1 text-[11px] font-black text-stone-900">2 小时内初审</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center justify-center gap-3 sm:justify-start">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#A37B24] text-[10px] font-black text-white">05</div>
                      <div>
                        <h5 class="text-sm font-black text-stone-900">摊位展示（经营 / 设计图）</h5>
                        <p class="text-[10px] font-bold text-stone-400">上传经营照片、效果图或设计草图，帮助更快完成审核</p>
                      </div>
                    </div>
                    <div class="group relative overflow-hidden rounded-[1.75rem] border-2 border-dashed border-stone-200 bg-[#FAFAFA] p-5 transition-all hover:border-[#A37B24]/40 hover:bg-[#A37B24]/5 sm:rounded-[2.2rem] sm:p-8">
                      <div class="relative z-10 flex flex-col items-center text-center">
                        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#A37B24] shadow-md shadow-black/5 transition-transform group-hover:-translate-y-1 sm:h-16 sm:w-16">
                          <TrendingUp class="h-7 w-7 sm:h-8 sm:w-8" />
                        </div>
                        <p class="mt-4 text-sm font-black text-stone-900">拍照或上传设计方案</p>
                        <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">支持 JPG、PNG、PDF 格式，单文件不超过 10MB</p>

                        <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <span class="rounded-full bg-white px-3 py-1 text-[10px] font-black text-stone-500 shadow-sm">门头照</span>
                          <span class="rounded-full bg-white px-3 py-1 text-[10px] font-black text-stone-500 shadow-sm">经营图</span>
                          <span class="rounded-full bg-white px-3 py-1 text-[10px] font-black text-stone-500 shadow-sm">设计草图</span>
                        </div>
                      </div>
                      <div class="absolute -bottom-3 -right-2 h-24 w-24 opacity-15 sm:bottom-4 sm:right-4 sm:h-28 sm:w-28">
                        <img 
                          src="https://images.unsplash.com/photo-1544411047-c491e34a2465?q=80&w=200&auto=format&fit=crop" 
                          alt="Design Plan" 
                          class="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="rounded-[1.6rem] border border-stone-100 bg-white/95 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.05)] sm:rounded-[2rem] sm:p-6">
                    <div class="flex flex-col gap-4 sm:gap-5">
                      <div v-if="isMobileViewport" class="space-y-2 text-center">
                        <div class="flex flex-col items-center gap-2.5">
                          <div class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#A37B24]/10 text-[#A37B24]">
                            <ShieldCheck class="h-4 w-4" />
                          </div>
                          <div>
                            <p class="text-[11px] font-black text-stone-900">材料齐全后即可提交，平台将尽快审核</p>
                            <p class="mt-1 text-[10px] font-bold leading-relaxed text-stone-400">
                              提交即表示您已阅读并同意
                              <span class="cursor-pointer text-[#A37B24] underline underline-offset-4 hover:text-stone-900">《用户服务协议》</span>
                              和
                              <span class="cursor-pointer text-[#A37B24] underline underline-offset-4 hover:text-stone-900">《隐私政策》</span>
                            </p>
                          </div>
                        </div>
                        <div class="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-black text-[#A37B24]">
                          <Navigation class="h-3.5 w-3.5" />
                          已覆盖位置、证件与展示图三项核心材料
                        </div>
                      </div>

                      <div class="flex justify-center">
                        <button 
                          @click="submitApply"
                          class="w-full rounded-[1.5rem] bg-[#A37B24] px-6 py-4 text-center text-base font-black text-white shadow-xl shadow-[#A37B24]/30 transition-all active:scale-95 sm:w-auto sm:min-w-[18rem]"
                        >
                          确认并提交申请
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>
