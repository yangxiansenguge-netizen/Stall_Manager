<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { Plus, Edit3, Trash2, Power, PowerOff } from 'lucide-vue-next'

const store = useAdminStore()
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref({ id: null as number | null, title: '', imageUrl: '', linkUrl: '', position: 'HOME', sortOrder: 0 })

const openCreate = () => {
  editing.value = null
  form.value = { id: null, title: '', imageUrl: '', linkUrl: '', position: 'HOME', sortOrder: 0 }
  showForm.value = true
}

const openEdit = (b: any) => {
  editing.value = b
  form.value = {
    id: b.id,
    title: b.title || '',
    imageUrl: b.imageUrl || b.image_url || '',
    linkUrl: b.linkUrl || b.link_url || '',
    position: b.position || 'HOME',
    sortOrder: b.sortOrder ?? b.sort_order ?? 0,
  }
  showForm.value = true
}

const submitBanner = () => {
  if (!form.value.title || !form.value.imageUrl) {
    store.showToast('请填写标题和图片URL')
    return
  }
  if (editing.value) {
    store.updateBanner(form.value).then(() => { showForm.value = false })
  } else {
    store.createBanner(form.value).then(() => { showForm.value = false })
  }
}

const doToggle = (id: number) => store.toggleBanner(id)
const doDelete = (id: number) => { if (confirm('确定删除？')) store.deleteBanner(id) }

onMounted(() => { store.fetchBanners() })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-black text-stone-900">Banner 管理</h1>
      <button @click="openCreate" class="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition">
        <Plus class="w-3.5 h-3.5" /> 新建 Banner
      </button>
    </div>

    <!-- Banner Grid -->
    <div class="grid grid-cols-2 gap-4">
      <div v-for="b in store.banners" :key="b.id" class="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div class="h-32 bg-stone-100">
          <img v-if="b.imageUrl || b.image_url" :src="b.imageUrl || b.image_url" alt="Banner" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-stone-300 text-xs">暂无图片</div>
        </div>
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-stone-900 truncate">{{ b.title }}</h3>
            <span :class="(b.isActive === false || b.is_active === false) ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'" class="px-2 py-0.5 rounded-full text-[10px] font-bold">
              {{ (b.isActive === false || b.is_active === false) ? '已下线' : '已上线' }}
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button @click="openEdit(b)" class="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-[10px] font-bold text-stone-600 transition">
              <Edit3 class="w-3 h-3" /> 编辑
            </button>
            <button @click="doToggle(b.id)" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition"
              :class="(b.isActive === false || b.is_active === false) ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'">
              <Power v-if="(b.isActive === false || b.is_active === false)" class="w-3 h-3" />
              <PowerOff v-else class="w-3 h-3" />
              {{ (b.isActive === false || b.is_active === false) ? '上线' : '下线' }}
            </button>
            <button @click="doDelete(b.id)" class="flex items-center gap-1 px-2.5 py-1.5 text-red-400 hover:bg-red-50 rounded-lg text-[10px] font-bold transition">
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Modal -->
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/20 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl space-y-4">
        <h2 class="text-base font-black text-stone-900">{{ editing ? '编辑 Banner' : '新建 Banner' }}</h2>

        <input v-model="form.title" placeholder="标题" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
        <input v-model="form.imageUrl" placeholder="图片URL（支持 OSS 上传）" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
        <input v-model="form.linkUrl" placeholder="跳转链接" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />
        <input v-model.number="form.sortOrder" type="number" placeholder="排序号" class="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs" />

        <div class="flex gap-3 pt-2">
          <button @click="showForm = false" class="flex-1 border border-stone-200 rounded-xl py-2.5 text-xs font-bold text-stone-500 hover:bg-stone-50">取消</button>
          <button @click="submitBanner" class="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-xs font-bold">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>
