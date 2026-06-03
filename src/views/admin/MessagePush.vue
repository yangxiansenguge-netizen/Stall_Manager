<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { buildApiUrl } from '../../utils/api'
import { Megaphone, Plus, Search, Send, Trash2, X } from 'lucide-vue-next'

const store = useAdminStore()
const showForm = ref(false)
const form = ref({ title: '', content: '', targetType: 'ALL', targetIds: '' })
const merchantList = ref<any[]>([])
const selectedMerchants = ref<string[]>([])
const merchantSearch = ref('')

const loadMerchants = async () => {
  try {
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/admin/merchants'), {
      headers: { Authorization: `Bearer ${token}` },
    })
    const p = await resp.json()
    if (p.success && p.data?.list) merchantList.value = p.data.list
  } catch { }
}

const toggleMerchant = (mid: string) => {
  const idx = selectedMerchants.value.indexOf(mid)
  if (idx >= 0) selectedMerchants.value.splice(idx, 1)
  else selectedMerchants.value.push(mid)
  form.value.targetIds = selectedMerchants.value.join(',')
}

const filteredMerchants = () => {
  if (!merchantSearch.value) return merchantList.value
  const q = merchantSearch.value.toLowerCase()
  return merchantList.value.filter((m: any) =>
    (m.merchantName || m.merchant_name || '').includes(q) ||
    (m.phone || '').includes(q)
  )
}

const submitAnnouncement = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    store.showToast('请填写标题和内容')
    return
  }
  if (form.value.targetType === 'MERCHANT' && !form.value.targetIds) {
    store.showToast('请至少选择一个商户')
    return
  }
  await store.createAnnouncement({
    title: form.value.title.trim(),
    content: form.value.content.trim(),
    targetType: form.value.targetType,
    targetIds: form.value.targetIds || null,
  })
  showForm.value = false
  form.value = { title: '', content: '', targetType: 'ALL', targetIds: '' }
  selectedMerchants.value = []
}

const doDelete = (id: number) => {
  if (confirm('确定删除该公告？')) store.deleteAnnouncement(id)
}

const targetTypeLabel = (t: string) => {
  const map: Record<string, string> = { ALL: '全部用户', AREA: '按区域', CATEGORY: '按类目', MERCHANT: '指定商户' }
  return map[t] || t
}

watch(showForm, (val) => { if (val) loadMerchants() })

onMounted(() => {
  store.fetchAnnouncements()
})
</script>

