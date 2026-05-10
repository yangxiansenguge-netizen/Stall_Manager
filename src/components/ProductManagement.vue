<script setup lang="ts">
import {
  Search,
  Plus,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Settings,
  BarChart4,
  UploadCloud,
  Send
} from 'lucide-vue-next';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import lemonTeaImage from '../assets/lemon-tea.svg';
import spicyCutletImage from '../assets/spicy-cutlet.svg';
import skewerPlatterImage from '../assets/skewer-platter.svg';
import doubleSkinMilkImage from '../assets/double-skin-milk.svg';
import iceJellyImage from '../assets/ice-jelly.svg';
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';

const resolveImageUrl = (raw?: string | null): string => {
  if (!raw) return '';
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {
    if (raw.startsWith('http')) return raw;
  }
  return '';
};

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'view-change', view: 'manualOrder'): void;
}>();

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ProductCategory {
  name: string;
  count: number;
}

interface ProductItem {
  id: number;
  name: string;
  tag: string;
  type: string;
  price: number;
  stock: number;
  monthlySales: number;
  trend: string;
  visitors: string;
  visitorTrend: string;
  revenue: string;
  revenueTrend: string;
  ctr: string;
  ctrTrend: string;
  imageUrl?: string | null;
}

interface ProductSummaryResponse {
  categories: ProductCategory[];
  products: ProductItem[];
}

const activeCategory = ref('全部商品');
const searchQuery = ref('');
const showAddProductModal = ref(false);

const newProductName = ref('');
const newProductType = ref('其他');
const newProductPrice = ref<number | null>(null);
const newProductStock = ref<number | null>(null);
const newProductDescription = ref('');
const newProductImagePreviews = ref<string[]>([]);
const uploadedImageUrls = ref<string[]>([]);
const uploadingIndex = ref<number | null>(null);
const imagePickerRef = ref<HTMLInputElement | null>(null);

const isCombo = computed(() => uploadedImageUrls.value.length >= 2);

const productTypeOptions = computed(() => {
  const names = categories.value
    .filter(c => c.name !== '全部商品' && c.name !== '热销商品')
    .map(c => c.name);
  return names.length > 0 ? names : ['其他', '小吃', '饮品', '甜品', '手工饰品'];
});
const descriptionLength = computed(() => newProductDescription.value.length);

const categories = ref<ProductCategory[]>([{ name: '全部商品', count: 0 }]);
const tableProducts = ref<Array<{
  id: number;
  name: string;
  tag: string;
  type: string;
  price: number;
  stock: number;
  monthlySales: number;
  trend: string;
  visitors: string;
  vTrend: string;
  revenue: string;
  rTrend: string;
  ctr: string;
  cTrend: string;
  img: string;
}>>([]);

const mockImages = [lemonTeaImage, spicyCutletImage, skewerPlatterImage, doubleSkinMilkImage, iceJellyImage];

const authHeaders = () => {
  const token = localStorage.getItem('stall_auth_token') || '';
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const normalizeProduct = (item: ProductItem, idx: number) => ({
  id: item.id,
  name: item.name,
  tag: item.tag || '常规',
  type: item.type || '其他',
  price: item.price || 0,
  stock: item.stock || 0,
  monthlySales: item.monthlySales || 0,
  trend: item.trend || '+ 0%',
  visitors: item.visitors || '--',
  vTrend: item.visitorTrend || '--',
  revenue: item.revenue || '0',
  rTrend: item.revenueTrend || '--',
  ctr: item.ctr || '--',
  cTrend: item.ctrTrend || '--',
  img: resolveImageUrl(item.imageUrl) || mockImages[idx % mockImages.length]
});

const fetchSummary = async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/products/summary'), {
      headers: authHeaders()
    });
    const payload = (await resp.json()) as ApiResponse<ProductSummaryResponse>;
    if (!resp.ok || !payload.success || !payload.data) {
      return;
    }

    categories.value = payload.data.categories?.length
      ? payload.data.categories
      : [{ name: '全部商品', count: payload.data.products?.length || 0 }];

    tableProducts.value = (payload.data.products || []).map(normalizeProduct);
  } catch {
    // ignore and keep current UI
  }
};

