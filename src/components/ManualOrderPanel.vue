<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  ArrowLeft,
  ClipboardCheck,
  History,
  Minus,
  PencilLine,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Wallet
} from 'lucide-vue-next';
import { buildApiUrl } from '../utils/api';
import { showToast } from '../composables/useToast';

const emit = defineEmits<{
  (e: 'navigate-stall'): void;
}>();

const props = defineProps<{
  onBack?: () => void;
}>();

const noStall = ref(false);

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface ManualProduct {
  id: number;
  name: string;
  type: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
}

interface ManualOrderHistoryItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  unitPrice: string;
  lineAmountCents: number;
  lineAmount: string;
}

interface ManualOrderHistoryOrder {
  orderId: number;
  orderNo: string;
  totalAmountCents: number;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  paidAt?: string | null;
  soldAt?: string | null;
  items: ManualOrderHistoryItem[];
}

interface ProductResponse {
  products: ManualProduct[];
}

interface HistoryResponse {
  orders: ManualOrderHistoryOrder[];
}



const loading = ref(false);
const paying = ref(false);
const loadingHistory = ref(false);

const resolveImageUrl = (raw?: string | null): string => {
  if (!raw) return '';
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  } catch {
    // not JSON, use as-is
    if (raw.startsWith('http')) return raw;
  }
  return '';
};

const searchQuery = ref('');
const activeCategory = ref('全部');


const products = ref<ManualProduct[]>([]);
const historyOrders = ref<ManualOrderHistoryOrder[]>([]);

const cart = ref<Record<number, number>>({});
const orderStage = ref<'draft' | 'pending_payment'>('draft');
const pendingOrderNo = ref('');
const pendingCreatedAt = ref('');

const authHeaders = () => {
  const token = localStorage.getItem('stall_auth_token') || '';
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const categories = computed(() => {
  const set = new Set<string>(['全部']);
  products.value.forEach((p) => set.add(p.type || '其他'));
  return Array.from(set);
});

const filteredProducts = computed(() => {
  const kw = searchQuery.value.trim();
  return products.value.filter((p) => {
    const byCategory = activeCategory.value === '全部' || p.type === activeCategory.value;
    const byKeyword = !kw || p.name.includes(kw);
    return byCategory && byKeyword;
  });
});

const cartItems = computed(() => {
  const list = Object.entries(cart.value)
    .map(([id, quantity]) => {
      const product = products.value.find((p) => p.id === Number(id));
      if (!product || quantity <= 0) return null;
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        stock: product.stock,
        subtotalCents: product.price * 100 * quantity
      };
    })
    .filter(
      (x): x is { id: number; name: string; price: number; quantity: number; stock: number; subtotalCents: number } => !!x
    );

  return list;
});

const cartTotalCents = computed(() => cartItems.value.reduce((sum, item) => sum + item.subtotalCents, 0));
const cartTotalText = computed(() => `¥${(cartTotalCents.value / 100).toFixed(2)}`);
const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0));
const hasPendingOrder = computed(() => !!pendingOrderNo.value && orderStage.value === 'pending_payment');

const sortedHistoryOrders = computed(() => {
  const toMs = (value?: string | null) => {
    if (!value) return 0;
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  };
  return [...historyOrders.value].sort((a, b) => toMs(b.paidAt || b.soldAt) - toMs(a.paidAt || a.soldAt));
});


const clearPendingOrder = () => {
  orderStage.value = 'draft';
  pendingOrderNo.value = '';
  pendingCreatedAt.value = '';
};

const clearCart = (resetPending = true) => {
  cart.value = {};
  if (resetPending) clearPendingOrder();
};

const findProduct = (productId: number) => products.value.find((p) => p.id === productId);

const addToCart = (productId: number) => {
  const product = findProduct(productId);
  if (!product) {
    showToast('error', '错误','商品不存在，请刷新后重试');
    return;
  }
  const nextQty = (cart.value[productId] || 0) + 1;
  if (nextQty > product.stock) {
    showToast('error', '错误','已达到库存上限');
    return;
  }
  cart.value[productId] = nextQty;
};

