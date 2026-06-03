<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Ban, CheckCircle, Eye, Search, Store, UserRound, X } from 'lucide-vue-next'

const store = useAdminStore()
const keyword = ref('')
const detailOpen = ref(false)

const activeCount = computed(() => store.merchants.filter((m) => (m.status || m.onboardingStatus) === 'ACTIVE').length)
const suspendedCount = computed(() => store.merchants.filter((m) => (m.status || m.onboardingStatus) === 'SUSPENDED').length)

const doSearch = () => {
  store.fetchMerchants(1, keyword.value)
}

const openDetail = async (merchantId: string) => {
  await store.fetchMerchantDetail(merchantId)
  detailOpen.value = true
}

const toggleStatus = async (merchantId: string, currentStatus: string) => {
  const newStatus = (currentStatus === 'ACTIVE' || currentStatus === 'PENDING') ? 'SUSPENDED' : 'ACTIVE'
  await store.updateMerchantStatus(merchantId, newStatus)
  await store.fetchMerchants(1, keyword.value)
}

const statusClass = (status: string) => {
  if (status === 'ACTIVE') return 'ds-pill-ok'
  if (status === 'SUSPENDED') return 'ds-pill-danger'
  return 'ds-pill-muted'
}

const statusLabel = (status: string) => {
  if (status === 'ACTIVE') return '正常'
  if (status === 'SUSPENDED') return '已停用'
  if (status === 'PENDING') return '待完善'
  return status || '未知'
}

onMounted(() => {
  store.fetchMerchants()
})
</script>

<template>
  <div class="ds-shell">
    <section class="grid gap-3 sm:grid-cols-3">
      <article class="ds-panel p-4">
        <p class="text-sm font-bold text-stone-500">当前列表</p>
        <p class="mt-2 text-3xl font-black text-stone-950">{{ store.merchants.length }}</p>
        <p class="text-xs font-semibold text-stone-400">支持搜索商户名和手机号</p>
      </article>
      <article class="ds-panel p-4">
        <p class="text-sm font-bold text-stone-500">正常经营</p>
        <p class="mt-2 text-3xl font-black text-emerald-700">{{ activeCount }}</p>
        <p class="text-xs font-semibold text-stone-400">可继续获得推荐曝光</p>
      </article>
      <article class="ds-panel p-4">
        <p class="text-sm font-bold text-stone-500">已停用</p>
        <p class="mt-2 text-3xl font-black text-red-600">{{ suspendedCount }}</p>
        <p class="text-xs font-semibold text-stone-400">需人工复核后恢复</p>
      </article>
    </section>

    <section class="ds-panel p-4 sm:p-5">
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-xl font-black text-stone-950">商户管理</h2>
          <p class="mt-1 text-sm font-semibold text-stone-500">把商户看成经营中的人，而不是后台表格的一行。</p>
        </div>
        <div class="flex gap-2">
          <div class="relative min-w-0 flex-1 sm:w-72">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input v-model="keyword" class="ds-input pl-10" placeholder="搜索商户名 / 手机号" @keyup.enter="doSearch" />
          </div>
          <button class="ds-button ds-button-primary" @click="doSearch">搜索</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>商户</th>
              <th>手机号</th>
              <th>注册时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in store.merchants" :key="m.merchantId || m.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-[16px] bg-amber-100 text-amber-700">
                    <UserRound class="h-5 w-5" />
                  </div>
                  <div>
                    <p class="font-black text-stone-900">{{ m.merchantName || m.merchant_name || '未命名商户' }}</p>
                    <p class="text-xs font-semibold text-stone-400">ID {{ m.merchantId || m.merchant_id || m.id }}</p>
                  </div>
                </div>
              </td>
              <td class="font-semibold text-stone-600">{{ m.phone }}</td>
              <td class="font-semibold text-stone-400">{{ (m.createdAt || m.created_at || '').toString().slice(0, 10) }}</td>
              <td><span :class="['ds-pill', statusClass(m.status || m.onboardingStatus)]">{{ statusLabel(m.status || m.onboardingStatus) }}</span></td>
              <td>
                <div class="flex flex-wrap gap-2">
                  <button class="ds-button ds-button-warm h-9 px-3" @click="openDetail(m.merchantId || m.merchant_id)">
                    <Eye class="h-4 w-4" />
                    详情
                  </button>
                  <button
                    class="ds-button h-9 px-3"
                    :class="(m.status || m.onboardingStatus) !== 'SUSPENDED' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'"
                    @click="toggleStatus(m.merchantId || m.merchant_id, m.status || m.onboardingStatus)"
                  >
                    <Ban v-if="(m.status || m.onboardingStatus) !== 'SUSPENDED'" class="h-4 w-4" />
                    <CheckCircle v-else class="h-4 w-4" />
                    {{ (m.status || m.onboardingStatus) !== 'SUSPENDED' ? '停用' : '启用' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="store.merchants.length === 0" class="rounded-[24px] bg-[#FBF5EA] py-16 text-center text-sm font-bold text-stone-400">暂无商户数据</p>
    </section>

    <Teleport to="body">
      <Transition name="fade-slide">
        <div v-if="detailOpen && store.currentMerchant" class="fixed inset-0 z-50 flex justify-end">
          <div class="drawer-backdrop absolute inset-0" @click="detailOpen = false" />
          <aside class="drawer-panel relative h-full w-full max-w-[460px] overflow-y-auto p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="ds-eyebrow">Merchant Profile</p>
                <h2 class="mt-2 text-2xl font-black text-stone-950">商户详情</h2>
              </div>
              <button class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500" @click="detailOpen = false">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="mt-6 ds-panel p-5">
              <div class="mb-5 flex items-center gap-3">
                <div class="flex h-14 w-14 items-center justify-center rounded-[22px] bg-amber-100 text-amber-700">
                  <Store class="h-7 w-7" />
                </div>
                <div>
                  <h3 class="text-lg font-black text-stone-950">{{ store.currentMerchant.merchantName || store.currentMerchant.merchant_name }}</h3>
                  <p class="text-sm font-semibold text-stone-400">{{ store.currentMerchant.phone }}</p>
                </div>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between gap-4"><span class="text-stone-400">入驻状态</span><span class="font-black text-stone-900">{{ statusLabel(store.currentMerchant.onboardingStatus || store.currentMerchant.onboarding_status) }}</span></div>
                <div class="flex justify-between gap-4"><span class="text-stone-400">账号状态</span><span class="font-black text-stone-900">{{ statusLabel(store.currentMerchant.status) }}</span></div>
                <div class="flex justify-between gap-4"><span class="text-stone-400">注册时间</span><span class="font-bold text-stone-700">{{ (store.currentMerchant.createdAt || store.currentMerchant.created_at || '').toString().slice(0, 10) }}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
