<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { CheckCircle, ClipboardCheck, Eye, MapPin, ShieldCheck, X, XCircle } from 'lucide-vue-next'

const store = useAdminStore()
const activeTab = ref<'FIRST' | 'FINAL'>('FIRST')
const detailOpen = ref(false)
const assignForm = ref({ stallCode: '', areaName: '', expireAt: '' })
const reviewComment = ref('')
const showAssignForm = ref(false)

const tabs = [
  { id: 'FIRST', label: '待初审', desc: '资料是否完整、经营内容是否合规' },
  { id: 'FINAL', label: '待复审', desc: '确认点位、区域和到期时间' },
] as const

const statusLabel = (s: string) => {
  if (s === 'PENDING_FIRST') return '待初审'
  if (s === 'FIRST_APPROVED') return '待复审'
  if (s === 'APPROVED') return '已通过'
  if (s === 'REJECTED') return '已驳回'
  return s || '待处理'
}

const activeTitle = computed(() => tabs.find((t) => t.id === activeTab.value)?.label)

const switchTab = (t: 'FIRST' | 'FINAL') => {
  activeTab.value = t
  store.fetchPendingReviews(t)
}

const openDetail = async (id: number) => {
  await store.fetchReviewDetail(id)
  detailOpen.value = true
  reviewComment.value = ''
  showAssignForm.value = false
  assignForm.value = { stallCode: '', areaName: '', expireAt: '' }
}

const doReview = async (action: string) => {
  const detail = store.currentDetail
  if (!detail) return
  await store.submitReview(detail.id, { action, reviewLevel: activeTab.value, comment: reviewComment.value })
  detailOpen.value = false
}

const doAssign = async () => {
  const detail = store.currentDetail
  if (!detail) return
  await store.assignStall(detail.id, {
    reviewLevel: 'FINAL',
    stallCode: assignForm.value.stallCode,
    areaName: assignForm.value.areaName,
    expireAt: assignForm.value.expireAt,
    action: 'APPROVE',
    comment: reviewComment.value,
  })
  detailOpen.value = false
}

onMounted(() => {
  store.fetchPendingReviews('FIRST')
})
</script>