const decCart = (productId: number) => {
  if (!cart.value[productId]) return;
  cart.value[productId] -= 1;
  if (cart.value[productId] <= 0) {
    delete cart.value[productId];
  }
};

const incCart = (productId: number) => {
  const product = findProduct(productId);
  if (!product) {
    showToast('error', '错误','商品不存在，请刷新后重试');
    return;
  }
  const nextQty = (cart.value[productId] || 0) + 1;
  if (nextQty > product.stock) {
    showToast('error', '错误','已达到库存上限');
    return;
  }
  cart.value[productId] = nextQty;
};

const removeCartItem = (productId: number) => {
  delete cart.value[productId];
};

const fetchProducts = async () => {
  loading.value = true;
  try {
    const resp = await fetch(buildApiUrl('/api/orders/manual/products'), {

      headers: authHeaders()
    });
    const payload = (await resp.json()) as ApiResponse<ProductResponse>;
    if (!resp.ok || !payload.success || !payload.data) {
      throw new Error(payload.message || '加载商品失败');
    }
    products.value = payload.data.products || [];
  } catch (err) {
    showToast('error', '错误',err instanceof Error ? err.message : '加载商品失败');
  } finally {
    loading.value = false;
  }
};

const fetchHistory = async () => {
  loadingHistory.value = true;
  try {
    const resp = await fetch(buildApiUrl('/api/orders/manual/history'), {

      headers: authHeaders()
    });
    const payload = (await resp.json()) as ApiResponse<HistoryResponse>;
    if (!resp.ok || !payload.success || !payload.data) {
      throw new Error(payload.message || '加载历史失败');
    }
    historyOrders.value = payload.data.orders || [];
  } catch {
    historyOrders.value = [];
  } finally {
    loadingHistory.value = false;
  }
};

const completeOrder = () => {
  if (!cartItems.value.length) {
    showToast('error', '错误','请先选择商品再完成订单');
    return;
  }
  if (!pendingOrderNo.value) {
    pendingOrderNo.value = `TEMP-${Date.now().toString().slice(-8)}`;
  }
  pendingCreatedAt.value = new Date().toLocaleString();
  orderStage.value = 'pending_payment';
  showToast('success', '成功','已生成待支付订单，可继续修改后再确认支付');
};

const editPendingOrder = () => {
  if (!hasPendingOrder.value) return;
  showToast('success', '成功','已进入修改订单状态，可继续调整商品数量');
};

const confirmPayment = async () => {
  if (!hasPendingOrder.value) {
    showToast('error', '错误','请先点击“完成订单”生成待支付记录');
    return;
  }

  if (!cartItems.value.length) {
    showToast('error', '错误','待支付订单为空，请先添加商品');
    return;
  }

  paying.value = true;
  try {
    const resp = await fetch(buildApiUrl('/api/orders/manual/checkout'), {

      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        remark: `前台手动点单（${pendingOrderNo.value}）`,
        items: cartItems.value.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      })

    });
    const payload = (await resp.json()) as ApiResponse<{ orderNo: string }>;
    if (!resp.ok || !payload.success) {
      throw new Error(payload.message || '支付失败');
    }

    showToast('success', '成功',`支付成功，订单 ${payload.data?.orderNo || ''} 已入库`);
    clearCart(true);
    await fetchProducts();
    await fetchHistory();
  } catch (err) {
    showToast('error', '错误',err instanceof Error ? err.message : '支付失败');
  } finally {
    paying.value = false;
  }
};

onMounted(async () => {
  try {
    const resp = await fetch(buildApiUrl('/api/stalls/onboarding/status'), { headers: authHeaders() });
    const payload = await resp.json();
    if (payload.success && payload.data && payload.data.currentStatus === 'NONE') {
      noStall.value = true;
      return;
    }
  } catch { /* proceed */ }
  await Promise.all([fetchProducts(), fetchHistory()]);
});
</script>