const filteredProducts = computed(() => {
  const keyword = searchQuery.value.trim();
  return tableProducts.value.filter((item) => {
    const inCategory =
      activeCategory.value === '全部商品' ||
      activeCategory.value === '全部' ||
      item.type === activeCategory.value ||
      item.tag === activeCategory.value;

    const inKeyword = !keyword || item.name.includes(keyword);
    return inCategory && inKeyword;
  });
});

const revokeProductPreviews = () => {
  newProductImagePreviews.value.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};

const resetAddProductForm = () => {
  revokeProductPreviews();
  newProductName.value = '';
  newProductType.value = '其他';
  newProductPrice.value = null;
  newProductStock.value = null;
  newProductDescription.value = '';
  newProductImagePreviews.value = [];
  uploadedImageUrls.value = [];
  uploadingIndex.value = null;
  if (imagePickerRef.value) {
    imagePickerRef.value.value = '';
  }
};

const triggerImagePicker = (index?: number) => {
  uploadingIndex.value = index ?? newProductImagePreviews.value.length;
  imagePickerRef.value?.click();
};

const onPickProductImage = async (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('error', '上传失败', '图片大小不能超过 5MB');
    return;
  }

  // 本地预览
  const previewUrl = URL.createObjectURL(file);
  const idx = uploadingIndex.value ?? newProductImagePreviews.value.length;
  if (idx >= newProductImagePreviews.value.length) {
    newProductImagePreviews.value.push(previewUrl);
  } else {
    if (newProductImagePreviews.value[idx]?.startsWith('blob:')) {
      URL.revokeObjectURL(newProductImagePreviews.value[idx]);
    }
    newProductImagePreviews.value[idx] = previewUrl;
  }

  // 上传到 OSS
  const formData = new FormData();
  formData.append('file', file);

  try {
    const token = localStorage.getItem('stall_auth_token') || '';
    const resp = await fetch(buildApiUrl('/api/common/upload'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const result = await resp.json();
    if (result.code === 200 || result.success) {
      if (idx >= uploadedImageUrls.value.length) {
        uploadedImageUrls.value.push(result.data);
      } else {
        uploadedImageUrls.value[idx] = result.data;
      }
    } else {
      throw new Error(result.message || '上传失败');
    }
  } catch (error) {
    showToast('error', '上传失败', error instanceof Error ? error.message : '图片上传失败');
    // 移除失败的预览
    if (newProductImagePreviews.value[idx]?.startsWith('blob:')) {
      URL.revokeObjectURL(newProductImagePreviews.value[idx]);
    }
    newProductImagePreviews.value.splice(idx, 1);
  }

  if (input) input.value = '';
};

const removeProductImage = (index: number) => {
  if (newProductImagePreviews.value[index]?.startsWith('blob:')) {
    URL.revokeObjectURL(newProductImagePreviews.value[index]);
  }
  newProductImagePreviews.value.splice(index, 1);
  uploadedImageUrls.value.splice(index, 1);
};

const openAddProductModal = () => {
  resetAddProductForm();
  showAddProductModal.value = true;
};

const closeAddProductModal = () => {
  showAddProductModal.value = false;
  resetAddProductForm();
};

const submitAddProduct = async () => {
  const name = newProductName.value.trim();
  const type = newProductType.value.trim() || '其他';
  const price = Number(newProductPrice.value || 0);
  const stock = Number(newProductStock.value || 0);

  if (!name) {
    showToast('error', '上架失败', '请输入商品名称');
    return;
  }
  if (!type) {
    showToast('error', '上架失败', '请选择商品分类');
    return;
  }
  if (price <= 0) {
    showToast('error', '上架失败', '请输入有效商品价格');
    return;
  }
  if (stock < 0) {
    showToast('error', '上架失败', '库存数量不能小于 0');
    return;
  }
  if (uploadedImageUrls.value.length === 0) {
    showToast('error', '上架失败', '请至少上传一张商品图片');
    return;
  }


  try {
    const resp = await fetch(buildApiUrl('/api/products'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name,
        type,
        price: Math.round(price),
        stock,
        description: newProductDescription.value.trim() || null,
        imageUrls: uploadedImageUrls.value,
      })
    });

    const payload = (await resp.json()) as ApiResponse<unknown>;
    if (!resp.ok || !payload.success) {
      showToast('error', '上架失败', payload.message || '请稍后重试');
      return;
    }

    closeAddProductModal();
    showToast('success', '上架成功', `${name} 已成功上架`);
    await fetchSummary();
  } catch {
    showToast('error', '网络异常', '请稍后重试');
  }
};

