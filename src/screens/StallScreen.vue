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
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';

const userStatus = ref<'none' | 'pending' | 'active'>('none');

const showApplyModal = ref(false);
const searchQuery = ref('');




interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AuthSession {
  phone?: string;
}



const selectedAreaName = ref('文化广场 · 默认区域');
const selectedCategoryName = ref('小吃');
const stallNameInput = ref('');
const durationDays = ref(7);
const isCustomDuration = ref(false);
const customDurationInput = ref('');
const businessImageUrl = ref('');
const businessImagePreview = ref('');
const applicationNote = ref('');
const selectedCoordinate = ref({ latitude: 31.2304, longitude: 121.4737 });
const submittingApply = ref(false);
const formErrors = ref<Record<string, string>>({});

const validateApplyForm = (): boolean => {
  const errors: Record<string, string> = {};
  if (!stallNameInput.value.trim()) errors.stallName = '请输入摊位名称';
  if (!selectedAreaName.value.trim()) errors.areaName = '请选择经营区域';
  if (!selectedCategoryName.value.trim()) errors.categoryName = '请选择经营品类';
  if (!businessImageUrl.value) errors.businessImageUrl = '请上传经营图';

  const sessionRaw = localStorage.getItem('stall_auth_session');
  const session: AuthSession = sessionRaw ? JSON.parse(sessionRaw) : {};
  const phone = session.phone || '';
  if (!phone || !/^\d{11}$/.test(phone)) errors.contactPhone = '联系电话无效，请重新登录';

  formErrors.value = errors;
  return Object.keys(errors).length === 0;
};

const setDuration = (days: number) => {
  durationDays.value = days;
  isCustomDuration.value = false;
  customDurationInput.value = '';
  if (formErrors.value.plannedStartTime) delete formErrors.value.plannedStartTime;
};

const categoryOptions = ['小吃', '手工饰品', '饮品', '作品', '其他'];

const mockLocations = [
  { name: '文化广场 · 默认区域', latitude: 31.2304, longitude: 121.4737 },
  { name: '滨江创意街区', latitude: 31.2216, longitude: 121.4915 },
  { name: '老街美食巷', latitude: 31.2389, longitude: 121.4632 }
];

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
  const sessionRaw = localStorage.getItem('stall_auth_session');
  const session: AuthSession = sessionRaw ? JSON.parse(sessionRaw) : {};
  if (!stallNameInput.value.trim()) {
    stallNameInput.value = '';
  }
  showApplyModal.value = true;
  updateViewport();
};

const submitApply = async () => {
  if (!validateApplyForm()) {
    showToast('error', '提交失败', '请完善所有必填信息');
    return;
  }

  const stallName = stallNameInput.value.trim();
  const dur = isCustomDuration.value ? parseInt(customDurationInput.value) || 7 : durationDays.value;

  submittingApply.value = true;
  try {
    const authToken = localStorage.getItem('stall_auth_token') || '';
    const sessionRaw = localStorage.getItem('stall_auth_session');
    const session: AuthSession = sessionRaw ? JSON.parse(sessionRaw) : {};

    const response = await fetch(buildApiUrl('/api/stalls/onboarding/applications'), {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        stallName,
        contactPhone: session.phone || '',
        areaName: selectedAreaName.value,
        categoryName: selectedCategoryName.value,
        durationDays: dur,
        locationLatitude: selectedCoordinate.value.latitude,
        locationLongitude: selectedCoordinate.value.longitude,
        businessImageUrl: businessImageUrl.value,
        note: applicationNote.value.trim() || null
      })
    });

    const payload = (await response.json()) as ApiResponse<{ applicationId: string }>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || '提交申请失败');
    }

    userStatus.value = 'active';
    showToast('success', '申请成功', `申请编号：${payload.data?.applicationId || ''}`);
    showApplyModal.value = false;
  } catch (error) {
    showToast('error', '提交失败', error instanceof Error ? error.message : '提交申请失败');
  } finally {
    submittingApply.value = false;
  }
};

// --upload start
// --- 新增上传相关的状态 ---
const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);

