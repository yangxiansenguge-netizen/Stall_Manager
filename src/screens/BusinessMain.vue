<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  TrendingUp, Users, ShoppingBag, ArrowUpRight, ArrowDown, Timer, CheckCircle2,
  Lightbulb, ChevronRight, Plus, Bell, Store, X, UploadCloud, Send, Settings, Trash2,
  Pencil, Coins, Package, Tags, Percent, Save, Eye,
} from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';
import robotImage from '../../机器人.png';
import lemonTeaImage from '../assets/lemon-tea.svg';
import berrySodaImage from '../assets/berry-soda.svg';
import milkTeaImage from '../assets/milk-tea.svg';
import coconutDrinkImage from '../assets/coconut-drink.svg';
import coconutLatteImage from '../assets/coconut-latte.svg';
import dianDanIcon from '../assets/点单图标.png';

const emit = defineEmits<{
  (e: 'view-change', view: 'manualOrder'): void;
  (e: 'navigate-stall'): void;
  (e: 'back'): void;
}>();

// ===== 数据状态 =====
const todayRevenue = ref('¥ --');
const todayOrders = ref('--');
const todaySold = ref('--');
const conversion = ref('--');
const revenueTrendUp = ref(true);
const revenueTrendPct = ref('--');
const yesterdayRevenueVal = ref('¥0');
const soldTrendUp = ref(true);
const soldTrendPct = ref('--');
const yesterdaySoldVal = ref('0');
const ordersTrendUp = ref(true);
const ordersTrendPct = ref('--');
const yesterdayOrdersVal = ref('0');
const revenueTrend = ref<Array<{ time: string; revenue: number }>>([]);
const yesterdayRevenueTrend = ref<Array<{ time: string; revenue: number }>>([]);
const chartKey = ref(0);
const topProducts = ref<Array<{ name: string; sales: number; revenue: number; trend: string; imageUrl: string | null }>>([]);
const aiSuggestions = ref<Array<{ title: string; value: string; description: string; type: string }>>([]);
const feedItems = ref<Array<{ id: number; type: string; time: string; content: string; amount?: string }>>([]);

interface ProductItem {
  id: number; name: string; price: number; stock: number; monthlySales: number;
  img: string; tag: string; type: string; active: boolean;
  discountPercent?: number; buyM?: number; getN?: number; description?: string;
}
const products = ref<ProductItem[]>([]);
const togglingId = ref<number | null>(null);
const trackInventory = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const editProduct = ref<ProductItem | null>(null);
const editName = ref(''); const editPrice = ref<number | null>(null);
const editType = ref(''); const editDesc = ref('');
const editDiscountMode = ref('none'); // 'none' | 'discount' | 'buyget'
const editDiscount = ref<number | null>(null);
const editBuyM = ref<number | null>(null); const editGetN = ref<number | null>(null);
const editStock = ref<number | null>(null);
const editImageInput = ref<HTMLInputElement | null>(null);
const editImageUploading = ref(false);

const MOCK_IMAGES = [lemonTeaImage, berrySodaImage, milkTeaImage, coconutDrinkImage, coconutLatteImage];

const authHeaders = () => {
  const token = localStorage.getItem('stall_auth_token') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const parseImageUrl = (raw?: string | null): string => {
  if (!raw) return '';
  try { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length > 0) return arr[0]; }
  catch { if (raw.startsWith('http')) return raw; }
  return '';
};

// ===== 收入趋势图 ApexCharts（双线） =====
const chartSeries = computed(() => [
  { name: '今日收入', data: revenueTrend.value.map(d => d.revenue) },
  { name: '昨日收入', data: yesterdayRevenueTrend.value.map(d => d.revenue) },
]);
const chartOptions = ref({
  chart: { id: 'revenue-trend', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
  stroke: { curve: 'smooth' as const, width: [3, 2], dashArray: [0, 5] },
  fill: { type: 'solid' as const, opacity: [0.15, 0.05] },
  xaxis: { categories: [] as string[], labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } }, axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4, xaxis: { lines: { show: false } } },
  tooltip: { theme: 'light' as const, y: { formatter: (val: number) => `¥${val}` } },
  colors: ['#f97316', '#6366f1'],
  dataLabels: { enabled: false },
  legend: { show: true, position: 'bottom' as const, fontSize: '12px', fontWeight: 600 },
});

// ===== 数据获取 =====
const fetchBusiness = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/dashboard/business'), { headers: authHeaders() });
    const payload = await resp.json();
    if (!payload.success || !payload.data) return;
    const d = payload.data;

    const rev = d.revenueTrend || [];
    revenueTrend.value = rev.map((r: any) => ({ time: r.time || '--', revenue: r.revenue || 0 }));
    const yest = d.yesterdayRevenueTrend || [];
    yesterdayRevenueTrend.value = yest.map((r: any) => ({ time: r.time || '--', revenue: r.revenue || 0 }));
    // 同步更新时间轴到图表
    chartOptions.value = { ...chartOptions.value, xaxis: { ...chartOptions.value.xaxis, categories: revenueTrend.value.map(d => d.time) } };
    chartKey.value++;

    topProducts.value = (d.topProducts || []).map((p: any) => ({
      name: p.name || '--', sales: p.sales || 0, revenue: p.revenue || 0,
      trend: p.trend || '0', imageUrl: parseImageUrl(p.imageUrl) || null,
    }));

    aiSuggestions.value = (d.aiSuggestions || []).map((s: any) => ({
      title: s.title || '', value: s.value || '', description: s.description || '', type: s.type || 'info',
    }));

    // 今日数据（顶部展示）
    todayRevenue.value = d.todayRevenue || '¥ --';
    todaySold.value = d.todaySold || '--';
    todayOrders.value = d.todayOrders || '--';

    const kpis = d.kpis || [];
    if (kpis.length >= 1) { yesterdayRevenueVal.value = kpis[0].value || '¥0'; revenueTrendUp.value = kpis[0].trendUp !== false; revenueTrendPct.value = kpis[0].trend || '--'; }
    if (kpis.length >= 2) { yesterdaySoldVal.value = kpis[1].value || '0'; soldTrendUp.value = kpis[1].trendUp !== false; soldTrendPct.value = kpis[1].trend || '--'; }
    if (kpis.length >= 3) { yesterdayOrdersVal.value = kpis[2].value || '0'; ordersTrendUp.value = kpis[2].trendUp !== false; ordersTrendPct.value = kpis[2].trend || '--'; }
    if (kpis.length >= 4) conversion.value = kpis[3].value || '--';

    feedItems.value = [
      { id: 1, type: 'order', time: '刚刚', content: `今日已售 ${todaySold.value} 件`, amount: todayRevenue.value },
      { id: 2, type: 'user', time: '实时', content: '经营看板已接入实时数据' },
      { id: 3, type: 'complete', time: '今日', content: `已完成 ${todayOrders.value} 笔订单` },
    ];
  } catch { /* keep defaults */ }
};

