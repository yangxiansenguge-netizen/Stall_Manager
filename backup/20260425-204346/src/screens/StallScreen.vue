<script setup lang="ts">
import { ref } from 'vue';
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

const handleApply = () => {
  showApplyModal.value = true;
};

const submitApply = () => {
  userStatus.value = 'pending';
  showApplyModal.value = false;
};
</script>

<template>
  <div class="space-y-6 sm:space-y-8 pb-32 relative bg-[#F9F9F9] min-h-screen pt-1 sm:pt-2">
    <!-- 1. 核心主卡片 -->
    <section class="relative px-1 sm:px-2">
      <div class="absolute -top-12 -left-12 h-48 w-48 -z-10 animate-pulse rounded-full bg-orange-200/20 blur-3xl"></div>
      <div class="absolute -bottom-24 -right-12 h-64 w-64 -z-10 rounded-full bg-indigo-200/10 blur-3xl"></div>

      <div 
        @click="handleApply"
        class="group relative overflow-hidden rounded-[2.2rem] border border-stone-50 bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1 lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <div class="z-10 grid gap-4 p-5 sm:p-6 md:p-8">
          <div class="flex flex-wrap items-center gap-2 text-left">
            <div class="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Current Opportunities</span>
            <span class="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black text-orange-500">空余 23 处</span>
          </div>

          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:items-start">
            <div class="space-y-3 text-left">
              <h2 class="text-[2rem] font-black leading-[0.92] tracking-tighter text-stone-900 sm:text-[2.35rem] md:text-5xl">
                开启你的
                <span class="block text-orange-500">烟火气生意</span>
              </h2>
              <p class="max-w-md text-sm font-medium leading-relaxed text-stone-500">
                在热门商圈里更快找到可申请摊位、查看推荐区域，并直接进入入驻申请。
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
              <div class="rounded-[1.4rem] border border-orange-100 bg-orange-50/80 p-3 text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-orange-500">黄金时段</p>
                <p class="mt-1 text-sm font-black text-stone-900">17:00 - 22:00</p>
              </div>
              <div class="rounded-[1.4rem] border border-stone-100 bg-stone-50 p-3 text-left">
                <p class="text-[10px] font-black uppercase tracking-widest text-stone-400">热门商圈</p>
                <p class="mt-1 text-sm font-black text-stone-900">文化广场</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button class="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-stone-900/10 transition-all active:scale-95 sm:w-auto">
              立即申请入驻
              <ArrowUpRight class="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
            <div class="grid grid-cols-2 gap-2 sm:min-w-[12rem]">
              <div class="rounded-2xl border border-stone-100 bg-white px-3 py-2 text-left shadow-sm">
                <p class="text-[10px] font-bold uppercase tracking-widest text-stone-400">通过率</p>
                <p class="mt-1 text-sm font-black text-stone-900">92%</p>
              </div>
              <div class="rounded-2xl border border-stone-100 bg-white px-3 py-2 text-left shadow-sm">
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
          <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-stone-100 bg-white/95 px-4 py-3.5 backdrop-blur-md sm:px-5">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Flame class="h-5 w-5" />
            </div>
            <div class="min-w-0 text-left">
              <p class="text-[10px] font-black uppercase tracking-widest text-stone-400">推荐区域</p>
              <p class="truncate text-sm font-black text-stone-900">文化广场·夜市区</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. AI 智能经营助手 -->
    <section class="px-1">
      <div class="bg-white rounded-[2.5rem] p-8 border border-stone-50 shadow-[0_10px_20px_rgba(0,0,0,0.05)] relative overflow-hidden text-left">
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: radial-gradient(#6366f1 1px, transparent 1px); background-size: 16px 16px;"></div>
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -z-10"></div>
        
        <div class="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
          <div class="flex-1 space-y-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Brain class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-black text-stone-900 tracking-tight leading-none">AI 智能经营规划</h3>
                <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Master Sales Strategy Assistant</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center gap-2 px-3 py-1 bg-indigo-50/50 border border-indigo-100 rounded-full w-fit">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI 正在根据实时人流深度分析中...</span>
              </div>
              
              <p class="text-sm font-medium text-stone-500 leading-relaxed">
                基于周边 3km 实时活跃度，AI 已初步构建 <span class="text-indigo-600 font-black">今日致富蓝图</span>。接入后将为您提供精准的单品配比建议与话术方案。
              </p>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(item, idx) in [
                  { label: '核心类目', value: '潮玩模型', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { label: '预计流水', value: '¥1,500+', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: '黄金时段', value: '19:30', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                  { label: '转化预估', value: '8.2%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                ]" :key="idx" class="rounded-[1.35rem] border border-stone-100/50 bg-stone-50/60 p-3.5 transition-all hover:bg-white hover:shadow-md sm:rounded-3xl sm:p-4">
                  <div :class="['w-8 h-8 rounded-xl flex items-center justify-center mb-2', item.bg, item.color]">
                    <component :is="item.icon" class="w-4 h-4" />
                  </div>
                  <p class="text-[9px] font-black text-stone-400 uppercase tracking-widest">{{ item.label }}</p>
                  <p class="text-sm font-black text-stone-900">{{ item.value }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="w-full lg:w-48 shrink-0 self-end lg:self-auto">
             <button class="flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-indigo-50 py-3.5 text-sm font-black text-indigo-600 shadow-sm transition-all hover:bg-indigo-600 hover:text-white sm:rounded-3xl sm:py-4 group">
                启动AI分析
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. 探索更多潜力区域 -->
    <section class="space-y-4 pt-2">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2.5">
          <div class="h-5 w-1 rounded-full bg-orange-500"></div>
          <h4 class="text-lg font-black tracking-tight text-stone-900">发现城市盲盒</h4>
        </div>
        <div class="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-stone-400 transition-colors cursor-pointer hover:text-orange-500">
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
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 text-left sm:p-5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-500">Heat {{ area.heat }}</span>
              <span class="text-[9px] font-black uppercase tracking-widest text-stone-300">{{ area.distance }}</span>
            </div>
            <div class="space-y-1">
              <h5 class="truncate text-base font-black leading-tight text-stone-900">{{ area.title }}</h5>
              <p class="text-[10px] font-bold tracking-wider text-stone-400">查看摊位分布与实时动态</p>
            </div>
            <div class="flex items-center gap-1 text-[10px] font-black text-orange-500">
              立即查看
              <ArrowUpRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. 避坑指南 -->
    <section class="px-1 space-y-6 pt-4 pb-12 text-left">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-1 h-6 bg-stone-900 rounded-full"></div>
          <h4 class="font-black text-2xl text-stone-900 tracking-tight">摊主周刊·避坑指南</h4>
        </div>
        <div class="flex gap-2">
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
      <div v-if="showApplyModal" class="fixed inset-0 z-[60] flex flex-col justify-end">
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="showApplyModal = false"></div>
        
        <Transition
          enter-active-class="transition duration-500 ease-out transform"
          enter-from-class="translate-y-full"
          enter-to-class="translate-y-0"
          leave-active-class="transition duration-300 ease-in transform"
          leave-from-class="translate-y-0"
          leave-to-class="translate-y-full"
          appear
        >
          <div class="relative max-w-4xl mx-auto w-full bg-[#FDFDFD] rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh]">
            <div class="relative p-10 pb-6 shrink-0 text-left">
              <div class="absolute right-0 top-0 w-64 h-full pointer-events-none opacity-80 md:opacity-100">
                <img 
                  src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=400&auto=format&fit=crop" 
                  alt="Stall Illustration" 
                  class="w-full h-full object-contain object-right-top p-4"
                />
                <div class="absolute inset-0 bg-gradient-to-l from-transparent via-[#FDFDFD]/80 to-[#FDFDFD]"></div>
              </div>
              
              <div class="relative z-10 space-y-4">
                <button 
                  @click="showApplyModal = false"
                  class="absolute -top-4 -right-4 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 transition-all z-20"
                >
                  <X class="w-5 h-5" />
                </button>
                
                <div class="space-y-1">
                  <h4 class="text-4xl font-black text-stone-900 tracking-tight leading-tight">申请入驻摊位</h4>
                  <p class="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] opacity-60">Stall Onboarding Application</p>
                </div>
                <p class="text-sm font-medium text-stone-500 flex items-center gap-2">
                  选择您的经营位置，开启您的摊位经营之旅 👋
                </p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-10 pb-32 no-scrollbar space-y-10 text-left">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-[#A37B24] rounded-full flex items-center justify-center text-[10px] font-black text-white">01</div>
                  <h5 class="text-sm font-black text-stone-900">选择摊位位置</h5>
                </div>
                
                <div class="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-stone-50 space-y-6">
                  <div class="relative">
                    <div class="absolute inset-y-0 left-5 flex items-center">
                      <Search class="w-4 h-4 text-stone-300" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="搜索地点或区域，如：文化广场、美食街..." 
                      class="w-full bg-stone-50 border border-stone-100 rounded-2xl py-4 pl-14 pr-6 text-xs font-bold outline-none focus:ring-2 ring-[#A37B24]/10 transition-all"
                      @input="e => searchQuery = (e.target as HTMLInputElement).value"
                    />
                  </div>

                  <div class="relative h-60 bg-[#F5F1E9] rounded-[1.5rem] overflow-hidden border border-stone-100">
                    <div class="absolute inset-0 opacity-[0.05]" style="background-image: linear-gradient(#A37B24 1px, transparent 1px), linear-gradient(90deg, #A37B24 1px, transparent 1px); background-size: 40px 40px;"></div>
                    
                    <div class="absolute top-1/4 left-1/4 group cursor-pointer transition-transform hover:scale-110">
                       <div class="p-1.5 bg-white/90 rounded-lg shadow-sm border border-stone-200">
                         <Store class="w-3 h-3 text-[#A37B24]/60" />
                       </div>
                    </div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                      <div class="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white flex items-center gap-2">
                        <span class="text-[10px] font-black text-stone-900">文化广场 · 默认区域</span>
                      </div>
                      <div class="relative">
                        <MapPin class="w-8 h-8 text-[#A37B24] fill-[#A37B24]/20" />
                        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-black/10 rounded-full"></div>
                      </div>
                    </div>
                    <button class="absolute top-4 right-4 bg-white px-3 py-2 rounded-xl shadow-sm border border-stone-100 flex items-center gap-2 hover:bg-stone-50 transition-colors">
                      <MapIcon class="w-3 h-3 text-[#A37B24]" />
                      <span class="text-[9px] font-black text-stone-900">切换地图模式</span>
                    </button>
                  </div>

                  <div class="bg-stone-50/50 rounded-2xl p-4 flex items-center justify-between border border-stone-50">
                    <div class="flex items-center gap-3">
                       <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#A37B24] shadow-sm">
                         <MapPin class="w-5 h-5" />
                       </div>
                       <div>
                         <p class="text-[9px] font-bold text-stone-400">当前位置</p>
                         <p class="text-sm font-black text-stone-900">文化广场 · 默认区域</p>
                       </div>
                    </div>
                    <div class="flex items-center gap-1.5 bg-[#A37B24]/5 px-4 py-2 rounded-xl border border-[#A37B24]/10 cursor-pointer group hover:bg-[#A37B24]/10 transition-all">
                      <span class="text-[10px] font-black text-[#A37B24]">可选 12 处</span>
                      <ChevronRight class="w-3 h-3 text-[#A37B24] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-[#A37B24] rounded-full flex items-center justify-center text-[10px] font-black text-white">02</div>
                    <h5 class="text-sm font-black text-stone-900">经营类目</h5>
                  </div>
                  <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-50 flex items-center justify-between group cursor-pointer hover:border-[#A37B24]/30 transition-all">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-[#A37B24]">
                          <Store class="w-5 h-5" />
                        </div>
                        <span class="text-sm font-black text-stone-900">创意手工</span>
                     </div>
                     <ChevronRight class="w-4 h-4 text-stone-300 group-hover:text-[#A37B24] transition-colors" />
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 bg-[#A37B24] rounded-full flex items-center justify-center text-[10px] font-black text-white">03</div>
                    <h5 class="text-sm font-black text-stone-900">申请时间</h5>
                  </div>
                  <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-stone-50 flex items-center justify-between group cursor-pointer hover:border-[#A37B24]/30 transition-all">
                     <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-[#FAF7F2] rounded-xl flex items-center justify-center text-[#A37B24]">
                          <Clock class="w-5 h-5" />
                        </div>
                        <span class="text-sm font-black text-stone-900">明日起出摊</span>
                     </div>
                     <ChevronRight class="w-4 h-4 text-stone-300 group-hover:text-[#A37B24] transition-colors" />
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-[#A37B24] rounded-full flex items-center justify-center text-[10px] font-black text-white">04</div>
                  <h5 class="text-sm font-black text-stone-900">身份验证（证件上传）</h5>
                </div>
                <div class="bg-white rounded-[2.5rem] p-4 shadow-sm border border-stone-50 flex items-center justify-between group cursor-pointer hover:border-[#A37B24]/30 transition-all">
                  <div class="flex items-center gap-5">
                    <div class="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:text-[#A37B24] transition-colors">
                      <Plus class="w-6 h-6" />
                    </div>
                    <div>
                      <p class="text-sm font-black text-stone-900 text-left">上传有效证件</p>
                      <p class="text-[10px] font-bold text-stone-400">仅用于摊主实名认证，信息保密</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                     <span class="text-[10px] font-bold text-stone-300 uppercase tracking-widest">支持 JPG / PNG / PDF</span>
                     <ChevronRight class="w-3 h-3 text-stone-300" />
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-[#A37B24] rounded-full flex items-center justify-center text-[10px] font-black text-white">05</div>
                  <h5 class="text-sm font-black text-stone-900">摊位展示（经营/设计图）</h5>
                </div>
                <div class="relative bg-[#FAFAFA] border-2 border-dashed border-stone-200 rounded-[2.5rem] p-10 overflow-hidden group hover:border-[#A37B24]/40 hover:bg-[#A37B24]/5 transition-all cursor-pointer">
                  <div class="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md shadow-black/5 text-[#A37B24] group-hover:-translate-y-1 transition-transform">
                      <TrendingUp class="w-8 h-8" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-sm font-black text-stone-900">拍照或上传设计方案</p>
                      <p class="text-[10px] font-bold text-stone-400 uppercase tracking-widest">支持 JPG、PNG、PDF 格式，大小不超过 10MB</p>
                    </div>
                  </div>
                  <div class="absolute bottom-6 right-6 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity">
                    <img 
                      src="https://images.unsplash.com/photo-1544411047-c491e34a2465?q=80&w=200&auto=format&fit=crop" 
                      alt="Design Plan" 
                      class="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div class="absolute bottom-0 inset-x-0 p-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex items-center justify-between gap-10">
              <div class="flex items-start gap-3 text-left">
                <div class="mt-1">
                  <ShieldCheck class="w-4 h-4 text-[#A37B24]" />
                </div>
                <p class="text-[10px] font-bold text-stone-400 leading-relaxed">
                  提交即表示您已阅读并同意<br/> 
                  <span class="text-[#A37B24] underline underline-offset-4 cursor-pointer hover:text-stone-900">《用户服务协议》</span> 和 <span class="text-[#A37B24] underline underline-offset-4 cursor-pointer hover:text-stone-900">《隐私政策》</span>
                </p>
              </div>
              
              <button 
                @click="submitApply"
                class="px-10 py-5 bg-[#A37B24] text-white font-black rounded-[2rem] shadow-xl shadow-[#A37B24]/30 active:scale-95 transition-all flex items-center gap-4 group flex-1 max-w-xs"
              >
                <span class="w-full">确认并提交申请</span>
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
                  <Send class="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>
