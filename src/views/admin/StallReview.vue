<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Eye, CheckCircle, XCircle, MapPin } from 'lucide-vue-next'

const store = useAdminStore()
const activeTab = ref<'FIRST' | 'FINAL'>('FIRST')
const detailOpen = ref(false)
const assignForm = ref({ stallCode: '', areaName: '', expireAt: '' })
const reviewComment = ref('')
const showAssignForm = ref(false)

const switchTab = (t: 'FIRST' | 'FINAL') => {
  activeTab.value = t
  store.fetchPendingReviews(t)
}

const openDetail = async (id: number) => {
  await store.fetchReviewDetail(id)
  detailOpen.value = true
  reviewComment.value = ''
  showAssignForm.value = false
}

const doReview = (action: string) => {
  const detail = store.currentDetail
  if (!detail) return
  const level = activeTab.value
  store.submitReview(detail.id, { action, reviewLevel: level, comment: reviewComment.value })
  detailOpen.value = false
}

const doAssign = () => {
  const detail = store.currentDetail
  if (!detail) return
  store.assignStall(detail.id, {
    reviewLevel: 'FINAL',
    stallCode: assignForm.value.stallCode,
    areaName: assignForm.value.areaName,
    expireAt: assignForm.value.expireAt,
    action: 'APPROVE',
  })
  detailOpen.value = false
}

const statusLabel = (s: string) => {
  if (s === 'PENDING_FIRST') return '待初审'
  if (s === 'FIRST_APPROVED') return '待复审'
  if (s === 'APPROVED') return '已通过'
  if (s === 'REJECTED') return '已驳回'
  return s
}

