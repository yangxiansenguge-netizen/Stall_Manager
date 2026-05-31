<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Eye, Ban, CheckCircle } from 'lucide-vue-next'

const store = useAdminStore()
const keyword = ref('')
const detailOpen = ref(false)

const doSearch = () => {
  store.fetchMerchants(1, keyword.value)
}

const openDetail = async (merchantId: string) => {
  await store.fetchMerchantDetail(merchantId)
  detailOpen.value = true
}

const toggleStatus = (merchantId: string, currentStatus: string) => {
  const newStatus = (currentStatus === 'ACTIVE' || currentStatus === 'PENDING') ? 'SUSPENDED' : 'ACTIVE'
  store.updateMerchantStatus(merchantId, newStatus).then(() => store.fetchMerchants())
}

onMounted(() => {
  store.fetchMerchants()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black text-stone-900">商户管理</h1>
      <div class="flex gap-2">
        <input v-model="keyword" @keyup.enter="doSearch" placeholder="搜索商户名/手机号" class="px-3 py-2 rounded-xl border border-stone-200 text-xs w-48" />
        <button @click="doSearch" class="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-bold text-stone-600 transition">搜索</button>
      </div>
    </div>

    <!-- Merchant Table -->
    <div class="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
            <th class="px-4 py-3">商户名</th><th class="px-4 py-3">手机号</th><th class="px-4 py-3">注册时间</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in store.merchants" :key="m.merchantId || m.id" class="border-b border-stone-50 hover:bg-stone-50/50 transition">
            <td class="px-4 py-3 text-xs font-medium text-stone-700">{{ m.merchantName || m.merchant_name }}</td>
            <td class="px-4 py-3 text-xs text-stone-500">{{ m.phone }}</td>
            <td class="px-4 py-3 text-xs text-stone-400">{{ (m.createdAt || m.created_at || '').toString().slice(0, 10) }}</td>
            <td class="px-4 py-3">
              <span :class="(m.status || m.onboardingStatus) === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : (m.status || m.onboardingStatus) === 'SUSPENDED' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'" class="px-2 py-0.5 rounded-full text-[10px] font-bold">
                {{ (m.status || m.onboardingStatus) === 'ACTIVE' ? '正常' : (m.status || m.onboardingStatus) === 'SUSPENDED' ? '已停用' : m.status || m.onboardingStatus }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button @click="openDetail(m.merchantId || m.merchant_id)" class="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  <Eye class="w-3.5 h-3.5" /> 详情
                </button>
                <button @click="toggleStatus(m.merchantId || m.merchant_id, m.status || m.onboardingStatus)" class="text-xs font-bold flex items-center gap-1"
                  :class="(m.status || m.onboardingStatus) !== 'SUSPENDED' ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'">
                  <Ban v-if="(m.status || m.onboardingStatus) !== 'SUSPENDED'" class="w-3.5 h-3.5" />
                  <CheckCircle v-else class="w-3.5 h-3.5" />
                  {{ (m.status || m.onboardingStatus) !== 'SUSPENDED' ? '禁用' : '启用' }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="store.merchants.length === 0">
            <td colspan="6" class="px-4 py-12 text-center text-xs text-stone-400">暂无商户数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <div v-if="detailOpen && store.currentMerchant" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-black text-stone-900">商户详情</h2>
          <button @click="detailOpen = false" class="text-stone-400 hover:text-stone-600 text-sm font-bold">关闭</button>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-stone-400">商户名</span><span class="font-medium">{{ store.currentMerchant.merchantName || store.currentMerchant.merchant_name }}</span></div>
          <div class="flex justify-between"><span class="text-stone-400">手机号</span><span class="font-medium">{{ store.currentMerchant.phone }}</span></div>
          <div class="flex justify-between"><span class="text-stone-400">入驻状态</span><span class="font-medium">{{ store.currentMerchant.onboardingStatus || store.currentMerchant.onboarding_status }}</span></div>
          <div class="flex justify-between"><span class="text-stone-400">注册时间</span><span class="font-medium">{{ (store.currentMerchant.createdAt || store.currentMerchant.created_at || '').toString().slice(0, 10) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>