<template>
  <div class="ds-shell">
    <section class="ds-surface p-5 sm:p-6">
      <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="ds-eyebrow">Review Queue</p>
          <h2 class="ds-title mt-2">把审核做成清晰的待办流</h2>
          <p class="ds-subtitle max-w-2xl">运营人员先处理状态，再进入详情。资料、图片、地址、意见和分配动作集中在一个抽屉里完成。</p>
        </div>
        <div class="grid grid-cols-2 gap-2 rounded-[24px] bg-[#F4EAD8] p-1.5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['rounded-[18px] px-4 py-3 text-left transition', activeTab === tab.id ? 'bg-white shadow-sm' : 'hover:bg-white/45']"
            @click="switchTab(tab.id)"
          >
            <p class="text-sm font-black text-stone-950">{{ tab.label }}</p>
            <p class="mt-0.5 hidden text-[11px] font-semibold text-stone-500 sm:block">{{ tab.desc }}</p>
          </button>
        </div>
      </div>
    </section>

    <section class="ds-panel p-4 sm:p-5">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-black text-stone-950">{{ activeTitle }}队列</h3>
          <p class="text-xs font-semibold text-stone-400">共 {{ store.pendingReviews.length }} 条待处理申请</p>
        </div>
        <span class="ds-pill ds-pill-warn">
          <ClipboardCheck class="h-3.5 w-3.5" />
          {{ activeTitle }}
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="admin-table">
          <thead>
            <tr>
              <th>商户</th>
              <th>摊位</th>
              <th>类目</th>
              <th>区域</th>
              <th>申请时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.pendingReviews" :key="item.id">
              <td class="font-black text-stone-900">{{ item.merchant_name || '--' }}</td>
              <td class="font-bold text-stone-700">{{ item.applicant_name || '--' }}</td>
              <td class="font-semibold text-stone-500">{{ item.category_name || '--' }}</td>
              <td class="font-semibold text-stone-500">{{ item.selected_area || '--' }}</td>
              <td class="font-semibold text-stone-400">{{ (item.created_at || '').toString().slice(0, 10) }}</td>
              <td><span :class="['ds-pill', activeTab === 'FIRST' ? 'ds-pill-info' : 'ds-pill-warn']">{{ statusLabel(item.status) }}</span></td>
              <td>
                <button class="ds-button ds-button-warm h-9 px-3" @click="openDetail(item.id)">
                  <Eye class="h-4 w-4" />
                  审核
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="store.pendingReviews.length === 0" class="rounded-[24px] bg-[#FBF5EA] py-16 text-center text-sm font-bold text-stone-400">暂无待审核申请</p>
    </section>

    <Teleport to="body">
      <Transition name="fade-slide">
        <div v-if="detailOpen" class="fixed inset-0 z-50 flex justify-end">
          <div class="drawer-backdrop absolute inset-0" @click="detailOpen = false" />
          <aside class="drawer-panel relative h-full w-full max-w-[560px] overflow-y-auto">
            <div v-if="store.currentDetail" class="space-y-5 p-5 sm:p-7">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="ds-eyebrow">Application Detail</p>
                  <h2 class="mt-2 text-2xl font-black text-stone-950">审核详情</h2>
                </div>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500" @click="detailOpen = false">
                  <X class="h-5 w-5" />
                </button>
              </div>

              <div class="ds-panel p-4">
                <div class="grid gap-3 text-sm">
                  <div class="flex justify-between gap-4"><span class="text-stone-400">商户</span><span class="font-black text-stone-900">{{ store.currentDetail.merchant_name || '--' }}</span></div>
                  <div class="flex justify-between gap-4"><span class="text-stone-400">摊位名</span><span class="font-black text-stone-900">{{ store.currentDetail.applicant_name || '--' }}</span></div>
                  <div class="flex justify-between gap-4"><span class="text-stone-400">类目</span><span class="font-bold text-stone-700">{{ store.currentDetail.category_name || '--' }}</span></div>
                  <div class="flex justify-between gap-4"><span class="text-stone-400">地址</span><span class="flex items-center gap-1 text-right font-bold text-stone-700"><MapPin class="h-3.5 w-3.5" />{{ store.currentDetail.display_address || store.currentDetail.selected_area || '--' }}</span></div>
                  <div class="flex justify-between gap-4"><span class="text-stone-400">申请时间</span><span class="font-bold text-stone-700">{{ (store.currentDetail.created_at || '').toString().slice(0, 10) }}</span></div>
                </div>
              </div>

              <div v-if="store.currentDetail.business_image_url" class="overflow-hidden rounded-[24px] border border-stone-100">
                <img :src="store.currentDetail.business_image_url" alt="摊位图" class="h-56 w-full object-cover" />
              </div>

              <div v-if="store.currentDetail.remark" class="rounded-[22px] bg-[#FBF5EA] p-4">
                <p class="text-sm font-semibold leading-relaxed text-stone-600">{{ store.currentDetail.remark }}</p>
              </div>

              <div v-if="(store.currentDetail.reviewLogs || []).length > 0" class="space-y-2">
                <h3 class="text-sm font-black text-stone-800">审核记录</h3>
                <div v-for="log in store.currentDetail.reviewLogs" :key="log.id" class="rounded-[18px] bg-white p-3 text-xs font-semibold text-stone-500 shadow-sm ring-1 ring-stone-100">
                  <span class="font-black text-stone-800">{{ log.reviewLevel === 'FIRST' ? '初审' : '复审' }}</span>
                  · {{ log.action === 'APPROVE' ? '通过' : '驳回' }}
                  · {{ (log.reviewedAt || '').toString().slice(0, 16) }}
                  <p v-if="log.comment" class="mt-1 leading-relaxed">{{ log.comment }}</p>
                </div>
              </div>

              <div v-if="showAssignForm" class="ds-panel space-y-3 bg-amber-50/70 p-4">
                <h3 class="flex items-center gap-2 text-sm font-black text-amber-800">
                  <ShieldCheck class="h-4 w-4" />
                  摊位分配
                </h3>
                <input v-model="assignForm.stallCode" placeholder="摊位编号" class="ds-input" />
                <input v-model="assignForm.areaName" placeholder="区域名称" class="ds-input" />
                <input v-model="assignForm.expireAt" type="date" class="ds-input" />
                <button class="ds-button ds-button-primary w-full" @click="doAssign">确认通过并分配</button>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-black uppercase tracking-[0.12em] text-stone-400">审核意见</label>
                <textarea v-model="reviewComment" rows="4" placeholder="驳回时建议写清楚补充材料或整改方向" class="ds-textarea" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <button class="ds-button border border-red-200 bg-red-50 text-red-600" @click="doReview('REJECT')">
                  <XCircle class="h-4 w-4" />
                  驳回
                </button>
                <button v-if="activeTab === 'FINAL'" class="ds-button ds-button-warm" @click="showAssignForm = !showAssignForm">
                  <CheckCircle class="h-4 w-4" />
                  {{ showAssignForm ? '收起分配' : '通过并分配' }}
                </button>
                <button v-else class="ds-button bg-emerald-600 text-white" @click="doReview('APPROVE')">
                  <CheckCircle class="h-4 w-4" />
                  初审通过
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