<template>
  <div class="ds-shell">
    <section class="ds-surface p-5 sm:p-6">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="ds-eyebrow">Message Center</p>
          <h2 class="ds-title mt-2">公告不只是发送，是运营触达</h2>
          <p class="ds-subtitle max-w-2xl">按全部、区域、类目或指定商户发送消息，让商户知道活动、规则和审核结果。</p>
        </div>
        <button class="ds-button ds-button-primary" @click="showForm = true">
          <Plus class="h-4 w-4" />
          新建公告
        </button>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div class="space-y-3">
        <article v-for="a in store.announcements" :key="a.id" class="ds-panel p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="ds-pill ds-pill-info">{{ targetTypeLabel(a.targetType || a.target_type) }}</span>
                <span class="text-xs font-bold text-stone-400">{{ (a.createdAt || a.created_at || '').toString().slice(0, 16) }}</span>
              </div>
              <h3 class="mt-3 text-lg font-black leading-tight text-stone-950">{{ a.title }}</h3>
              <p class="mt-2 line-clamp-3 text-sm font-semibold leading-relaxed text-stone-600">{{ a.content }}</p>
            </div>
            <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100" @click="doDelete(a.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </article>
        <p v-if="store.announcements.length === 0" class="ds-panel py-20 text-center text-sm font-bold text-stone-400">暂无公告</p>
      </div>

      <aside class="ds-panel h-fit p-5">
        <div class="flex h-12 w-12 items-center justify-center rounded-[20px] bg-amber-100 text-amber-700">
          <Megaphone class="h-6 w-6" />
        </div>
        <h3 class="mt-4 text-lg font-black text-stone-950">触达建议</h3>
        <p class="mt-2 text-sm font-semibold leading-relaxed text-stone-500">标题说结果，正文说行动。面向小商户时，尽量避免制度化措辞，改成“你需要做什么”。</p>
        <div class="mt-5 space-y-2 text-sm font-bold text-stone-600">
          <p class="rounded-[16px] bg-[#FBF5EA] p-3">活动提醒：写清报名截止时间</p>
          <p class="rounded-[16px] bg-[#FBF5EA] p-3">规则调整：说明影响和生效日期</p>
          <p class="rounded-[16px] bg-[#FBF5EA] p-3">审核通知：给出下一步入口</p>
        </div>
      </aside>
    </section>

    <Teleport to="body">
      <Transition name="fade-slide">
        <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="drawer-backdrop absolute inset-0" @click="showForm = false" />
          <div class="relative w-full max-w-[560px] rounded-[30px] bg-[#FFFDF8] p-5 shadow-2xl sm:p-6">
            <div class="mb-5 flex items-start justify-between gap-4">
              <div>
                <p class="ds-eyebrow">Compose</p>
                <h2 class="mt-2 text-2xl font-black text-stone-950">新建公告</h2>
              </div>
              <button class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500" @click="showForm = false">
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="space-y-4">
              <input v-model="form.title" placeholder="公告标题，例如：周末夜市活动报名开始" class="ds-input" />
              <textarea v-model="form.content" rows="5" placeholder="公告内容，尽量写清楚商户下一步要做什么" class="ds-textarea" />
              <div>
                <label class="text-xs font-black uppercase tracking-[0.12em] text-stone-400">目标受众</label>
                <select v-model="form.targetType" class="ds-select mt-2">
                  <option value="ALL">全部用户</option>
                  <option value="AREA">按区域</option>
                  <option value="CATEGORY">按类目</option>
                  <option value="MERCHANT">指定商户</option>
                </select>
              </div>
              <!-- 指定商户：多选下拉 -->
              <div v-if="form.targetType === 'MERCHANT'" class="border border-stone-200 rounded-xl overflow-hidden max-h-56 flex flex-col">
                <div class="flex items-center gap-2 border-b border-stone-100 px-3 py-2 sticky top-0 bg-white">
                  <Search class="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <input v-model="merchantSearch" placeholder="搜索商户名或手机号" class="flex-1 text-xs font-semibold outline-none" />
                  <span v-if="selectedMerchants.length" class="text-[10px] font-bold text-amber-600 shrink-0">已选 {{ selectedMerchants.length }}</span>
                </div>
                <div class="overflow-y-auto">
                  <label v-for="m in filteredMerchants()" :key="m.merchantId || m.merchant_id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 cursor-pointer border-b border-stone-50 last:border-0 text-xs"
                  >
                    <input type="checkbox" :checked="selectedMerchants.includes(m.merchantId || m.merchant_id)"
                      @change="toggleMerchant(m.merchantId || m.merchant_id)"
                      class="accent-amber-500" />
                    <span class="font-bold text-stone-700">{{ m.merchantName || m.merchant_name || '未命名' }}</span>
                    <span class="text-stone-400 ml-auto">{{ m.phone }}</span>
                  </label>
                  <p v-if="filteredMerchants().length === 0" class="px-3 py-6 text-center text-xs text-stone-400">无匹配商户</p>
                </div>
              </div>
              <!-- 区域/类目：文本输入 -->
              <input v-else-if="form.targetType !== 'ALL'" v-model="form.targetIds" class="ds-input" :placeholder="form.targetType === 'AREA' ? '区域 ID，逗号分隔' : '类目 ID，逗号分隔'" />
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <button class="ds-button ds-button-soft" @click="showForm = false">取消</button>
              <button class="ds-button ds-button-primary" @click="submitAnnouncement">
                <Send class="h-4 w-4" />
                发送
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