// --- 新增 OSS 上传逻辑 ---
const triggerUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('error', '上传失败', '文件大小不能超过 5MB');
    return;
  }

  // 本地预览
  businessImagePreview.value = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append('file', file);

  isUploading.value = true;

  try {
    const authToken = localStorage.getItem('stall_auth_token') || '';
    const response = await fetch(buildApiUrl('/api/common/upload'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });

    const result = await response.json();

    if (result.code === 200 || result.success) {
      businessImageUrl.value = result.data;
      showToast('success', '上传成功', '经营图片已上传');
      if (formErrors.value.businessImageUrl) {
        delete formErrors.value.businessImageUrl;
      }
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error) {
    showToast('error', '上传失败', error instanceof Error ? error.message : '图片上传失败，请重试');
    businessImagePreview.value = '';
  } finally {
    isUploading.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

// upload end
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
            <button @click.stop="handleApply" class="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-stone-900/10 transition-all active:scale-95 sm:w-auto">
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
              <div class="relative shrink-0 overflow-hidden border-b border-stone-100 bg-gradient-to-br from-[#fffaf3] via-[#fffdf7] to-[#f7f1e8] px-4 pb-4 pt-4 text-left sm:px-6 sm:pb-5 sm:pt-6">
                <button
                  @click="showApplyModal = false"
                  class="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-stone-100 bg-white text-stone-400 shadow-sm transition-all hover:text-stone-900"
                >
                  <X class="h-5 w-5" />
                </button>

                <h4 class="pr-10 text-[1.8rem] font-black leading-tight tracking-tight text-stone-900 sm:text-[2rem]">申请入驻摊位</h4>
                <p class="mt-1 text-xs font-bold tracking-wide text-stone-400">填写基础信息，快速完成入驻</p>
              </div>

              <div class="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto bg-[#fffdf8] px-4 pb-5 pt-4 sm:px-6">
                <div class="space-y-4 text-left">
                  <section class="rounded-2xl border border-amber-100/70 bg-white p-3">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">01</span>
                      <h5 class="text-sm font-black text-stone-900">摊位位置</h5>
                    </div>

                    <div class="relative">
                      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
                      <input
                        type="text"
                        placeholder="搜索地铁、商区、写字楼、商业入口"
                        class="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-xs font-semibold text-stone-700 outline-none focus:border-amber-300"
                        @input="e => searchQuery = (e.target as HTMLInputElement).value"
                      />
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <button
                        v-for="loc in mockLocations.filter(loc => !searchQuery || loc.name.includes(searchQuery))"
                        :key="loc.name"
                        @click="selectedAreaName = loc.name; selectedCoordinate = { latitude: loc.latitude, longitude: loc.longitude }"
                        :class="['rounded-full border px-3 py-1.5 text-[11px] font-bold', selectedAreaName === loc.name ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']"
                      >
                        {{ loc.name }}
                      </button>
                    </div>

                    <div class="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                      <img
                        src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1200&auto=format&fit=crop"
                        alt="map"
                        class="h-28 w-full object-cover"
                        referrerpolicy="no-referrer"
                      />
                    </div>
                  </section>

                  <section class="rounded-2xl border border-amber-100/70 bg-white p-3" :class="{ 'border-red-300': formErrors.stallName }">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">02</span>
                      <h5 class="text-sm font-black text-stone-900">摊位名称 <span class="text-red-400">*</span></h5>
                    </div>
                    <input
                      v-model="stallNameInput"
                      maxlength="20"
                      placeholder="请输入摊位名称（2-20个字）"
                      class="w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-amber-300"
                      :class="formErrors.stallName ? 'border-red-300' : 'border-stone-200'"
                      @input="() => { if (formErrors.stallName && stallNameInput.trim()) delete formErrors.stallName; }"
                    />
                    <p v-if="formErrors.stallName" class="mt-1 text-xs font-bold text-red-500">{{ formErrors.stallName }}</p>
                  </section>

                  <section class="rounded-2xl border border-amber-100/70 bg-white p-3" :class="{ 'border-red-300': formErrors.categoryName }">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">03</span>
                      <h5 class="text-sm font-black text-stone-900">经营类目 <span class="text-red-400">*</span></h5>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button
                        v-for="item in categoryOptions"
                        :key="item"
                        type="button"
                        @click="selectedCategoryName = item; if (formErrors.categoryName) delete formErrors.categoryName;"
                        :class="['rounded-xl border px-3 py-2 text-xs font-bold', selectedCategoryName === item ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']"
                      >
                        {{ item }}
                      </button>
                    </div>
                    <p v-if="formErrors.categoryName" class="mt-1 text-xs font-bold text-red-500">{{ formErrors.categoryName }}</p>
                  </section>

                  <section class="rounded-2xl border border-amber-100/70 bg-white p-3">
                    <div class="mb-2 flex items-center gap-2">
                      <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">04</span>
                      <h5 class="text-sm font-black text-stone-900">申请时长</h5>
                    </div>

                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button type="button" @click="setDuration(7)"
                        :class="['rounded-xl border px-3 py-2.5 text-xs font-bold transition-all',
                          !isCustomDuration && durationDays === 7 ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']">
                        一周<br /><span class="text-[10px] font-normal">7 天</span>
                      </button>
                      <button type="button" @click="setDuration(30)"
                        :class="['rounded-xl border px-3 py-2.5 text-xs font-bold transition-all',
                          !isCustomDuration && durationDays === 30 ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']">
                        一个月<br /><span class="text-[10px] font-normal">30 天</span>
                      </button>
                      <button type="button" @click="setDuration(365)"
                        :class="['rounded-xl border px-3 py-2.5 text-xs font-bold transition-all',
                          !isCustomDuration && durationDays === 365 ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']">
                        一年<br /><span class="text-[10px] font-normal">365 天</span>
                      </button>
                      <button type="button" @click="isCustomDuration = true; durationDays = 0"
                        :class="['rounded-xl border px-3 py-2.5 text-xs font-bold transition-all',
                          isCustomDuration ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']">
                        自定义<br /><span class="text-[10px] font-normal">自行填写</span>
                      </button>
                    </div>
                    <div v-if="isCustomDuration" class="mt-3">
                      <input v-model="customDurationInput" type="number" min="1" placeholder="请输入天数"
                        class="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-amber-300" />
                      <p class="mt-1 text-[10px] font-bold text-stone-400">{{ customDurationInput ? customDurationInput + ' 天' : '请输入申请时长' }}</p>
                    </div>
                    <p class="mt-2 text-[11px] font-bold text-amber-600">* 选择您希望申请入驻的时长，提交后即刻生效</p>
                  </section>

                  <section class="rounded-2xl border border-amber-100/70 bg-white p-3" :class="{ 'border-red-300': formErrors.businessImageUrl }">
  <div class="mb-2 flex items-center gap-2">
    <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white">05</span>
    <h5 class="text-sm font-black text-stone-900">摊位展示（经营图） <span class="text-red-400">*</span></h5>
  </div>

  <!-- 隐藏的真实文件输入框 -->
  <input
    type="file"
    ref="fileInputRef"
    class="hidden"
    accept="image/*"
    @change="handleFileChange"
  />

  <!-- 上传点击区域 -->
  <div
    @click="triggerUpload"
    class="relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all hover:bg-amber-50/50"
    :class="businessImageUrl ? 'border-emerald-200' : (formErrors.businessImageUrl ? 'border-red-300 bg-red-50/30' : 'border-amber-200 bg-amber-50/30')"
  >
    <!-- 上传中状态 -->
    <div v-if="isUploading" class="flex flex-col items-center py-6">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
      <p class="mt-2 text-[10px] font-black text-stone-500">正在同步至云端...</p>
    </div>

    <!-- 已上传预览状态 -->
    <div v-else-if="businessImagePreview" class="group relative aspect-video w-full">
      <img :src="businessImagePreview" class="h-full w-full object-cover" />
      <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <p class="text-xs font-black text-white">点击更换图片</p>
      </div>
    </div>

    <!-- 默认待上传状态 -->
    <div v-else class="p-4 text-center">
      <Plus class="mx-auto h-6 w-6 text-amber-500" />
      <p class="mt-1 text-xs font-black text-stone-700">点击上传经营展示图</p>
      <p class="text-[10px] font-bold text-stone-400">支持 JPG / PNG，大小不超过 5MB</p>
    </div>
  </div>

  <p v-if="formErrors.businessImageUrl" class="mt-1 text-xs font-bold text-red-500">{{ formErrors.businessImageUrl }}</p>

  <div class="mt-3 space-y-2">
    <textarea
      v-model="applicationNote"
      rows="2"
      placeholder="可补充摊位说明（如：主营特色、设备需求等）"
      class="w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-amber-300"
    />
  </div>
</section>

                  <button
                    @click="submitApply"
                    :disabled="submittingApply"
                    class="w-full rounded-xl bg-[#c8942f] px-4 py-3 text-sm font-black text-white shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {{ submittingApply ? '提交中...' : '提交申请' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

  </div>
</template>

