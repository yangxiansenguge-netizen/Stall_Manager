<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  BookOpen,
  ShieldCheck,
  Map as MapIcon
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';
import { useLocationStore } from '../stores/location';

const userStatus = ref<'none' | 'pending' | 'active'>('none');

const showApplyModal = ref(false);
const searchQuery = ref('');

const stallBanners = ref<Record<string, any[]>>({})




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
const submittedDisplayAddress = ref('');
const submittingApply = ref(false);
const formErrors = ref<Record<string, string>>({});

// 摊位申请的地址（从后端加载，与个人定位分离）
const stallApplicationAddress = ref('');
const appLatitude = ref<number | null>(null);
const appLongitude = ref<number | null>(null);

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

// ===== 百度地图（完整版：Autocomplete + Geocoder + Geolocation） =====
const BAIDU_MAP_AK = 'LwmGzDCLOJPLXYILcQeWuVmd7xqgdRzC';
const mapContainerRef = ref<HTMLDivElement | null>(null);
const mapLoaded = ref(false);
const locationName = ref('未选择位置');
let geocodeTimer: any = null;
let mapInstance: any = null;
let activeMarker: any = null;
let geoInstance: any = null;

const loadBaiduMapSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if ((window as any).BMapGL) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${BAIDU_MAP_AK}&callback=baiduMapInit`;
    (window as any).baiduMapInit = () => { resolve(); };
    document.head.appendChild(script);
  });
};

// 地址智能生成：fullAddress / displayAddress / businessArea
const formatAddress = (rs: any, c: any) => {
  const pois = rs.surroundingPois || [];
  const poi = pois.find((p: any) =>
    p.title &&
    !p.title.includes('Unnamed') &&
    !p.title.includes('无名')
  )?.title || '';

  const fullAddress = [c.province, c.city, c.district, c.street, c.streetNumber]
    .filter(Boolean).join('');

  let displayAddress = '';
  if (poi) {
    displayAddress = c.district ? `${poi}（${c.district}）` : poi;
  } else {
    displayAddress = [c.district, c.street].filter(Boolean).join(' · ');
  }

  return { fullAddress, displayAddress, businessArea: poi };
};

// 反查地址（仅用于摊位申请，不写入个人位置缓存）
const reverseGeocode = (lat: number, lng: number) => {
  if (!geoInstance) return;
  locationName.value = '解析中...';
  clearTimeout(geocodeTimer);

  let resolved = false;
  geocodeTimer = setTimeout(() => {
    if (!resolved) {
      locationName.value = '定位失败（API额度耗尽）';
      showToast('error', '定位失败', '百度地图 API 额度已用完，请更换 AK');
    }
  }, 5000);

  geoInstance.getLocation(new (window as any).BMapGL.Point(lng, lat), (rs: any) => {
    resolved = true;
    clearTimeout(geocodeTimer);
    if (rs && rs.address) {
      const c = rs.addressComponents || {};
      const { fullAddress, displayAddress } = formatAddress(rs, c);
      locationName.value = displayAddress || fullAddress;
      selectedAreaName.value = fullAddress || displayAddress;
      submittedDisplayAddress.value = displayAddress || fullAddress;
    } else {
      locationName.value = '定位失败（无结果）';
    }
  });
};

// 放置标记
const placeMarker = (lng: number, lat: number) => {
  const BMapGL = (window as any).BMapGL;
  if (activeMarker) mapInstance.removeOverlay(activeMarker);
  const pt = new BMapGL.Point(lng, lat);
  activeMarker = new BMapGL.Marker(pt);
  mapInstance.addOverlay(activeMarker);
  mapInstance.centerAndZoom(pt, 17);
  selectedCoordinate.value = { latitude: lat, longitude: lng };
  reverseGeocode(lat, lng);
  if (formErrors.value.areaName) delete formErrors.value.areaName;
};

const initMap = async () => {
  if (!mapContainerRef.value) return;
  await loadBaiduMapSDK();
  await new Promise(r => setTimeout(r, 100));

  const BMapGL = (window as any).BMapGL;
  mapInstance = new BMapGL.Map(mapContainerRef.value, { enableMapClick: false });
  mapInstance.centerAndZoom(new BMapGL.Point(121.4737, 31.2304), 15);
  mapInstance.enableScrollWheelZoom(true);
  mapInstance.addControl(new BMapGL.ScaleControl());
  mapInstance.addControl(new BMapGL.ZoomControl());

  // 逆地理编码实例
  geoInstance = new BMapGL.Geocoder();

  // 地图点击 → 放置标记 + 反查地址
  mapInstance.addEventListener('click', (e: any) => {
    placeMarker(e.latlng.lng, e.latlng.lat);
  });

  // 预设标记
  mockLocations.forEach((loc) => {
    const m = new BMapGL.Marker(new BMapGL.Point(loc.longitude, loc.latitude));
    mapInstance.addOverlay(m);
    m.addEventListener('click', () => placeMarker(loc.longitude, loc.latitude));
  });

  // 已有申请坐标 → 直接定位到摊位地址
  if (appLatitude.value != null && appLongitude.value != null) {
    placeMarker(appLongitude.value, appLatitude.value);
    mapLoaded.value = true;
    return;
  }

  // 自动定位（百度API额度耗尽时静默失败）
  try {
    const geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition((rs: any) => {
      if (geolocation.getStatus() === 0 && rs && rs.point) {
        placeMarker(rs.point.lng, rs.point.lat);
      }
    });
  } catch { /* 百度 API 不可用时跳过自动定位 */ }

  mapLoaded.value = true;
};

// 搜索建议（Baidu Suggestion API + 防抖）
const searchSuggestions = ref<Array<{ name: string; address: string; lat: number; lng: number }>>([]);
const searchAddress = ref('');
let searchTimer: any = null;

const fetchSuggestions = () => {
  const q = searchQuery.value.trim();
  if (!q || q.length < 2) { searchSuggestions.value = []; return; }
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    try {
      const resp = await fetch(`https://api.map.baidu.com/place/v2/suggestion?query=${encodeURIComponent(q)}&region=全国&city_limit=false&ak=${BAIDU_MAP_AK}&output=json`);
      const data = await resp.json();
      if (data.status === 0 && data.result) {
        searchSuggestions.value = (data.result || []).map((r: any) => ({
          name: r.name, address: r.address || '', lat: r.location.lat, lng: r.location.lng
        }));
      }
    } catch { searchSuggestions.value = []; }
  }, 300);
};

