<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/adminStore'
import { AlertTriangle, ArrowUpRight, ClipboardCheck, ShoppingCart, Store, TrendingUp, Users } from 'lucide-vue-next'

const router = useRouter()
const store = useAdminStore()

const yuan = (value: number | string | undefined | null) => {
  const n = Number(value || 0)
  return `¥${n.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}

const kpis = computed(() => {
  const d = store.overview || {}
  return [
    { label: '总商户', value: d.totalMerchants ?? '--', helper: '平台商户池', icon: Users, tone: 'ok' },
    { label: '总摊位', value: d.totalStalls ?? '--', helper: '可经营点位', icon: Store, tone: 'info' },
    { label: '今日营收', value: yuan(d.todayRevenue), helper: '商户实时流水', icon: TrendingUp, tone: 'warn' },
    { label: '今日订单', value: d.todayOrders ?? '--', helper: '全平台订单', icon: ShoppingCart, tone: 'danger' },
  ]
})

const maxAmount = computed(() => {
  const arr = store.overview?.revenueTrend || []
  return Math.max(...arr.map((d: any) => Number(d.amount || 0)), 1)
})

onMounted(() => {
  store.fetchOverview()
})
</script>

<template>
  <div class="ds-shell">
    <section class="ds-surface overflow-hidden p-5 sm:p-7">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="ds-eyebrow">Today Operation</p>
          <h2 class="ds-title mt-2">今天先看风险，再看增长</h2>
          <p class="ds-subtitle max-w-2xl">管理端不需要堆满数据。先把待处理、低活跃和趋势波动浮出来，让运营人员一眼知道下一步。</p>
        </div>
        <button class="ds-button ds-button-primary relative" @click="router.push('/admin/review')">
          <ClipboardCheck class="h-4 w-4" />
          查看待办
          <span v-if="(store.overview?.pendingReviews || 0) > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">{{ store.overview?.pendingReviews || 0 }}</span>
        </button>
      </div>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="item in kpis" :key="item.label" class="ds-panel p-4 transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-bold text-stone-500">{{ item.label }}</p>
            <p class="mt-2 text-3xl font-black tracking-tight text-stone-950">{{ item.value }}</p>
            <p class="mt-1 text-xs font-semibold text-stone-400">{{ item.helper }}</p>
          </div>
          <div :class="['flex h-11 w-11 items-center justify-center rounded-[18px]', item.tone === 'warn' ? 'bg-amber-100 text-amber-700' : item.tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : item.tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700']">
            <component :is="item.icon" class="h-5 w-5" />
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <article class="ds-panel p-5 sm:p-6">
        <div class="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 class="text-lg font-black text-stone-950">近 7 天营收节奏</h3>
            <p class="mt-1 text-xs font-semibold text-stone-400">看趋势，不只看单日数字</p>
          </div>
          <span class="ds-pill ds-pill-warn">实时</span>
        </div>

        <div v-if="(store.overview?.revenueTrend || []).length > 0" class="flex h-64 items-end gap-2 rounded-[24px] bg-[#FBF5EA] p-4">
          <div v-for="(d, i) in store.overview.revenueTrend" :key="i" class="flex flex-1 flex-col items-center gap-2">
            <div class="flex w-full items-end justify-center rounded-full bg-white/70 p-1">
              <div
                class="w-full rounded-full bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm transition-all duration-700"
                :style="{ height: Math.max(10, ((Number(d.amount || 0) / maxAmount) * 100)) + '%' }"
              />
            </div>
            <span class="text-[10px] font-bold text-stone-400">{{ (d.dt || '').slice(5) }}</span>
          </div>
        </div>
        <p v-else class="rounded-[24px] bg-[#FBF5EA] py-20 text-center text-sm font-bold text-stone-400">暂无趋势数据</p>
      </article>

      <article class="ds-panel p-5 sm:p-6">
        <div class="mb-5 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-black text-stone-950">热门摊位 TOP10</h3>
            <p class="mt-1 text-xs font-semibold text-stone-400">找到值得放大的样板</p>
          </div>
          <ArrowUpRight class="h-5 w-5 text-amber-600" />
        </div>
        <div v-if="(store.overview?.topStalls || []).length > 0" class="space-y-2">
          <div v-for="(s, i) in (store.overview.topStalls || []).slice(0, 10)" :key="i" class="flex items-center gap-3 rounded-[18px] p-2.5 transition hover:bg-[#FBF5EA]">
            <span :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black', i < 3 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-500']">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-black text-stone-900">{{ s.name }}</p>
              <p class="text-xs font-semibold text-stone-400">近期经营表现稳定</p>
            </div>
            <span class="text-sm font-black text-stone-950">{{ yuan((Number(s.revenue || 0) / 100).toFixed(0)) }}</span>
          </div>
        </div>
        <p v-else class="py-16 text-center text-sm font-bold text-stone-400">暂无排行数据</p>
      </article>
    </section>

    <section class="ds-panel p-5 sm:p-6">
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="text-lg font-black text-stone-950">低活跃商户提醒</h3>
          <p class="mt-1 text-xs font-semibold text-stone-400">优先联系沉默、停摆或转化明显下滑的商户</p>
        </div>
        <span class="ds-pill ds-pill-danger">
          <AlertTriangle class="h-3.5 w-3.5" />
          风险列表
        </span>
      </div>

      <div v-if="(store.overview?.lowActivityMerchants || []).length > 0" class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>商户名</th>
              <th>累计营收</th>
              <th>最后活跃</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(m, i) in store.overview.lowActivityMerchants" :key="i">
              <td class="font-black text-stone-900">{{ m.name }}</td>
              <td class="font-bold text-stone-700">{{ yuan((Number(m.revenue || 0) / 100).toFixed(0)) }}</td>
              <td class="font-semibold text-stone-500">{{ m.lastOrderAt || '从未活跃' }}</td>
              <td><span class="ds-pill ds-pill-danger">低活跃</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="rounded-[24px] bg-emerald-50 py-14 text-center text-sm font-bold text-emerald-700">所有商户经营状态正常</p>
    </section>
  </div>
</template>