onMounted(async () => {
  await fetchSummary();
});

onBeforeUnmount(() => {
  revokeProductPreviews();
});
</script>

<template>
  <div class="min-h-screen space-y-4 rounded-[1.7rem] border border-stone-50 bg-white p-3.5 text-left shadow-[0_18px_45px_rgba(0,0,0,0.05)] sm:space-y-6 sm:rounded-[2.5rem] sm:p-6 md:p-8">
    <!-- 顶部标题栏 -->
    <div class="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-start justify-between gap-3 sm:gap-4 md:justify-start">
        <div class="flex items-center gap-3 sm:gap-4">
          <button @click="emit('back')" class="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-50 text-stone-400 transition-all hover:text-stone-900 sm:h-11 sm:w-11">
            <X class="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div class="flex flex-col items-start text-left">
            <h2 class="text-xl font-black leading-none tracking-tight text-stone-900 sm:text-2xl">商品管理</h2>
            <p class="mt-1 text-[10px] font-bold uppercase tracking-widest text-stone-400">Product Overview</p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2 md:hidden">
          <button
            @click="emit('view-change', 'manualOrder')"
            class="flex h-9 items-center justify-center gap-1.5 rounded-full bg-stone-900 px-3.5 text-[11px] font-black text-white shadow-lg shadow-stone-200 transition-colors hover:bg-stone-700"
          >
            手动点单
          </button>
          <button @click="openAddProductModal" class="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#FF6B00] px-3.5 text-[11px] font-black text-white shadow-lg shadow-orange-100 transition-colors hover:bg-orange-600">
            <Plus class="h-3.5 w-3.5" /> 上架商品
          </button>
        </div>

      </div>

      <div class="grid grid-cols-1 gap-2 sm:gap-3 md:flex md:w-auto md:items-center">
        <button
          @click="emit('view-change', 'manualOrder')"
          class="hidden items-center justify-center gap-2 rounded-2xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white shadow-xl shadow-orange-100 transition-colors hover:bg-orange-600 md:flex md:px-6"
        >
          手动点单
        </button>
        <div class="relative md:w-72">
          <input
            type="text"
            placeholder="搜索商品名称"
            class="w-full rounded-2xl border-none bg-[#F5F5F7] py-3 pl-11 pr-4 text-xs font-bold placeholder:text-stone-300 transition-all focus:ring-2 focus:ring-orange-500/20"
            v-model="searchQuery"
          />
          <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-300" />
        </div>
        <button @click="openAddProductModal" class="hidden items-center justify-center gap-2.5 rounded-2xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white shadow-xl shadow-orange-100 transition-colors hover:bg-orange-600 md:flex md:px-6">
          <Plus class="h-4 w-4" /> 上架商品
        </button>
      </div>
    </div>



    <!-- 筛选与排序 -->
    <div class="flex flex-col gap-3 px-1 md:flex-row md:items-center md:justify-between">
      <div class="flex w-full items-center gap-2 overflow-x-auto pb-1 md:w-auto">
        <button
          v-for="cat in categories"
          :key="cat.name"
          @click="activeCategory = cat.name"
          :class="['whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-black transition-all', activeCategory === cat.name ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'bg-stone-50 text-stone-400 hover:bg-stone-100']"
        >
          {{ cat.name }} {{ cat.count }}
        </button>
      </div>
      <button class="flex items-center justify-center gap-2 rounded-xl bg-stone-50 px-4 py-2.5 text-xs font-black text-stone-400 transition-all hover:bg-stone-100 md:px-5">
        默认排序 <Filter class="h-4 w-4" />
      </button>
    </div>

    <!-- 手机端商品卡片 -->
    <div class="space-y-2.5 md:hidden">
      <article v-for="(p, idx) in filteredProducts" :key="p.id" class="rounded-[1.45rem] border border-stone-100 bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.03)]">

        <div class="flex items-start gap-3">
          <div class="shrink-0">
            <div class="h-14 w-14 overflow-hidden rounded-[1rem] border border-stone-50">
              <img :src="p.img" :alt="p.name" class="h-full w-full object-cover" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="truncate text-[15px] font-black leading-none text-stone-900">{{ p.name }}</h4>
                <div class="mt-2 flex items-center gap-2">
                  <span :class="['rounded-full px-2 py-0.5 text-[9px] font-black leading-none', p.tag === '热销' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600']">
                    {{ p.tag }}
                  </span>
                  <span class="text-[10px] font-bold text-stone-300">{{ p.type }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-base font-black tracking-tighter text-orange-500">¥{{ p.price }}</p>
                <p class="mt-1 text-[9px] font-bold uppercase tracking-widest text-stone-300">库存 {{ p.stock }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">销量</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.monthlySales }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.trend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.trend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">访客</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.visitors }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.vTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.vTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.vTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">成交额</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">¥{{ p.revenue }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.rTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.rTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.rTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
          <div class="rounded-[1rem] bg-stone-50/80 px-2.5 py-2">
            <p class="text-[9px] font-bold uppercase tracking-widest text-stone-300">转化率</p>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="text-[13px] font-black text-stone-900">{{ p.ctr }}</span>
              <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.cTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                <ArrowUp v-if="p.cTrend.includes('+')" class="h-2.5 w-2.5" />
                <ArrowDown v-else class="h-2.5 w-2.5" />
                {{ p.cTrend.replace('+ ', '').replace('- ', '') }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <button class="flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-stone-50 px-3 py-2.5 text-[11px] font-black text-stone-500 transition-all hover:bg-stone-100">
            <Settings class="h-4 w-4" /> 编辑
          </button>
          <button class="flex flex-1 items-center justify-center gap-2 rounded-[1rem] bg-orange-50 px-3 py-2.5 text-[11px] font-black text-orange-600 transition-all hover:bg-orange-100">
            <BarChart4 class="h-4 w-4" /> 数据
          </button>
        </div>
      </article>

      <div class="flex items-center justify-between rounded-[1.5rem] border border-stone-100 bg-stone-50/60 px-4 py-3">
        <p class="text-[10px] font-bold uppercase tracking-widest text-stone-300">共 {{ filteredProducts.length }} 条商品</p>
        <div class="flex items-center gap-1 text-[10px] font-black text-stone-400">
          10 条/页 <ChevronRight class="h-3 w-3 rotate-90" />
        </div>
      </div>
    </div>

    <!-- 桌面端表格 -->
    <div class="hidden overflow-hidden rounded-[2.4rem] border border-stone-50 bg-white text-left shadow-sm md:block">
      <div class="overflow-x-auto">
        <table class="min-w-[920px] w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-stone-100/50 bg-stone-50/50">
              <th class="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-stone-300">商品信息</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">价格</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-orange-500">销量</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">访客数</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">成交额</th>
              <th class="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest text-stone-300">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-50">
            <tr v-for="(p, idx) in filteredProducts" :key="p.id" class="group transition-colors hover:bg-stone-50/50">

              <td class="py-6 pl-10">
                <div class="flex items-center gap-4">
                  <div class="shrink-0">
                    <div class="h-16 w-16 overflow-hidden rounded-2xl border border-stone-50">
                      <img :src="p.img" :alt="p.name" class="h-full w-full object-cover" />
                    </div>
                  </div>
                  <div class="flex flex-col items-start text-left">
                    <h4 class="flex items-center gap-2 text-base font-black leading-none text-stone-900">
                      {{ p.name }}
                      <span :class="['rounded-full px-2 py-0.5 text-[9px] leading-none', p.tag === '热销' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600']">
                        {{ p.tag }}
                      </span>
                    </h4>
                    <p class="mt-1 text-[10px] font-bold text-stone-300">{{ p.type }}</p>
                    <p class="mt-0.5 text-[9px] font-bold text-stone-400 opacity-60">库存 {{ p.stock }} | 月销 {{ p.monthlySales }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <span class="text-xl font-black tracking-tighter text-orange-500">¥{{ p.price }}</span>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">{{ p.monthlySales }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.trend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.trend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">{{ p.visitors }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.vTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.vTrend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.vTrend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6 text-center">
                <div class="flex flex-col items-center gap-1">
                  <span class="text-sm font-black text-stone-900">¥{{ p.revenue }}</span>
                  <span :class="['flex items-center gap-0.5 text-[9px] font-black', p.rTrend.includes('+') ? 'text-emerald-500' : 'text-rose-500']">
                    <ArrowUp v-if="p.rTrend.includes('+')" class="h-2.5 w-2.5" />
                    <ArrowDown v-else class="h-2.5 w-2.5" />
                    {{ p.rTrend.replace('+ ', '').replace('- ', '') }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-6">
                <div class="flex justify-end gap-2 pr-6">
                  <button class="flex flex-col items-center gap-1 rounded-xl p-2 px-3 transition-all hover:bg-white hover:shadow-md">
                    <Settings class="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                    <span class="text-[9px] font-black text-stone-400">编辑</span>
                  </button>
                  <button class="flex flex-col items-center gap-1 rounded-xl p-2 px-3 transition-all hover:bg-white hover:shadow-md">
                    <BarChart4 class="h-4 w-4 text-stone-400 group-hover:text-stone-700" />
                    <span class="text-[9px] font-black text-stone-400">数据</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-between border-t border-stone-100 p-8">
        <p class="text-[10px] font-bold uppercase tracking-widest leading-none text-stone-300">共 {{ filteredProducts.length }} 条商品</p>
        <div class="flex items-center gap-2">
          <button
            v-for="(num, i) in [1, 2, 3, 4, 5, '...', 13]"
            :key="i"
            :class="['flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-black transition-all', num === 1 ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' : 'text-stone-300 hover:bg-stone-50 hover:text-stone-600']"
          >
            {{ num }}
          </button>
          <div class="ml-4 flex cursor-pointer items-center gap-2 rounded-xl bg-stone-50 px-4 py-1.5 text-[10px] font-black text-stone-400">
            10 条/页 <ChevronRight class="h-3 w-3 rotate-90" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddProductModal" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-3 sm:p-6">
      <div class="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div class="flex items-start justify-between border-b border-stone-100 px-5 py-4 sm:px-8 sm:py-6">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
              <Plus class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-xl font-black text-stone-900">上架商品</h3>
              <p class="mt-1 text-xs font-semibold text-stone-400">添加新品，吸引更多顾客</p>
            </div>
          </div>
          <button @click="closeAddProductModal" class="rounded-xl border border-stone-200 bg-white p-2 text-stone-400 transition-colors hover:text-stone-700">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="max-h-[68vh] space-y-3 overflow-y-auto px-3.5 py-3 sm:max-h-[72vh] sm:space-y-4 sm:px-6 sm:py-5">
          <section>
            <div class="mb-2 flex items-center gap-1 text-sm font-black text-stone-900">
              商品图片 <span class="text-orange-500">*</span>
              <span v-if="isCombo" class="ml-2 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-black text-orange-600">套餐</span>
              <span class="ml-2 text-[11px] font-semibold text-stone-400">上传多张图片自动标记为套餐，最多 6 张</span>
            </div>

            <div class="flex flex-wrap gap-3">
              <!-- 已上传的图片 -->
              <div v-for="(preview, idx) in newProductImagePreviews" :key="idx" class="relative h-20 w-20">
                <img :src="preview" alt="preview" class="h-full w-full rounded-xl border border-stone-200 object-cover" />
                <button
                  @click="removeProductImage(idx)"
                  class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow hover:bg-red-600"
                >×</button>
              </div>
              <!-- 新增槽位 -->
              <button
                v-if="newProductImagePreviews.length < 6"
                type="button"
                @click="triggerImagePicker(newProductImagePreviews.length)"
                class="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-amber-400 hover:text-amber-500"
              >
                <UploadCloud class="h-5 w-5" />
                <span class="mt-1 text-[10px]">上传</span>
              </button>
            </div>
            <input
              ref="imagePickerRef"
              type="file"
              accept="image/png,image/jpeg"
              class="hidden"
              @change="onPickProductImage"
            />
          </section>

          <section class="space-y-3.5">
            <div>
              <label class="mb-1.5 block text-sm font-black text-stone-900">商品名称 <span class="text-orange-500">*</span></label>
              <input
                v-model="newProductName"
                type="text"
                placeholder="请输入商品名称"
                class="w-full rounded-2xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-orange-300"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-black text-stone-900">商品分类 <span class="text-orange-500">*</span></label>
              <select
                v-model="newProductType"
                class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:border-orange-300"
              >
                <option v-for="option in productTypeOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-black text-stone-900">商品单价 <span class="text-orange-500">*</span></label>
                <div class="flex items-center rounded-2xl border border-stone-200 px-3.5">
                  <span class="text-sm font-black text-stone-500">¥</span>
                  <input
                    v-model.number="newProductPrice"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="请输入价格"
                    class="w-full bg-transparent px-2 py-2.5 text-sm font-semibold text-stone-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-black text-stone-900">库存数量 <span class="text-orange-500">*</span></label>
                <div class="flex items-center rounded-2xl border border-stone-200 px-3.5">
                  <input
                    v-model.number="newProductStock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="请输入库存数量"
                    class="w-full bg-transparent py-2.5 text-sm font-semibold text-stone-700 outline-none"
                  />
                  <span class="rounded-lg bg-stone-100 px-2 py-1 text-xs font-bold text-stone-500">份</span>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-black text-stone-900">商品描述</label>
              <textarea
                v-model="newProductDescription"
                rows="4"
                maxlength="200"
                placeholder="请简单描述商品的特点、口味、规格等信息..."
                class="w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 outline-none focus:border-orange-300"
              />
              <p class="mt-1 text-right text-xs font-semibold text-stone-400">{{ descriptionLength }}/200</p>
            </div>

          </section>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-stone-100 px-5 py-4 sm:px-8 sm:py-5">
          <button
            @click="closeAddProductModal"
            class="w-full rounded-full border border-stone-200 bg-white px-5 py-2 text-sm font-bold text-stone-500 transition-colors hover:bg-stone-50 sm:w-auto sm:px-8 sm:py-2.5"
          >
            取消
          </button>
          <button
            @click="submitAddProduct"
            class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF6B00] px-5 py-2 text-sm font-black text-white shadow-lg shadow-orange-100 transition-colors hover:bg-orange-600 sm:w-auto sm:px-8 sm:py-2.5"
          >
            <Send class="h-4 w-4" /> 确认上架
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