const fetchProducts = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/products/summary'), { headers: authHeaders() });
    const payload = await resp.json();
    if (!payload.success || !payload.data) return;
    products.value = (payload.data.products || []).map((p: any, i: number) => ({
      id: p.id, name: p.name, price: p.price || 0, stock: p.stock || 0,
      monthlySales: p.monthlySales || 0, tag: p.tag || '常规', type: p.type || '其他',
      img: parseImageUrl(p.imageUrl) || MOCK_IMAGES[i % MOCK_IMAGES.length],
      active: p.status !== 'INACTIVE',
      discountPercent: p.discountPercent, buyM: p.buyM, getN: p.getN, description: p.description,
    }));
  } catch { /* keep defaults */ }
};

// ===== 商品 toggle =====
const toggleProduct = async (product: ProductItem) => {
  if (togglingId.value) return;
  togglingId.value = product.id;
  try {
    const resp = await fetch(buildApiUrl(`/api/products/${product.id}/toggle`), {
      method: 'PUT', headers: authHeaders(),
    });
    const payload = await resp.json();
    if (payload.success) {
      product.active = !product.active;
      showToast('success', product.active ? '已上架' : '已下架', product.name);
      await fetchProducts();
    }
  } catch { showToast('error', '操作失败', '请稍后重试'); }
  finally { togglingId.value = null; }
};

// ===== 上架商品弹窗 =====
const showStallDialog = ref(false);

const checkStall = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/stalls/onboarding/status'), { headers: authHeaders() });
    const payload = await resp.json();
    return !(payload.success && payload.data && payload.data.currentStatus === 'NONE');
  } catch { return true; }
};

const showAddModal = ref(false);
const addName = ref('');
const addType = ref('小吃');
const addPrice = ref<number | null>(null);
const addStock = ref<number | null>(null);
const addDesc = ref('');
const addImagePreview = ref('');
const addImageUrl = ref('');
const addUploading = ref(false);
const addSubmitting = ref(false);
const addImageInput = ref<HTMLInputElement | null>(null);

const addProductTypes = computed(() => {
  const types = [...new Set(products.value.map(p => p.type).filter(Boolean))];
  return types.length ? types : ['小吃', '饮品', '甜品', '手工饰品', '其他'];
});

const openAddModal = async () => {
  const ok = await checkStall();
  if (!ok) { showStallDialog.value = true; return; }
  addName.value = ''; addType.value = addProductTypes.value[0]; addPrice.value = null;
  addStock.value = null; addDesc.value = ''; addImagePreview.value = ''; addImageUrl.value = '';
  showAddModal.value = true;
};

const triggerAddImage = () => addImageInput.value?.click();

const onAddImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('error', '上传失败', '图片不能超过 5MB'); return; }
  addImagePreview.value = URL.createObjectURL(file);
  addUploading.value = true;
  try {
    const fd = new FormData(); fd.append('file', file);
    const token = localStorage.getItem('stall_auth_token') || '';
    const resp = await fetch(buildApiUrl('/api/common/upload'), { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const r = await resp.json();
    if (r.code === 200 || r.success) { addImageUrl.value = r.data; }
    else throw new Error(r.message || '上传失败');
  } catch (err: any) { showToast('error', '上传失败', err.message); addImagePreview.value = ''; }
  finally { addUploading.value = false; if (addImageInput.value) addImageInput.value.value = ''; }
};

const submitAddProduct = async () => {
  if (!addName.value.trim()) { showToast('error', '上架失败', '请输入商品名称'); return; }
  const price = Number(addPrice.value || 0);
  if (price <= 0) { showToast('error', '上架失败', '请输入有效价格'); return; }
  const stock = Number(addStock.value || 0);
  if (trackInventory.value && stock < 0) { showToast('error', '上架失败', '库存不能小于0'); return; }
  if (!addImageUrl.value) { showToast('error', '上架失败', '请上传商品图片'); return; }

  addSubmitting.value = true;
  try {
    const resp = await fetch(buildApiUrl('/api/products'), {
      method: 'POST', headers: authHeaders(),
      body: JSON.stringify({ name: addName.value.trim(), type: addType.value, price, stock, description: addDesc.value.trim() || null, imageUrls: [addImageUrl.value] }),
    });
    const payload = await resp.json();
    if (!resp.ok || !payload.success) throw new Error(payload.message || '上架失败');
    showAddModal.value = false;
    showToast('success', '上架成功', addName.value.trim());
    await fetchProducts();
  } catch (err: any) { showToast('error', '上架失败', err.message); }
  finally { addSubmitting.value = false; }
};

const fetchTrackInventory = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/settings/overview'), { headers: authHeaders() });
    const payload = await resp.json();
    if (payload.success && payload.data?.profile) {
      trackInventory.value = payload.data.profile.trackInventory === true;
    }
  } catch { /* default false */ }
};