const selectSuggestion = (item: { name: string; address: string; lat: number; lng: number }) => {
  searchQuery.value = item.name;
  searchAddress.value = item.address;
  searchSuggestions.value = [];
  placeMarker(item.lng, item.lat);
  locationName.value = item.address || item.name;
};

const searchMap = () => {
  if (!searchQuery.value.trim()) return;
  const BMapGL = (window as any).BMapGL;
  const local = new BMapGL.LocalSearch(mapInstance, {
    onSearchComplete: (results: any) => {
      if (local.getStatus() === 0 && results && results.getNumPois() > 0) {
        const first = results.getPoi(0);
        searchAddress.value = first.address || first.title;
        searchSuggestions.value = [];
        placeMarker(first.point.lng, first.point.lat);
        locationName.value = first.address || first.title;
      }
    }
  });
  local.search(searchQuery.value.trim());
};

// 打开 Modal 时初始化地图
watch(showApplyModal, (val) => {
  if (val) { setTimeout(() => initMap(), 200); }
});

const MOBILE_MODAL_BASE_WIDTH = 375;
const MOBILE_MODAL_BASE_HEIGHT = 760;
const MOBILE_MODAL_GUTTER_X = 40;
const MOBILE_MODAL_GUTTER_Y = 60;

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

const locationStore = useLocationStore();