<template>
  <div class="space-y-4 rounded-[2rem] border border-stone-100 bg-white p-4 shadow-sm sm:p-6">
    <div class="flex items-center justify-between gap-3">
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200"
        @click="props.onBack?.()"
      >
        <ArrowLeft class="h-4 w-4" /> 返回商品管理
      </button>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-200"
        @click="() => { fetchProducts(); fetchHistory(); }"
      >
        <RefreshCw class="h-4 w-4" /> 刷新
      </button>
    </div>

    <div v-if="noStall" class="rounded-[2rem] border border-amber-200 bg-amber-50/60 p-8 text-center">
      <Store class="mx-auto h-10 w-10 text-amber-400 mb-3" />
      <h3 class="text-lg font-black text-stone-800 mb-2">请先申请摊位</h3>
      <p class="text-sm text-stone-500 mb-5">您还没有申请摊位，无法进行手动点单操作</p>
      <button @click="emit('navigate-stall')" class="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 text-sm font-black transition-colors shadow-lg shadow-amber-200">
        前往申请摊位
      </button>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section class="space-y-4 rounded-2xl border border-stone-100 bg-stone-50/40 p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-black text-stone-900">手动点单台</h2>
            <p class="mt-1 text-xs text-stone-400">仅展示当前登录商家自己上传的商品</p>
          </div>
          <div class="flex w-full gap-2 sm:w-auto">
            <input
              v-model="searchQuery"
              class="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-300"
              placeholder="搜索商品"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="activeCategory = cat"
            :class="[
              'rounded-full px-3 py-1.5 text-xs font-bold',
              activeCategory === cat ? 'bg-orange-500 text-white' : 'border border-stone-200 bg-white text-stone-500'
            ]"
          >
            {{ cat }}
          </button>
        </div>

        <div v-if="loading" class="rounded-xl bg-white p-4 text-sm text-stone-500">加载商品中...</div>
        <p v-else class="text-[10px] font-medium text-stone-400">点击商品卡片或右侧 + 按钮加入订单</p>
        <div v-if="!loading && !filteredProducts.length" class="rounded-xl bg-stone-50 p-4 text-center text-xs text-stone-400">暂无符合条件的商品</div>
        <div v-else class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="group overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md cursor-pointer"
            @click="addToCart(product.id)"
          >
            <div class="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
              <img
                v-if="resolveImageUrl(product.imageUrl)"
                :src="resolveImageUrl(product.imageUrl)"
                :alt="product.name"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                referrerpolicy="no-referrer"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <ShoppingCart class="h-10 w-10 text-stone-300" />
              </div>
            </div>
            <div class="p-3">
              <h3 class="text-sm font-black text-stone-900 truncate">{{ product.name }}</h3>
              <p class="mt-1 text-xs text-stone-400">{{ product.type }} · 库存 {{ product.stock }}</p>
              <div class="mt-2 flex items-center justify-between">
                <p class="text-base font-black text-orange-500">¥{{ product.price }}</p>
                <button
                  class="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                  @click.stop="addToCart(product.id)"
                >
                  <Plus class="h-3.5 w-3.5" /> 加入
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside class="space-y-3 rounded-2xl border border-stone-100 bg-white p-4 lg:sticky lg:top-4 lg:h-fit">
        <div class="flex items-center justify-between">
          <h3 class="inline-flex items-center gap-2 text-base font-black text-stone-900">
            <ShoppingCart class="h-4 w-4 text-orange-500" /> 订单控制台
          </h3>
          <span class="rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">{{ cartCount }} 件</span>
        </div>

        <div class="rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs">
          <p class="font-bold text-stone-600">状态：{{ hasPendingOrder ? '待支付（可修改）' : '待结算' }}</p>
          <p v-if="hasPendingOrder" class="mt-1 text-stone-500">订单号：{{ pendingOrderNo }}</p>
          <p v-if="pendingCreatedAt" class="mt-1 text-stone-400">生成时间：{{ pendingCreatedAt }}</p>
        </div>

        <div v-if="!cartItems.length" class="rounded-xl bg-stone-50 p-3 text-xs text-stone-400">暂未选择商品</div>
        <div v-else class="max-h-72 space-y-2 overflow-y-auto pr-1">
          <div v-for="item in cartItems" :key="item.id" class="rounded-xl border border-stone-100 p-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-stone-900">{{ item.name }}</p>
                <p class="text-xs text-stone-400">¥{{ item.price }} / 份</p>
              </div>
              <button
                class="rounded-md bg-rose-50 p-1 text-rose-500 hover:bg-rose-100"
                title="删除"
                @click="removeCartItem(item.id)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
            <div class="mt-2 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <button class="rounded-md bg-stone-100 p-1" @click="decCart(item.id)"><Minus class="h-3 w-3" /></button>
                <span class="w-6 text-center text-xs font-bold">{{ item.quantity }}</span>
                <button class="rounded-md bg-stone-100 p-1" @click="incCart(item.id)"><Plus class="h-3 w-3" /></button>
              </div>
              <p class="text-xs font-bold text-stone-600">¥{{ (item.subtotalCents / 100).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="text-stone-500">应收总计</span>
            <span class="text-lg font-black text-stone-900">{{ cartTotalText }}</span>
          </div>

          <div class="mb-2 flex gap-2">
            <button
              class="flex-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-600"
              @click="clearCart(true)"
            >
              清空订单
            </button>
            <button
              v-if="hasPendingOrder"
              class="flex-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-600"
              @click="editPendingOrder"
            >
              <span class="inline-flex items-center gap-1"><PencilLine class="h-3.5 w-3.5" /> 修改订单</span>
            </button>
          </div>



          <button
            v-if="!hasPendingOrder"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-black text-white disabled:opacity-50 hover:bg-orange-600 transition-colors"
            :disabled="!cartItems.length"
            @click="completeOrder"
          >
            <ClipboardCheck class="h-4 w-4" /> 完成订单（生成待支付）
          </button>

          <button
            v-else
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2 text-sm font-black text-white disabled:opacity-50"
            :disabled="paying || !cartItems.length"
            @click="confirmPayment"
          >
            <Wallet class="h-4 w-4" /> {{ paying ? '支付中...' : '确认支付（支付后入库）' }}
          </button>
        </div>
      </aside>
    </div>

    <section class="rounded-2xl border border-stone-100 bg-white p-4">
      <h3 class="inline-flex items-center gap-2 text-base font-black text-stone-900">
        <History class="h-4 w-4 text-orange-500" /> 历史订单
      </h3>
      <p class="mt-1 text-xs text-stone-400">按支付时间倒序，仅展示当前商家已完成交易</p>

      <div v-if="loadingHistory" class="mt-3 text-sm text-stone-500">加载中...</div>
      <div v-else-if="!sortedHistoryOrders.length" class="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-400">暂无订单</div>
      <div v-else class="mt-3 space-y-2.5">
        <details v-for="order in sortedHistoryOrders" :key="order.orderNo" class="rounded-xl border border-stone-200 p-3">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-black text-stone-900">{{ order.orderNo }}</p>
              <p class="text-xs text-stone-400">支付时间：{{ order.paidAt || order.soldAt || '-' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-black text-orange-500">{{ order.totalAmount }}</p>
              <p class="text-[11px] text-stone-500">{{ order.paymentStatus }} / {{ order.orderStatus }}</p>
            </div>
          </summary>
          <div class="mt-2 space-y-1.5 border-t border-stone-100 pt-2">
            <p v-for="item in order.items" :key="`${order.orderNo}-${item.productId}`" class="flex items-center justify-between text-xs text-stone-600">
              <span>{{ item.productName }} x {{ item.quantity }}</span>
              <span>{{ item.lineAmount }}</span>
            </p>
          </div>
        </details>
      </div>
    </section>

  </div>
</template>