const openEdit = (p: ProductItem) => {
  editProduct.value = p; editName.value = p.name; editPrice.value = p.price;
  editStock.value = trackInventory.value ? (p.stock || 0) : null;
  editType.value = p.type; editDesc.value = p.description || '';
  if (p.discountPercent) { editDiscountMode.value = 'discount'; editDiscount.value = p.discountPercent; editBuyM.value = null; editGetN.value = null; }
  else if (p.buyM && p.getN) { editDiscountMode.value = 'buyget'; editDiscount.value = null; editBuyM.value = p.buyM; editGetN.value = p.getN; }
  else { editDiscountMode.value = 'none'; editDiscount.value = null; editBuyM.value = null; editGetN.value = null; }
  editBuyM.value = p.buyM || null; editGetN.value = p.getN || null;
  showEditModal.value = true;
};

const triggerEditImage = () => editImageInput.value?.click();

const onEditImageChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('error', '上传失败', '图片不能超过 5MB'); return; }
  editImageUploading.value = true;
  try {
    const fd = new FormData(); fd.append('file', file);
    const token = localStorage.getItem('stall_auth_token') || '';
    const resp = await fetch(buildApiUrl('/api/common/upload'), { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
    const r = await resp.json();
    if (r.code === 200 || r.success) {
      if (editProduct.value) editProduct.value.img = r.data;
      showToast('success', '上传成功', '图片已更换');
    } else throw new Error(r.message || '上传失败');
  } catch (err: any) { showToast('error', '上传失败', err.message); }
  finally { editImageUploading.value = false; if (editImageInput.value) editImageInput.value.value = ''; }
};

const submitEdit = async () => {
  if (!editProduct.value) return;
  try {
    const resp = await fetch(buildApiUrl(`/api/products/${editProduct.value.id}`), {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({ name: editName.value.trim(), price: Number(editPrice.value || 0), stock: trackInventory.value ? Number(editStock.value || 0) : null, description: editDesc.value.trim() || null, discountPercent: editDiscountMode.value === 'discount' ? editDiscount.value : null, buyM: editDiscountMode.value === 'buyget' ? editBuyM.value : null, getN: editDiscountMode.value === 'buyget' ? editGetN.value : null, imageUrls: editProduct.value?.img ? [editProduct.value.img] : null }),
    });
    const p = await resp.json();
    if (p.success) { showEditModal.value = false; showToast('success', '已更新', editName.value); await fetchProducts(); }
    else throw new Error(p.message);
  } catch { showToast('error', '更新失败', ''); }
};

const confirmDelete = async () => {
  if (!editProduct.value) return;
  try {
    const resp = await fetch(buildApiUrl(`/api/products/${editProduct.value.id}`), { method: 'DELETE', headers: authHeaders() });
    const p = await resp.json();
    if (p.success) { showDeleteConfirm.value = false; showToast('success', '已删除', editProduct.value.name); await fetchProducts(); }
    else throw new Error(p.message);
  } catch { showToast('error', '删除失败', ''); }
};

const openDelete = (p: ProductItem) => { editProduct.value = p; showDeleteConfirm.value = true; };

const goToAI = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/stalls/onboarding/status'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data?.currentStatus === 'NONE') {
      showToast('error', '暂无摊位', '请先申请入驻摊位后再使用 AI 分析')
      return
    }
  } catch { /* 后端不通也允许进入 */ }
  router.push('/ai')
};

const discountedPrice = (p: ProductItem) => p.discountPercent ? (p.price * p.discountPercent / 100).toFixed(2) : p.price;

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  await fetchBusiness(); await fetchProducts(); await fetchTrackInventory();
  // 从 Dashboard 快捷按钮跳转时自动打开上架弹窗
  if (route.query.add === 'true') {
    openAddModal();
  }
});

const productColors = ['bg-orange-50', 'bg-red-50', 'bg-amber-50', 'bg-emerald-50', 'bg-blue-50', 'bg-purple-50', 'bg-rose-50', 'bg-cyan-50'];
</script>

