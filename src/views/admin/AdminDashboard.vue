<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { TrendingUp, Store, Users, ShoppingCart } from 'lucide-vue-next'

const store = useAdminStore()

const kpis = computed(() => {
  const d = store.overview
  if (!d) return []
  return [
    { label: '总商户', value: d.totalMerchants ?? '--', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '总摊位', value: d.totalStalls ?? '--', icon: Store, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '今日营收', value: '¥' + (d.todayRevenue || '0'), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '今日订单', value: d.todayOrders ?? '--', icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ]
})

const maxAmount = computed(() => {
  const arr = store.overview?.revenueTrend || []
  if (!arr.length) return 1
  return Math.max(...arr.map((d: any) => d.amount || 0), 1)
})

onMounted(() => {
  store.fetchOverview()
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-black text-stone-900">数据看板</h1>

    <!-- KPI Cards -->
    <div class="grid grid-cols-4 gap-4">
      <div v-for="k in kpis" :key="k.label" class="bg-white rounded-2xl p-5 border border-stone-100">
        <div class="flex items-center gap-3 mb-3">
          <div :class="[k.bg, 'w-10 h-10 rounded-xl flex items-center justify-center']">
            <component :is="k.icon" :class="[k.color, 'w-5 h-5']" />
          </div>
          <span class="text-xs font-bold text-stone-400">{{ k.label }}</span>
        </div>
        <p class="text-2xl font-black text-stone-900">{{ k.value }}</p>
      </div>
    </div>

    <!-- Trend + Ranking -->
    <div class="grid grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-stone-100">
        <h3 class="text-sm font-bold text-stone-700 mb-4">营收趋势（近7天）</h3>
        <div v-if="(store.overview?.revenueTrend || []).length > 0" class="h-48 flex items-end gap-2">
          <div
            v-for="(d, i) in store.overview.revenueTrend"
            :key="i"
            class="flex-1 bg-amber-400 rounded-t-lg min-h-[8px] transition-all"
            :style="{ height: ((d.amount || 0) / maxAmount * 100) + '%' }"
          ></div>
        </div>
        <p v-else class="text-xs text-stone-400 py-12 text-center">暂无趋势数据</p>
        <div v-if="(store.overview?.revenueTrend || []).length > 0" class="flex justify-between mt-2">
          <span v-for="(d, i) in store.overview.revenueTrend" :key="i" class="text-[10px] text-stone-400">{{ (d.dt || '').slice(5) }}</span>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-stone-100">
        <h3 class="text-sm font-bold text-stone-700 mb-4">热门摊位 TOP10</h3>
        <div v-if="(store.overview?.topStalls || []).length > 0">
          <div v-for="(s, i) in (store.overview.topStalls || []).slice(0, 10)" :key="i"
            class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                :class="i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'">{{ i + 1 }}</span>
              <span class="text-xs font-medium text-stone-700 truncate max-w-[140px]">{{ s.name }}</span>
            </div>
            <span class="text-xs font-bold text-stone-900">¥{{ ((s.revenue || 0) / 100).toFixed(0) }}</span>
          </div>
        </div>
        <p v-else class="text-xs text-stone-400 py-12 text-center">暂无排行数据</p>
      </div>
    </div>

    <!-- Low Activity Merchants -->
    <div class="bg-white rounded-2xl p-5 border border-stone-100">
      <h3 class="text-sm font-bold text-stone-700 mb-4">低活跃商户预警</h3>
      <div v-if="(store.overview?.lowActivityMerchants || []).length > 0" class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              <th class="pb-2">商户名</th><th class="pb-2">总营收</th><th class="pb-2">最后活跃</th><th class="pb-2">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in store.overview.lowActivityMerchants" :key="i" class="border-t border-stone-50">
              <td class="py-2 text-xs font-medium text-stone-700">{{ m.name }}</td>
              <td class="py-2 text-xs text-stone-600">¥{{ ((m.revenue || 0) / 100).toFixed(0) }}</td>
              <td class="py-2 text-xs text-stone-400">{{ m.lastOrderAt || '从未' }}</td>
              <td class="py-2"><span class="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">低活跃</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-xs text-stone-400 py-12 text-center">所有商户经营正常</p>
    </div>
  </div>
</template>