onMounted(() => {
  store.fetchPendingReviews('FIRST')
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-black text-stone-900">摊位审核</h1>

    <!-- Tabs -->
    <div class="flex gap-2">
      <button @click="switchTab('FIRST')"
        :class="['px-4 py-2 rounded-xl text-sm font-bold transition', activeTab === 'FIRST' ? 'bg-amber-100 text-amber-700' : 'bg-white text-stone-500 border border-stone-200']">
        待初审
      </button>
      <button @click="switchTab('FINAL')"
        :class="['px-4 py-2 rounded-xl text-sm font-bold transition', activeTab === 'FINAL' ? 'bg-amber-100 text-amber-700' : 'bg-white text-stone-500 border border-stone-200']">
        待复审
      </button>
    </div>

    <!-- Review List -->
    <div class="bg-white rounded-2xl border border-stone-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
            <th class="px-4 py-3">商户</th><th class="px-4 py-3">摊位名</th><th class="px-4 py-3">类目</th><th class="px-4 py-3">区域</th><th class="px-4 py-3">申请时间</th><th class="px-4 py-3">状态</th><th class="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.pendingReviews" :key="item.id" class="border-b border-stone-50 hover:bg-stone-50/50 transition">
            <td class="px-4 py-3 text-xs font-medium text-stone-700">{{ item.merchant_name || '--' }}</td>
            <td class="px-4 py-3 text-xs text-stone-700">{{ item.applicant_name || '--' }}</td>
            <td class="px-4 py-3 text-xs text-stone-500">{{ item.category_name || '--' }}</td>
            <td class="px-4 py-3 text-xs text-stone-500">{{ item.selected_area || '--' }}</td>
            <td class="px-4 py-3 text-xs text-stone-400">{{ (item.created_at || '').toString().slice(0, 10) }}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="activeTab === 'FIRST' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'">{{ statusLabel(item.status) }}</span></td>
            <td class="px-4 py-3">
              <button @click="openDetail(item.id)" class="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition">
                <Eye class="w-3.5 h-3.5" /> 审核
              </button>
            </td>
          </tr>
          <tr v-if="store.pendingReviews.length === 0">
            <td colspan="7" class="px-4 py-12 text-center text-xs text-stone-400">暂无待审核申请</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Drawer -->
    <div v-if="detailOpen" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-stone-900/20 backdrop-blur-sm" @click="detailOpen = false"></div>
      <div class="relative w-[480px] max-w-[90vw] bg-white h-full overflow-y-auto shadow-2xl">
        <div class="p-6 space-y-5" v-if="store.currentDetail">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-stone-900">审核详情</h2>
            <button @click="detailOpen = false" class="text-stone-400 hover:text-stone-600 text-sm font-bold">关闭</button>
          </div>

          <!-- Basic Info -->
          <div class="space-y-3 text-sm">
            <div class="flex justify-between"><span class="text-stone-400">商户</span><span class="font-medium">{{ store.currentDetail.merchant_name }}</span></div>
            <div class="flex justify-between"><span class="text-stone-400">摊位名</span><span class="font-medium">{{ store.currentDetail.applicant_name }}</span></div>
            <div class="flex justify-between"><span class="text-stone-400">类目</span><span class="font-medium">{{ store.currentDetail.category_name }}</span></div>
            <div class="flex justify-between"><span class="text-stone-400">地址</span><span class="font-medium flex items-center gap-1"><MapPin class="w-3 h-3" />{{ store.currentDetail.display_address || store.currentDetail.selected_area || '--' }}</span></div>
            <div class="flex justify-between"><span class="text-stone-400">申请时间</span><span class="font-medium">{{ (store.currentDetail.created_at || '').toString().slice(0, 10) }}</span></div>
          </div>

          <!-- Image -->
          <div v-if="store.currentDetail.business_image_url" class="rounded-xl overflow-hidden border border-stone-100">
            <img :src="store.currentDetail.business_image_url" alt="摊位图" class="w-full h-48 object-cover" />
          </div>

          <!-- Description -->
          <div v-if="store.currentDetail.remark" class="bg-stone-50 rounded-xl p-4">
            <p class="text-xs text-stone-500">{{ store.currentDetail.remark }}</p>
          </div>

          <!-- Review History -->
          <div v-if="(store.currentDetail.reviewLogs || []).length > 0" class="space-y-2">
            <h3 class="text-sm font-bold text-stone-700">审核记录</h3>
            <div v-for="log in store.currentDetail.reviewLogs" :key="log.id" class="text-xs text-stone-500 bg-stone-50 rounded-lg p-3">
              <span class="font-medium">{{ log.reviewLevel === 'FIRST' ? '初审' : '复审' }}</span>
              · {{ log.action === 'APPROVE' ? '✅ 通过' : '❌ 驳回' }}
              · {{ (log.reviewedAt || '').toString().slice(0, 16) }}
              <p v-if="log.comment" class="mt-1">{{ log.comment }}</p>
            </div>
          </div>

          <!-- Assign Form (复审通过后) -->
          <div v-if="showAssignForm" class="space-y-3 bg-amber-50 rounded-xl p-4">
            <h3 class="text-sm font-bold text-amber-700">摊位分配</h3>
            <input v-model="assignForm.stallCode" placeholder="摊位编号" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
            <input v-model="assignForm.areaName" placeholder="区域名称" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
            <input v-model="assignForm.expireAt" type="date" placeholder="到期时间" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
            <button @click="doAssign" class="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-bold transition">确认分配</button>
          </div>

          <!-- Comment -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-stone-500">审核意见</label>
            <textarea v-model="reviewComment" rows="3" placeholder="请输入审核意见（驳回时必填）" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs resize-none"></textarea>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button @click="doReview('REJECT')" class="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2.5 text-sm font-bold transition">
              <XCircle class="w-4 h-4" /> 驳回
            </button>
            <button v-if="activeTab === 'FINAL'" @click="showAssignForm = !showAssignForm" class="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-bold transition">
              <CheckCircle class="w-4 h-4" /> {{ showAssignForm ? '取消分配' : '通过并分配' }}
            </button>
            <button v-else @click="doReview('APPROVE')" class="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-bold transition">
              <CheckCircle class="w-4 h-4" /> 通过
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
