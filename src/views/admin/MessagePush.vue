<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Plus, Trash2 } from 'lucide-vue-next'

const store = useAdminStore()
const showForm = ref(false)
const form = ref({ title: '', content: '', targetType: 'ALL', targetIds: '' })

const submitAnnouncement = () => {
  if (!form.value.title || !form.value.content) {
    store.showToast('请填写标题和内容')
    return
  }
  store.createAnnouncement({
    title: form.value.title,
    content: form.value.content,
    targetType: form.value.targetType,
    targetIds: form.value.targetIds || null,
  }).then(() => {
    showForm.value = false
    form.value = { title: '', content: '', targetType: 'ALL', targetIds: '' }
  })
}

const doDelete = (id: number) => {
  if (confirm('确定删除该公告？')) store.deleteAnnouncement(id)
}

const targetTypeLabel = (t: string) => {
  const map: Record<string, string> = { ALL: '全部用户', AREA: '按区域', CATEGORY: '按类目', MERCHANT: '指定商户' }
  return map[t] || t
}

onMounted(() => {
  store.fetchAnnouncements()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black text-stone-900">消息公告</h1>
      <button @click="showForm = true" class="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition">
        <Plus class="w-3.5 h-3.5" /> 新建公告
      </button>
    </div>

    <!-- Announcement List -->
    <div class="space-y-3">
      <div v-for="a in store.announcements" :key="a.id" class="bg-white rounded-xl p-4 border border-stone-100">
        <div class="flex items-start justify-between">
          <div class="space-y-2 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-stone-900">{{ a.title }}</h3>
              <span class="px-2 py-0.5 bg-stone-100 rounded-full text-[10px] font-medium text-stone-500">{{ targetTypeLabel(a.targetType || a.target_type) }}</span>
            </div>
            <p class="text-xs text-stone-500 leading-relaxed line-clamp-2">{{ a.content }}</p>
            <p class="text-[10px] text-stone-400">{{ (a.createdAt || a.created_at || '').toString().slice(0, 16) }}</p>
          </div>
          <button @click="doDelete(a.id)" class="shrink-0 text-stone-300 hover:text-red-400 transition p-1">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
      <p v-if="store.announcements.length === 0" class="text-xs text-stone-400 text-center py-12">暂无公告</p>
    </div>

    <!-- Create Modal -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl space-y-4">
        <h2 class="text-base font-black text-stone-900">新建公告</h2>

        <input v-model="form.title" placeholder="公告标题" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />

        <textarea v-model="form.content" rows="4" placeholder="公告内容" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs resize-none"></textarea>

        <div>
          <label class="text-[10px] font-bold text-stone-400 uppercase">目标受众</label>
          <select v-model="form.targetType" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs mt-1">
            <option value="ALL">全部用户</option>
            <option value="AREA">按区域</option>
            <option value="CATEGORY">按类目</option>
            <option value="MERCHANT">指定商户</option>
          </select>
        </div>

        <div v-if="form.targetType !== 'ALL'">
          <label class="text-[10px] font-bold text-stone-400 uppercase">目标ID（逗号分隔）</label>
          <input v-model="form.targetIds" :placeholder="form.targetType === 'MERCHANT' ? 'merchant-001,merchant-002' : '区域ID或类目ID'" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs mt-1" />
        </div>

        <div class="flex gap-3 pt-2">
          <button @click="showForm = false" class="flex-1 border border-stone-200 rounded-xl py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-50">取消</button>
          <button @click="submitAnnouncement" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-xs font-bold">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>