<template>
  <div class="min-h-screen bg-[#fdfaf8] text-slate-900 font-sans space-y-5 sm:space-y-6 pb-8">
    <!-- ===== 区块 1：顶部概览 + AI 助手 ===== -->
    <section class="bg-gradient-to-br from-orange-50/50 to-amber-100/30 rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-6 sm:gap-10">
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute -top-20 -left-20 w-80 h-80 bg-orange-200/20 blur-[100px] rounded-full" />
        <div class="absolute top-40 right-20 w-64 h-64 bg-blue-100/30 blur-[80px] rounded-full" />
      </div>

      <div class="flex-1 z-10 w-full">
        <h2 class="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">今天生意 还不错哦！</h2>
        <p class="text-slate-500 text-xs sm:text-sm mt-1">经营数据实时更新中</p>
        <div class="mt-6 sm:mt-10">
          <div class="flex items-baseline gap-2 sm:gap-3">
            <span class="text-orange-500 text-xl sm:text-2xl font-black">¥</span>
            <span class="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">{{ todayRevenue.replace('¥', '') }}</span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
          </div>
          <p class="text-slate-400 text-xs sm:text-sm font-bold tracking-widest uppercase mt-2">预计今日收入</p>
        </div>
        <div class="flex flex-wrap gap-3 sm:gap-4 mt-5 sm:mt-6">
          <div class="px-4 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[28px] bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col gap-1 transition-all hover:bg-white/60 hover:shadow-md">
            <div class="flex items-center gap-2">
              <ShoppingBag class="w-4 h-4 text-orange-500" />
              <span class="text-base sm:text-lg font-black text-slate-800">{{ todaySold }}</span>
            </div>
            <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">售出商品</span>
          </div>
          <div class="px-4 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[28px] bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col gap-1 transition-all hover:bg-white/60 hover:shadow-md">
            <div class="flex items-center gap-2">
              <Store class="w-4 h-4 text-blue-500" />
              <span class="text-base sm:text-lg font-black text-slate-800">{{ todayOrders }}</span>
            </div>
            <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">订单数</span>
          </div>
          <div class="px-4 sm:px-6 py-3 sm:py-4 rounded-[20px] sm:rounded-[28px] bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col gap-1 transition-all hover:bg-white/60 hover:shadow-md">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-purple-500" />
              <span class="text-base sm:text-lg font-black text-slate-800">{{ conversion }}</span>
            </div>
            <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">转化率</span>
          </div>
        </div>
      </div>

      <div class="flex-1 lg:max-w-md relative z-10 w-full">
        <div class="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-xl shadow-orange-100/20">
          <div class="flex items-center gap-3 mb-4 sm:mb-5">
            <span class="bg-green-100/80 text-green-700 text-[10px] sm:text-[11px] px-3 py-1 rounded-full font-black flex items-center gap-2 border border-green-200/50 backdrop-blur-md">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />智能管家在线
            </span>
          </div>
          <div class="space-y-3 sm:space-y-4">
            <template v-if="aiSuggestions.length">
              <p v-for="(s, i) in aiSuggestions.slice(0, 2)" :key="i" class="text-sm text-slate-600 leading-relaxed font-medium">
                <Lightbulb class="h-4 w-4 inline text-amber-500 mr-1" />{{ s.title }}：{{ s.description }}
              </p>
            </template>
            <template v-else>
              <p class="text-sm text-slate-600 leading-relaxed font-medium">根据近期营收趋势，系统正在分析最佳经营策略。</p>
              <p class="text-xs text-slate-400 leading-relaxed">建议保持热销商品库存充足，关注晚间高峰时段。</p>
            </template>
          </div>
          <button @click="goToAI" class="mt-5 sm:mt-8 w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-3 sm:py-4 text-xs sm:text-sm font-black transition-all shadow-lg shadow-orange-400/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
            查收经营建议 <ChevronRight class="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div class="hidden xl:block w-36 sm:w-48 relative self-end">
        <img :src="robotImage" alt="AI Robot" class="w-full object-contain drop-shadow-2xl translate-y-4 scale-125 hover:scale-[1.35] transition-transform duration-500" />
      </div>
    </section>

    <!-- ===== 区块 2：收入趋势图 + 经营建议 ===== -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
      <div class="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 shadow-sm border border-blue-100/50">
        <h2 class="text-base sm:text-lg font-semibold mb-5 sm:mb-8">今日收入趋势</h2>
        <div class="h-[200px] sm:h-[260px] w-full">
          <VueApexCharts v-if="revenueTrend.length" :key="chartKey" :options="chartOptions as any" :series="chartSeries" type="area" height="100%" />
          <div v-else class="flex items-center justify-center h-full text-slate-300 text-sm">暂无趋势数据</div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5 sm:mt-8">
          <div class="p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-transparent hover:border-slate-100 transition-all bg-blue-50/50">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Store class="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" /></div>
            <div>
              <p class="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">昨日营收</p>
              <div class="flex items-center gap-1">
                <p class="text-xs sm:text-sm font-bold text-slate-700">{{ yesterdayRevenueVal }}</p>
                <span :class="['flex items-center text-[10px] font-bold', revenueTrendUp ? 'text-emerald-500' : 'text-rose-500']">
                  <ArrowUpRight v-if="revenueTrendUp" class="w-3 h-3" /><ArrowDown v-else class="w-3 h-3" />{{ revenueTrendPct }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-transparent hover:border-slate-100 transition-all bg-orange-50/50">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Bell class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" /></div>
            <div>
              <p class="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">售出商品</p>
              <div class="flex items-center gap-1">
                <p class="text-xs sm:text-sm font-bold text-slate-700">{{ yesterdaySoldVal }}</p>
                <span :class="['flex items-center text-[10px] font-bold', soldTrendUp ? 'text-emerald-500' : 'text-rose-500']">
                  <ArrowUpRight v-if="soldTrendUp" class="w-3 h-3" /><ArrowDown v-else class="w-3 h-3" />{{ soldTrendPct }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-transparent hover:border-slate-100 transition-all bg-green-50/50">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><TrendingUp class="w-4 h-4 sm:w-5 sm:h-5 text-green-500" /></div>
            <div>
              <p class="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">订单数</p>
              <div class="flex items-center gap-1">
                <p class="text-xs sm:text-sm font-bold text-slate-700">{{ yesterdayOrdersVal }}</p>
                <span :class="['flex items-center text-[10px] font-bold', ordersTrendUp ? 'text-emerald-500' : 'text-rose-500']">
                  <ArrowUpRight v-if="ordersTrendUp" class="w-3 h-3" /><ArrowDown v-else class="w-3 h-3" />{{ ordersTrendPct }}
                </span>
              </div>
            </div>
          </div>
          <div class="p-3 sm:p-4 rounded-2xl flex items-center gap-3 sm:gap-4 border border-transparent hover:border-slate-100 transition-all bg-orange-50/50">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Timer class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" /></div>
            <div>
              <p class="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider">预计高峰</p>
              <p class="text-xs sm:text-sm font-bold text-slate-700">18:00</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/60 backdrop-blur-xl rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 shadow-sm border border-indigo-100/50">
        <h2 class="text-base sm:text-lg font-semibold flex items-center gap-2 mb-5 sm:mb-6">今日经营建议</h2>
        <div class="space-y-3 sm:space-y-4">
          <template v-if="aiSuggestions.length">
            <div v-for="(item, i) in aiSuggestions.slice(0, 4)" :key="i"
              class="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm',
                  i === 0 ? 'bg-blue-50 text-blue-500' : i === 1 ? 'bg-orange-50 text-orange-500' : i === 2 ? 'bg-purple-50 text-purple-500' : 'bg-red-50 text-red-500']">
                  <component :is="i === 0 ? Users : i === 1 ? TrendingUp : i === 2 ? ShoppingBag : Bell" class="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{{ item.title }}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{{ item.description }}</p>
                </div>
              </div>
              <span :class="['text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0',
                i === 0 ? 'bg-green-50 text-green-600' : i === 1 ? 'bg-orange-50 text-orange-600' : i === 2 ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600']">
                {{ item.value || '建议' }}
              </span>
            </div>
          </template>
          <template v-else>
            <div v-for="(item, i) in [
              { title: '关注热销品库存', desc: '确保热销商品库存充足', status: '需关注', type: 0 },
              { title: '午高峰客流良好', desc: '转化率较高，建议保持', status: '良好', type: 1 },
              { title: '建议开启促销', desc: '可提升晚间转化率', status: '需处理', type: 2 },
              { title: '预计晚高峰回流', desc: '建议提前备货', status: '进行中', type: 3 },
            ]" :key="i"
              class="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <div class="flex items-center gap-3">
                <div :class="['w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm',
                  item.type === 0 ? 'bg-blue-50 text-blue-500' : item.type === 1 ? 'bg-orange-50 text-orange-500' : item.type === 2 ? 'bg-purple-50 text-purple-500' : 'bg-red-50 text-red-500']">
                  <component :is="item.type === 0 ? Users : item.type === 1 ? TrendingUp : item.type === 2 ? ShoppingBag : Bell" class="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">{{ item.title }}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5">{{ item.desc }}</p>
                </div>
              </div>
              <span :class="['text-[10px] px-2 py-0.5 rounded-md font-bold shrink-0',
                item.type === 0 ? 'bg-green-50 text-green-600' : item.type === 1 ? 'bg-orange-50 text-orange-600' : item.type === 2 ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600']">
                {{ item.status }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- ===== 区块 3：热销 TOP 5 + 实时动态 ===== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      <div class="bg-[#fff9f5]/60 backdrop-blur-xl rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 shadow-sm border border-orange-100/50">
        <div class="flex justify-between items-center mb-5 sm:mb-6">
          <h2 class="text-base sm:text-lg font-semibold">热销商品 TOP 5</h2>
          <span class="flex items-center gap-1 text-xs text-green-500 font-bold"><span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />实时更新</span>
        </div>
        <div class="space-y-3 sm:space-y-4">
          <template v-if="topProducts.length">
            <div v-for="(p, i) in topProducts.slice(0, 5)" :key="i"
              class="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-all">
              <div class="flex items-center gap-3 sm:gap-4">
                <div :class="['w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm',
                  i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400']">{{ i + 1 }}</div>
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                  <img v-if="p.imageUrl" :src="p.imageUrl" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <ShoppingBag v-else class="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{{ p.name }}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5">今日销量 {{ p.sales }} 件</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs sm:text-sm font-black">¥{{ Number(p.revenue).toFixed(2) }}</p>
                <p class="text-[10px] text-red-500 font-black flex items-center justify-end gap-1">
                  <ArrowUpRight class="w-3 h-3" />{{ p.trend }}
                </p>
              </div>
            </div>
          </template>
          <div v-else class="text-center py-8 text-slate-300 text-sm">暂无销售数据</div>
        </div>
      </div>

      <div class="bg-[#fcfcff]/60 backdrop-blur-xl rounded-[32px] sm:rounded-[48px] p-5 sm:p-8 shadow-sm border border-slate-200/50">
        <div class="flex justify-between items-center mb-5 sm:mb-6">
          <h2 class="text-base sm:text-lg font-semibold">实时动态</h2>
          <span class="flex items-center gap-1 text-xs text-green-500 font-bold"><span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />在线</span>
        </div>
        <div class="space-y-5 sm:space-y-6">
          <div v-for="(item, i) in feedItems" :key="i" class="flex gap-3 sm:gap-4 group">
            <div class="flex flex-col items-center">
              <div :class="['w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm z-10 bg-white border border-slate-100',
                item.type === 'order' ? 'text-orange-500' : item.type === 'user' ? 'text-blue-500' : 'text-green-500']">
                <component :is="item.type === 'order' ? ShoppingBag : item.type === 'user' ? Users : CheckCircle2" class="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div class="flex-1 pb-3 sm:pb-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-800">{{ item.content }}</h4>
                  <p class="text-[10px] text-slate-400 mt-1">系统 · {{ item.time }}</p>
                </div>
                <span v-if="item.amount" class="text-xs sm:text-sm font-bold text-slate-800">{{ item.amount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 区块 4：商品管理 ===== -->
    <section class="bg-white/80 backdrop-blur-xl rounded-[32px] sm:rounded-[48px] p-5 sm:p-10 shadow-sm border border-slate-100">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-3">
            商品管理
            <span class="h-4 w-px bg-slate-200 hidden md:block" />
            <span class="text-xs font-bold text-slate-400">高效管理实时库存与售价</span>
          </h2>
        </div>
        <div class="flex items-center gap-3 sm:gap-4">
          <button
            @click="emit('view-change', 'manualOrder')"
            class="transition-all hover:scale-105 active:scale-95"
          >
            <img :src="dianDanIcon" alt="手动点单" class="h-10 sm:h-12 object-contain" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
        <div v-for="(p, i) in products" :key="p.id"
          class="group bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 border border-slate-50 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/50 transition-all relative"
        >
          <span v-if="p.tag === '热销'" class="absolute -top-2 sm:-top-3 left-4 sm:left-6 bg-red-500 text-white text-[9px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-black shadow-lg z-10">HOT</span>
          <div :class="['aspect-square rounded-[20px] sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-5 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden', productColors[i % productColors.length]]">
            <img :src="p.img" :alt="p.name" class="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h4 class="text-xs sm:text-sm font-black text-slate-800 truncate mb-1 sm:mb-1.5">{{ p.name }}</h4>
          <div v-if="p.discountPercent || (p.buyM && p.getN)" class="mb-1">
            <span v-if="p.discountPercent" class="text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5">{{ (p.discountPercent / 10) }}折</span>
            <span v-if="p.buyM && p.getN" class="text-[10px] font-bold text-white bg-orange-500 rounded-full px-1.5 py-0.5" :class="p.discountPercent ? 'ml-1' : ''">买{{ p.buyM }}送{{ p.getN }}</span>
          </div>
          <div class="flex items-center justify-between mt-2 sm:mt-3">
            <div>
              <div class="flex items-baseline gap-1">
                <p v-if="p.discountPercent" class="text-xs text-slate-400 line-through">¥{{ Number(p.price).toFixed(2) }}</p>
                <p class="text-sm sm:text-base font-black text-slate-900 tracking-tight">¥{{ discountedPrice(p) }}</p>
              </div>
              <p v-if="trackInventory && p.stock > 0" class="text-[9px] sm:text-[10px] font-bold text-slate-400 mt-0.5">剩余 {{ p.stock }} 件</p>
              <p v-else-if="trackInventory" class="text-[9px] sm:text-[10px] font-bold text-amber-600 mt-0.5">请盘点并填入库存</p>
            </div>
            <div class="flex items-center gap-1">
              <button @click.stop="openEdit(p)" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><Settings class="h-3.5 w-3.5" /></button>
              <button @click.stop="openDelete(p)" class="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 class="h-3.5 w-3.5" /></button>
              <div
                @click.stop="toggleProduct(p)"
                :class="['w-9 sm:w-10 h-5 rounded-full relative cursor-pointer transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
                  p.active ? 'bg-green-500' : 'bg-slate-300']"
              >
                <div :class="['absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-200',
                  p.active ? 'right-1' : 'left-1']" />
              </div>
            </div>
          </div>
        </div>

        <button
          @click="openAddModal"
          class="group border-2 border-dashed border-slate-100 rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 flex flex-col items-center justify-center gap-3 sm:gap-4 hover:border-orange-200 hover:bg-orange-50/10 transition-all duration-300 min-h-[200px]"
        >
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-500">
            <Plus class="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 group-hover:text-orange-500 transform group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span class="text-xs font-black text-slate-400 group-hover:text-orange-600 tracking-widest uppercase">上架商品</span>
        </button>
      </div>
    </section>

    <!-- ===== 未申请摊位提示弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showStallDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showStallDialog = false">
          <div class="w-full max-w-sm rounded-[28px] bg-white shadow-2xl p-6 text-center">
            <Store class="mx-auto h-10 w-10 text-amber-400 mb-3" />
            <h3 class="text-lg font-black text-stone-800 mb-2">请先申请摊位</h3>
            <p class="text-sm text-stone-500 mb-5">您还没有申请摊位，无法上架商品。是否前往申请摊位页面？</p>
            <div class="flex gap-3">
              <button @click="showStallDialog = false" class="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-bold text-stone-500 hover:bg-stone-50">取消</button>
              <button @click="showStallDialog = false; emit('navigate-stall')" class="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-black text-white hover:bg-amber-600 transition-colors">前往申请摊位</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== 上架商品弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 lg:p-8" @click.self="showAddModal = false">
          <div class="bg-white rounded-[2.5rem] w-full max-w-5xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <!-- 左：表单 -->
            <div class="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
              <header class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200"><Package :size="24" /></div>
                  <div>
                    <h1 class="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">上架商品</h1>
                    <p class="text-gray-400 text-sm font-medium">填写商品信息，让您的货架充满惊喜</p>
                  </div>
                </div>
                <button @click="showAddModal = false" class="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><X :size="20" /></button>
              </header>

              <div class="space-y-6">
                <!-- 图片上传 -->
                <div class="space-y-2">
                  <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">商品图片 <span class="w-1.5 h-1.5 bg-orange-500 rounded-full" /></label>
                  <input ref="addImageInput" type="file" accept="image/*" class="hidden" @change="onAddImageChange" />
                  <div @click="triggerAddImage" class="cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-orange-300 hover:bg-orange-50/30 transition-all" :class="addImagePreview ? 'border-emerald-200 bg-emerald-50/20' : ''">
                    <template v-if="addUploading">
                      <div class="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /><p class="text-xs font-bold text-slate-500">上传中...</p>
                    </template>
                    <template v-else-if="addImagePreview">
                      <img :src="addImagePreview" class="h-32 object-cover rounded-2xl" /><p class="text-[10px] font-bold text-emerald-600">已上传，点击更换</p>
                    </template>
                    <template v-else>
                      <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500"><UploadCloud :size="24" /></div>
                      <div class="text-center"><p class="text-sm font-bold text-gray-900">点击上传商品图片</p><p class="text-xs text-gray-400 mt-1">JPG/PNG，最大 5MB</p></div>
                    </template>
                  </div>
                </div>

                <!-- 名称 -->
                <div class="space-y-2">
                  <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">商品名称 <span class="w-1.5 h-1.5 bg-orange-500 rounded-full" /></label>
                  <div class="relative">
                    <input v-model="addName" maxlength="20" class="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none font-medium text-gray-900 placeholder:text-gray-300 shadow-sm" placeholder="例如：招牌手打柠檬茶" />
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">{{ addName.length }}/20</span>
                  </div>
                </div>

                <!-- 分类 + 单价 + 库存 -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">分类</label>
                    <select v-model="addType" class="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none font-medium shadow-sm appearance-none">
                      <option v-for="t in addProductTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">单价</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-black text-lg">¥</span>
                      <input v-model.number="addPrice" type="number" min="1" class="w-full h-12 pl-10 pr-4 bg-white border border-gray-100 rounded-2xl focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none font-bold text-orange-600 shadow-sm placeholder:text-gray-200" placeholder="0.00" />
                    </div>
                  </div>
                  <div v-if="trackInventory" class="space-y-2">
                    <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">库存</label>
                    <div class="relative">
                      <input v-model.number="addStock" type="number" min="0" class="w-full h-12 px-4 bg-white border border-gray-100 rounded-2xl focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none font-bold shadow-sm placeholder:text-gray-200" placeholder="99" />
                    </div>
                  </div>
                  <div v-else class="space-y-2" /> <!-- 占位 -->
                </div>

                <!-- 描述 -->
                <div class="space-y-2">
                  <label class="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">商品描述</label>
                  <div class="relative">
                    <textarea v-model="addDesc" rows="3" maxlength="200" class="w-full p-4 bg-white border border-gray-100 rounded-3xl focus:border-orange-300 focus:ring-4 focus:ring-orange-50 outline-none resize-none font-medium leading-relaxed shadow-sm placeholder:text-gray-300" placeholder="描述商品特色..." />
                    <span class="absolute right-4 bottom-4 text-[10px] font-black text-gray-300">{{ addDesc.length }}/200</span>
                  </div>
                </div>
              </div>

              <footer class="mt-8 flex gap-4">
                <button @click="showAddModal = false" class="flex-1 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">取消</button>
                <button @click="submitAddProduct" :disabled="addSubmitting" class="flex-[2] h-12 rounded-2xl bg-orange-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_10px_20px_-5px_rgba(249,115,22,0.3)] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60">
                  <Send :size="18" />{{ addSubmitting ? '提交中...' : '确认上架' }}
                </button>
              </footer>
            </div>

            <!-- 右：预览卡片 -->
            <div class="w-full lg:w-[380px] bg-gradient-to-b from-orange-50/40 to-white p-6 sm:p-8 lg:p-10 flex flex-col relative shrink-0 border-t lg:border-t-0 lg:border-l border-gray-50">
              <div class="mb-6 space-y-1">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center"><Eye :size="16" /></div>
                  <h2 class="text-lg font-black text-gray-900 tracking-tight">实时预览</h2>
                </div>
                <p class="text-xs text-gray-400 font-medium">买家视角的商品卡片</p>
              </div>

              <div class="bg-white rounded-2xl shadow-lg border border-gray-50 p-4 flex flex-col gap-4 flex-1">
                <div class="aspect-square bg-gray-50 rounded-xl overflow-hidden relative">
                  <template v-if="addImagePreview">
                    <img :src="addImagePreview" alt="Preview" class="w-full h-full object-cover" />
                  </template>
                  <template v-else>
                    <div class="w-full h-full flex items-center justify-center text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"><UploadCloud :size="48" /></div>
                  </template>
                  <div v-if="addImagePreview" class="absolute bottom-4 left-4 px-3 py-1.5 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col">
                    <span class="text-[9px] font-black text-gray-400 uppercase">单价</span>
                    <span class="text-lg font-black text-orange-500">¥{{ addPrice || '0.00' }}</span>
                  </div>
                </div>
                <div class="space-y-1.5">
                  <h3 class="text-lg font-black text-gray-900 leading-tight line-clamp-2">{{ addName || '待输入的精致商品' }}</h3>
                  <span v-if="addType" class="inline-flex px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">{{ addType }}</span>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed line-clamp-3">{{ addDesc || '故事从这里开始... 每一件商品都有其独特的灵魂与温度。' }}</p>
                <div class="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"><Package :size="12" /></div>
                    <span class="text-[10px] font-bold text-gray-400">{{ trackInventory ? (addStock || '0') + ' 件' : '无限库存' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <!-- ===== 编辑商品弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showEditModal = false">
          <div class="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="relative px-6 sm:px-8 py-6 overflow-hidden shrink-0">
              <div class="absolute inset-0 bg-gradient-to-r from-orange-50/60 to-rose-50/40" />
              <div class="relative flex items-center justify-between">
                <div>
                  <h3 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">编辑商品详情</h3>
                  <p class="text-xs text-orange-500 font-medium mt-1 uppercase tracking-widest">{{ editProduct?.name }}</p>
                </div>
                <button @click="showEditModal = false" class="p-2 hover:bg-white/80 rounded-full transition-all text-slate-400 hover:text-rose-500"><X :size="22" /></button>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 sm:px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <!-- 商品图片（可重新上传） -->
              <div class="flex gap-4">
                <input ref="editImageInput" type="file" accept="image/*" class="hidden" @change="onEditImageChange" />
                <div class="w-20 h-20 rounded-2xl overflow-hidden border-4 border-orange-500/20 shadow-lg shrink-0 relative group cursor-pointer" @click="triggerEditImage">
                  <img v-if="editProduct?.img" :src="editProduct.img" :alt="editProduct?.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div v-else class="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><UploadCloud :size="24" /></div>
                  <div v-if="editImageUploading" class="absolute inset-0 bg-black/40 flex items-center justify-center"><div class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /></div>
                  <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Pencil class="text-white" :size="18" /></div>
                </div>
                <div class="flex-1 flex flex-col justify-center">
                  <div class="text-sm font-bold text-slate-600 flex items-center gap-1.5"><span class="w-1 h-4 bg-orange-500 rounded-full inline-block" />商品图片</div>
                  <p class="text-xs text-slate-400 mt-1">点击左侧图片重新上传</p>
                </div>
              </div>

              <!-- 名称 -->
              <div>
                <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2"><div class="w-1.5 h-4 bg-orange-500 rounded-full" />商品名称</label>
                <div class="relative">
                  <input v-model="editName" maxlength="20" class="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-100/50 focus:border-orange-500 outline-none transition-all font-medium text-slate-700" placeholder="请输入商品名称" />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">{{ editName.length }}/20</span>
                </div>
              </div>

              <!-- 单价 + 分类 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2"><Coins :size="16" class="text-orange-500" />商品单价</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 font-bold">¥</span>
                    <input v-model.number="editPrice" type="number" min="1" class="w-full pl-8 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-orange-100/50 focus:border-orange-500 outline-none transition-all font-bold text-slate-700" />
                  </div>
                </div>
                <div>
                  <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2"><Package :size="16" class="text-teal-500" />商品分类</label>
                  <select v-model="editType" class="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-100/50 focus:border-teal-500 outline-none transition-all font-medium text-slate-700 appearance-none bg-white">
                    <option v-for="t in addProductTypes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
              </div>

              <!-- 库存（仅开启记录时显示） -->
              <div v-if="trackInventory">
                <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2"><Package :size="16" class="text-teal-500" />库存数量</label>
                <input v-model.number="editStock" type="number" min="0" class="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-teal-100/50 focus:border-teal-500 outline-none transition-all font-bold text-slate-700" placeholder="请输入库存数量" />
              </div>

              <!-- 优惠方式卡片选择 -->
              <div class="pt-2 border-t border-slate-50">
                <label class="flex items-center gap-2 text-sm font-bold text-slate-600 mb-4"><div class="w-1.5 h-4 bg-rose-500 rounded-full" />优惠详情</label>
                <div class="grid grid-cols-3 gap-3">
                  <button @click="editDiscountMode = 'none'; editDiscount = null; editBuyM = null; editGetN = null"
                    :class="['relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group overflow-hidden',
                      editDiscountMode === 'none' ? 'border-slate-500 bg-slate-50 ring-4 ring-slate-50 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200']">
                    <div class="p-2.5 rounded-2xl bg-white shadow-sm"><X :size="18" class="text-slate-400" /></div>
                    <span :class="['text-[10px] font-black uppercase tracking-widest', editDiscountMode === 'none' ? 'text-slate-600' : 'text-slate-400']">无优惠</span>
                  </button>
                  <button @click="editDiscountMode = 'discount'; editBuyM = null; editGetN = null"
                    :class="['relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group overflow-hidden',
                      editDiscountMode === 'discount' ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-50 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200']">
                    <div class="p-2.5 rounded-2xl bg-white shadow-sm"><Percent :size="18" class="text-orange-500" /></div>
                    <span :class="['text-[10px] font-black uppercase tracking-widest', editDiscountMode === 'discount' ? 'text-orange-600' : 'text-slate-400']">打折优惠</span>
                  </button>
                  <button @click="editDiscountMode = 'buyget'; editDiscount = null"
                    :class="['relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 group overflow-hidden',
                      editDiscountMode === 'buyget' ? 'border-rose-500 bg-rose-50 ring-4 ring-rose-50 shadow-lg' : 'bg-white border-slate-100 hover:border-slate-200']">
                    <div class="p-2.5 rounded-2xl bg-white shadow-sm"><Tags :size="18" class="text-rose-500" /></div>
                    <span :class="['text-[10px] font-black uppercase tracking-widest', editDiscountMode === 'buyget' ? 'text-rose-600' : 'text-slate-400']">买几送几</span>
                  </button>
                </div>
              </div>

              <!-- 折扣面板 -->
              <div v-if="editDiscountMode === 'discount'" class="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-5 space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-orange-700">折扣调节</span>
                  <div class="px-4 py-1.5 bg-orange-500 text-white rounded-full text-sm font-black shadow-lg shadow-orange-200">{{ editDiscount || 100 }} 折</div>
                </div>
                <div>
                  <input type="range" min="10" max="100" step="1" v-model.number="editDiscount"
                    class="w-full h-2 bg-white rounded-full appearance-none cursor-pointer accent-orange-500" />
                  <div class="flex justify-between mt-3 text-[10px] font-black text-slate-300">
                    <span :class="(editDiscount||100) >= 10 ? 'text-orange-500' : ''">1折</span>
                    <span :class="(editDiscount||100) >= 50 ? 'text-orange-500' : ''">5折</span>
                    <span :class="(editDiscount||100) >= 80 ? 'text-orange-500' : ''">8折</span>
                    <span :class="(editDiscount||100) >= 90 ? 'text-orange-500' : ''">9折</span>
                    <span :class="(editDiscount||100) >= 100 ? 'text-orange-500' : ''">原价</span>
                  </div>
                </div>
                <div class="flex justify-between items-center bg-white/80 rounded-2xl p-4">
                  <div><p class="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">折后单价</p>
                    <p class="text-2xl font-black text-orange-600">¥ {{ ((editPrice||0) * (editDiscount||100) / 100).toFixed(2) }}</p></div>
                  <div class="text-right"><p class="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">原价</p>
                    <p class="text-sm font-bold text-slate-300 line-through">¥ {{ (editPrice||0).toFixed(2) }}</p></div>
                </div>
              </div>

              <!-- 买送面板 -->
              <div v-else-if="editDiscountMode === 'buyget'" class="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-5 space-y-4">
                <div class="flex items-center gap-3"><div class="p-2 bg-rose-500 text-white rounded-xl"><Tags :size="20" /></div><span class="text-sm font-black text-rose-700 uppercase">买几送几</span></div>
                <div class="flex items-center justify-center gap-6 py-2">
                  <div class="text-center"><p class="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">买</p>
                    <input v-model.number="editBuyM" type="number" min="1" class="w-20 px-3 py-3 bg-white border border-rose-100 rounded-2xl text-xl font-black text-rose-600 focus:ring-4 focus:ring-rose-100 outline-none text-center" /></div>
                  <div class="h-0.5 w-6 bg-rose-200 mt-5 rounded-full" />
                  <div class="text-center"><p class="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">送</p>
                    <input v-model.number="editGetN" type="number" min="1" class="w-20 px-3 py-3 bg-white border border-rose-100 rounded-2xl text-xl font-black text-rose-600 focus:ring-4 focus:ring-rose-100 outline-none text-center" /></div>
                </div>
                <div class="bg-rose-500 rounded-2xl p-3 text-center text-white text-sm font-black">多买多送，实惠看得见！</div>
              </div>

              <!-- 描述 -->
              <div class="pt-2 border-t border-slate-50">
                <label class="text-sm font-bold text-slate-600 block mb-3">商品详情描述</label>
                <div class="relative">
                  <textarea v-model="editDesc" rows="3" maxlength="200" class="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-orange-100/50 focus:border-orange-500 outline-none transition-all font-medium text-slate-700 resize-none" placeholder="描述商品特色..."></textarea>
                  <span class="absolute right-5 bottom-4 text-[10px] font-black text-slate-300">{{ editDesc.length }}/200</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 sm:px-8 py-5 border-t border-slate-50 flex gap-4 bg-slate-50/30 shrink-0">
              <button @click="showEditModal = false" class="px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-[.1em] text-xs">取消</button>
              <button @click="submitEdit" class="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"><Save :size="18" />保存修改</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ===== 删除确认弹窗 ===== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="showDeleteConfirm = false">
          <div class="w-full max-w-sm rounded-[28px] bg-white shadow-2xl p-6 text-center">
            <Trash2 class="mx-auto h-10 w-10 text-red-400 mb-3" />
            <h3 class="text-lg font-black text-stone-800 mb-2">确认删除</h3>
            <p class="text-sm text-stone-500 mb-5">确定要删除「{{ editProduct?.name }}」吗？删除后不可恢复。</p>
            <div class="flex gap-3">
              <button @click="showDeleteConfirm = false" class="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-bold text-stone-500 hover:bg-stone-50">取消</button>
              <button @click="confirmDelete" class="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-black text-white hover:bg-red-600 transition-colors">确认删除</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