// 加载已有申请状态（读取摊位申请地址，不影响个人定位）
const loadApplicationStatus = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || '';
    const resp = await fetch(buildApiUrl('/api/stalls/onboarding/status'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const p = await resp.json();
    if (p.success && p.data && p.data.latestApplication) {
      const app = p.data.latestApplication;
      const cs = p.data.currentStatus;
      if (cs === 'APPROVED') userStatus.value = 'active';
      else if (cs === 'NONE' || cs === 'REJECTED') userStatus.value = 'none';
      else userStatus.value = 'pending';

      // 回显所有申请字段
      if (app.applicantName) stallNameInput.value = app.applicantName;
      if (app.categoryName) selectedCategoryName.value = app.categoryName;
      if (app.selectedArea) selectedAreaName.value = app.selectedArea;
      if (app.displayAddress) {
        stallApplicationAddress.value = app.displayAddress;
        searchQuery.value = app.displayAddress;
        searchAddress.value = app.displayAddress;
      } else if (app.selectedArea) {
        stallApplicationAddress.value = app.selectedArea;
        searchQuery.value = app.selectedArea;
        searchAddress.value = app.selectedArea;
      }
      if (app.latitude != null && app.longitude != null) {
        appLatitude.value = app.latitude;
        appLongitude.value = app.longitude;
        selectedCoordinate.value = { latitude: app.latitude, longitude: app.longitude };
      }
      if (app.durationDays != null && app.durationDays > 0) {
        const preset = [7, 30, 365].includes(app.durationDays);
        if (preset) {
          durationDays.value = app.durationDays;
          isCustomDuration.value = false;
        } else {
          isCustomDuration.value = true;
          customDurationInput.value = String(app.durationDays);
        }
      }
      if (app.businessImageUrl) {
        businessImageUrl.value = app.businessImageUrl;
        businessImagePreview.value = app.businessImageUrl;
      }
      if (app.remark) {
        // 去掉旧数据中残留的坐标后缀 " | 坐标: xx.xxx, xx.xxx"
        applicationNote.value = app.remark.replace(/\s*\|\s*坐标:\s*[\d.]+,\s*[\d.]+/, '').trim();
      }
    } else {
      // 首次申请：使用首页定位的地址作为默认值
      if (locationStore.displayAddress) {
        searchQuery.value = locationStore.displayAddress;
        searchAddress.value = locationStore.displayAddress;
      }
    }
  } catch { /* ignore */ }
};

const fetchStallBanners = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/admin/banners/public/active?positions=STALL_HOT_AREA,STALL_WEEKLY,STALL_WEEKLY_CARD'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data) stallBanners.value = p.data
  } catch { }
}

let statusPollTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport);
  loadApplicationStatus();
  fetchStallBanners();
  // 审核中时每 30 秒轮询状态变化
  statusPollTimer = setInterval(() => {
    if (userStatus.value === 'pending') loadApplicationStatus()
  }, 30000)
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateViewport);
  }
  if (statusPollTimer) clearInterval(statusPollTimer);
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
        displayAddress: submittedDisplayAddress.value || selectedAreaName.value,
        businessImageUrl: businessImageUrl.value,
        note: applicationNote.value.trim() || null
      })
    });

    const payload = (await response.json()) as ApiResponse<{ applicationId: string; displayAddress?: string }>;
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || '提交申请失败');
    }

    // 保存摊位申请地址（与个人定位分离）
    if (payload.data?.displayAddress) {
      stallApplicationAddress.value = payload.data.displayAddress;
    }

    userStatus.value = 'pending';
    showToast('success', '申请已提交', '请等待平台审核');
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
        <div class="z-10 grid gap-3 md:gap-4 p-4 sm:p-6 md:p-8">
          <div class="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-center sm:justify-start sm:text-left">
            <div class="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <span class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Current Opportunities</span>
          </div>

          <div class="grid items-center gap-3 md:gap-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:items-start">
            <div class="space-y-2 md:space-y-3 text-center sm:text-left">
              <h2 class="text-[1.5rem] sm:text-[2rem] md:text-5xl font-black leading-[1.05] sm:leading-[0.92] tracking-tighter text-stone-900">
                开启你的
                <span class="text-orange-500 sm:block">烟火气生意</span>
              </h2>
              <p class="mx-auto max-w-md text-xs md:text-sm font-medium leading-relaxed text-stone-500 sm:mx-0 line-clamp-2 md:line-clamp-none">
                在热门商圈里更快找到可申请摊位、查看推荐区域，并直接进入入驻申请。
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 md:gap-2.5 lg:grid-cols-1">
              <div class="rounded-[1.2rem] md:rounded-[1.4rem] border border-orange-100 bg-orange-50/80 p-2.5 md:p-3 text-center sm:text-left">
                <p class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-500">黄金时段</p>
                <p class="mt-0.5 md:mt-1 text-xs md:text-sm font-black text-stone-900">17:00 - 22:00</p>
              </div>
              <div class="rounded-[1.2rem] md:rounded-[1.4rem] border border-stone-100 bg-stone-50 p-2.5 md:p-3 text-center sm:text-left">
                <p class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-stone-400">{{ stallApplicationAddress ? '摊位地址' : '热门商圈' }}</p>
                <p class="mt-0.5 md:mt-1 text-xs md:text-sm font-black text-stone-900 truncate max-w-[140px]">{{ stallApplicationAddress || '文化广场' }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-2 md:gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button v-if="userStatus === 'active'" disabled class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-100 px-5 py-3 text-xs md:text-sm font-black text-emerald-700 sm:w-auto cursor-not-allowed">
              ✓ 已入驻
            </button>
            <button v-else-if="userStatus === 'pending'" disabled class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-100 px-5 py-3 text-xs md:text-sm font-black text-amber-700 sm:w-auto cursor-not-allowed">
              审核中...
            </button>
            <button v-else @click.stop="handleApply" class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-xs md:text-sm font-black text-white shadow-xl shadow-stone-900/10 transition-all active:scale-95 sm:w-auto">
              立即申请入驻
              <ArrowUpRight class="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>

            <div class="grid w-full grid-cols-2 gap-2 sm:w-auto sm:min-w-[10rem] md:min-w-[12rem]">
              <div class="rounded-2xl border border-stone-100 bg-white px-2.5 py-1.5 md:px-3 md:py-2 text-center shadow-sm sm:text-left">
                <p class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400">通过率</p>
                <p class="mt-0.5 md:mt-1 text-xs md:text-sm font-black text-stone-900">92%</p>
              </div>
              <div class="rounded-2xl border border-stone-100 bg-white px-2.5 py-1.5 md:px-3 md:py-2 text-center shadow-sm sm:text-left">
                <p class="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-stone-400">步行距离</p>
                <p class="mt-0.5 md:mt-1 text-xs md:text-sm font-black text-stone-900">1.2km</p>
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

    <!-- 探索更多潜力区域 -->
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
          v-for="area in (stallBanners.STALL_HOT_AREA || []).slice(0, 2)"
          :key="area.id"
          class="group flex h-32 cursor-pointer overflow-hidden rounded-[1.9rem] border border-stone-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:h-36 sm:rounded-[2.2rem]"
        >
          <div class="relative h-full w-2/5 overflow-hidden">
            <img :src="area.imageUrl || area.image_url" :alt="area.title" class="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent"></div>
          </div>
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2 p-4 text-center sm:p-5 sm:text-left">
            <div class="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <span class="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-orange-500">Heat {{ area.tag }}</span>
              <span class="text-[9px] font-black uppercase tracking-widest text-stone-300">{{ area.subtitle }}</span>
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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div
          class="md:col-span-2 relative h-[240px] sm:h-[320px] md:h-[440px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl shadow-stone-200"
        >
          <img
            :src="(stallBanners.STALL_WEEKLY || [])[0]?.imageUrl || (stallBanners.STALL_WEEKLY || [])[0]?.image_url || 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=800&auto=format&fit=crop'"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            :alt="(stallBanners.STALL_WEEKLY || [])[0]?.title || 'Story Cover'"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          <div class="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 md:gap-3">
            <span class="px-3 py-1.5 md:px-5 md:py-2 bg-white/20 backdrop-blur-md rounded-full text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
              {{ (stallBanners.STALL_WEEKLY || [])[0]?.tag || 'Hot Story' }}
            </span>
            <span class="text-[9px] md:text-[10px] font-black text-white/60">{{ (stallBanners.STALL_WEEKLY || [])[0]?.subtitle || 'Vol. 042' }}</span>
          </div>
          <div class="absolute bottom-5 left-5 right-5 md:bottom-10 md:left-10 md:right-10 space-y-2 md:space-y-4 text-white">
            <h5 class="text-xl md:text-4xl font-black tracking-tighter leading-[1.1] md:leading-[0.95]">
              {{ (stallBanners.STALL_WEEKLY || [])[0]?.title || '如何选择最佳出摊黄金时段？' }}
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

        <div class="grid grid-cols-2 gap-3 md:block md:space-y-6">
          <div
            class="bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-stone-100 shadow-sm relative overflow-hidden group flex flex-col justify-center hover:-translate-y-2 transition-transform min-h-[140px] md:h-1/2"
          >
            <div class="absolute top-0 right-0 p-3 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight class="w-5 h-5 md:w-6 md:h-6 text-stone-900" />
            </div>
            <div class="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4 md:mb-6 shadow-inner">
              <Sparkles class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h6 class="text-[9px] md:text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-1 md:mb-2 truncate">{{ (stallBanners.STALL_WEEKLY_CARD || [])[0]?.tag || 'Visual Marketing' }}</h6>
            <h5 class="text-sm md:text-xl font-black text-stone-900 leading-tight tracking-tight line-clamp-2 md:line-clamp-none">
              {{ (stallBanners.STALL_WEEKLY_CARD || [])[0]?.title || '光影魔法：灯光布置提升门店转化率' }}
            </h5>
          </div>

          <div
            class="relative flex flex-col justify-center overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-stone-900 p-4 md:p-8 text-white transition-transform hover:-translate-y-2 min-h-[140px] md:min-h-[200px]"
          >
            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div class="absolute top-4 right-4 md:top-8 md:right-8 writing-vertical-lr grayscale opacity-20 font-black text-2xl md:text-4xl select-none">TIPS</div>
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6">
              <Zap class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h6 class="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 md:mb-2 truncate">{{ (stallBanners.STALL_WEEKLY_CARD || [])[1]?.tag || 'Inventory Control' }}</h6>
            <h5 class="text-sm md:text-xl font-black text-white leading-tight tracking-tight line-clamp-2 md:line-clamp-none">
              {{ (stallBanners.STALL_WEEKLY_CARD || [])[1]?.title || '夏季冷饮：库存损耗管理秘籍' }}
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
                        placeholder="搜索地点名称..."
                        :value="searchQuery"
                        class="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-12 text-xs font-semibold text-stone-700 outline-none focus:border-amber-300"
                        @input="e => { searchQuery = (e.target as HTMLInputElement).value; fetchSuggestions(); }"
                        @keyup.enter="searchMap"
                      />
                      <button @click="searchMap" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-amber-500 text-white px-2 py-1 text-[10px] font-bold hover:bg-amber-600">搜索</button>
                      <!-- 搜索建议下拉 -->
                      <div v-if="searchSuggestions.length" class="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                        <div v-for="(s, i) in searchSuggestions" :key="i" @click="selectSuggestion(s)"
                          class="px-3 py-2 text-xs font-medium text-stone-700 hover:bg-amber-50 cursor-pointer border-b border-stone-50 last:border-0">
                          <div class="font-bold">{{ s.name }}</div>
                          <div class="text-[10px] text-stone-400">{{ s.address }}</div>
                        </div>
                      </div>
                    </div>
                    <!-- 已选地址 -->
                    <div v-if="searchAddress" class="mt-2 text-[11px] font-bold text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
                      📍 {{ searchAddress }}
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
                      <button
                        v-for="loc in mockLocations"
                        :key="loc.name"
                        @click="selectedAreaName = loc.name; selectedCoordinate = { latitude: loc.latitude, longitude: loc.longitude }; searchAddress = loc.name"
                        :class="['rounded-full border px-3 py-1.5 text-[11px] font-bold', selectedAreaName === loc.name ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-stone-200 bg-white text-stone-500']"
                      >
                        {{ loc.name }}
                      </button>
                    </div>

                    <div ref="mapContainerRef" class="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 h-40 sm:h-52 relative">
                      <div v-if="!mapLoaded" class="absolute inset-0 flex items-center justify-center text-xs text-stone-400 bg-stone-100">地图加载中...</div>
                    </div>
                    <!-- 位置信息卡片 -->
                    <div class="mt-2 rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2">
                      <div class="flex items-center gap-1.5 mb-1">
                        <MapPin class="h-3.5 w-3.5 shrink-0" :class="locationName.includes('失败') ? 'text-red-400' : 'text-amber-500'" />
                        <p class="text-xs font-black truncate" :class="locationName.includes('失败') ? 'text-red-600' : 'text-stone-800'">{{ locationName }}</p>
                      </div>
                      <p class="text-[10px] font-bold text-stone-400">
                        经度: {{ selectedCoordinate.longitude.toFixed(6) }} &nbsp; 纬度: {{ selectedCoordinate.latitude.toFixed(6) }}
                      </p>
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

