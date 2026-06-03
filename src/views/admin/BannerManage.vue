<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminStore } from '../../stores/adminStore'
import { buildApiUrl } from '../../utils/api'
import { Edit3, ImagePlus, Link, Plus, Power, PowerOff, Trash2, Upload, X } from 'lucide-vue-next'

const store = useAdminStore()
const showForm = ref(false)
const editing = ref<any>(null)
const form = ref({ id: null as number | null, title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', sortOrder: 0 })

// OSS 上传
const fileInputRef = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const triggerUpload = () => fileInputRef.value?.click()

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { store.showToast('文件大小不能超过 5MB'); return }

  isUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const token = localStorage.getItem('stall_auth_token') || ''
    const resp = await fetch(buildApiUrl('/api/common/upload'), {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    })
    const result = await resp.json()
    if (result.code === 200 || result.success) {
      form.value.imageUrl = result.data
      store.showToast('图片已上传')
    } else {
      throw new Error(result.message || '上传失败')
    }
  } catch (e: any) {
    store.showToast(e.message || '上传失败')
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const openCreate = () => {
  editing.value = null
  form.value = { id: null, title: '', imageUrl: '', linkUrl: '', position: 'HOME_HERO', sortOrder: 0 }
  showForm.value = true
}

const openEdit = (b: any) => {
  editing.value = b
  form.value = {
    id: b.id,
    title: b.title || '',
    imageUrl: b.imageUrl || b.image_url || '',
    linkUrl: b.linkUrl || b.link_url || '',
    position: b.position || 'HOME_HERO',
    sortOrder: b.sortOrder ?? b.sort_order ?? 0,
  }
  showForm.value = true
}

const submitBanner = async () => {
  if (!form.value.title.trim() || !form.value.imageUrl.trim()) {
    store.showToast('请填写标题和图片 URL')
    return
  }
  if (editing.value) await store.updateBanner(form.value)
  else await store.createBanner(form.value)
  showForm.value = false
}

const doToggle = (id: number) => store.toggleBanner(id)
const doDelete = (id: number) => {
  if (confirm('确定删除？')) store.deleteBanner(id)
}

const isOffline = (b: any) => b.isActive === false || b.is_active === false

onMounted(() => {
  store.fetchBanners()
})
</script>

<template>
  <div class="ds-shell">
    <section class="ds-surface overflow-hidden p-5 sm:p-6">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="ds-eyebrow">Exposure Slots</p>
          <h2 class="ds-title mt-2">Banner 是用户第一眼的生意机会</h2>
          <p class="ds-subtitle max-w-2xl">用更像内容运营的方式管理活动图，不只是上传图片和上下线。</p>
        </div>
        <button class="ds-button ds-button-primary" @click="openCreate">
          <Plus class="h-4 w-4" />
          新建 Banner
        </button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="b in store.banners" :key="b.id" class="ds-panel overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
        <div class="relative h-44 bg-[#F4EAD8]">
          <img v-if="b.imageUrl || b.image_url" :src="b.imageUrl || b.image_url" alt="Banner" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center text-stone-300">
            <ImagePlus class="h-12 w-12" />
          </div>
          <div class="absolute left-3 top-3">
            <span :class="['ds-pill', isOffline(b) ? 'ds-pill-danger' : 'ds-pill-ok']">{{ isOffline(b) ? '已下线' : '已上线' }}</span>
          </div>
        </div>
        <div class="space-y-4 p-4">
          <div>
            <h3 class="truncate text-lg font-black text-stone-950">{{ b.title }}</h3>
            <p class="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-stone-400">
              <Link class="h-3.5 w-3.5" />
              {{ b.linkUrl || b.link_url || '未配置跳转链接' }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="ds-button ds-button-soft h-9 px-3" @click="openEdit(b)">
              <Edit3 class="h-4 w-4" />
              编辑
            </button>
            <button class="ds-button h-9 px-3" :class="isOffline(b) ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'" @click="doToggle(b.id)">
              <Power v-if="isOffline(b)" class="h-4 w-4" />
              <PowerOff v-else class="h-4 w-4" />
              {{ isOffline(b) ? '上线' : '下线' }}
            </button>
            <button class="ds-button h-9 bg-red-50 px-3 text-red-500" @click="doDelete(b.id)">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </section>

    <p v-if="store.banners.length === 0" class="ds-panel py-20 text-center text-sm font-bold text-stone-400">暂无 Banner</p>

    <Teleport to="body">
      <Transition name="fade-slide">
        <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="drawer-backdrop absolute inset-0" @click="showForm = false" />
          <div class="relative grid w-full max-w-[840px] overflow-hidden rounded-[30px] bg-[#FFFDF8] shadow-2xl lg:grid-cols-[1fr_340px]">
            <div class="p-5 sm:p-6">
              <div class="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p class="ds-eyebrow">{{ editing ? 'Edit Banner' : 'New Banner' }}</p>
                  <h2 class="mt-2 text-2xl font-black text-stone-950">{{ editing ? '编辑 Banner' : '新建 Banner' }}</h2>
                </div>
                <button class="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500" @click="showForm = false">
                  <X class="h-5 w-5" />
                </button>
              </div>
              <div class="space-y-4">
                <input v-model="form.title" placeholder="标题，例如：周末夜市狂欢季" class="ds-input" />
                <!-- OSS 图片上传 -->
                <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileChange" />
                <div v-if="form.imageUrl" class="flex items-center gap-2">
                  <img :src="form.imageUrl" class="h-12 w-20 rounded-xl object-cover border border-stone-200" />
                  <div class="flex-1 min-w-0">
                    <input v-model="form.imageUrl" placeholder="图片 URL" class="ds-input" />
                  </div>
                  <button @click="triggerUpload" class="ds-button ds-button-soft h-10 shrink-0 px-3" :disabled="isUploading">
                    <Upload class="h-4 w-4" />
                    {{ isUploading ? '上传中...' : '更换' }}
                  </button>
                </div>
                <div v-else @click="triggerUpload" class="cursor-pointer rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-5 text-center transition hover:bg-amber-50">
                  <Upload v-if="!isUploading" class="mx-auto h-6 w-6 text-amber-500" />
                  <div v-else class="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                  <p class="mt-2 text-xs font-bold text-stone-600">{{ isUploading ? '上传中...' : '点击上传 Banner 图片' }}</p>
                  <p class="text-[10px] font-medium text-stone-400">支持 JPG / PNG，不超过 5MB</p>
                </div>
                <input v-model="form.linkUrl" placeholder="跳转链接" class="ds-input" />
                <div class="grid grid-cols-2 gap-3">
                  <select v-model="form.position" class="ds-select">
                    <option value="HOME_HERO">首页主Banner</option>
                    <option value="HOME_TREND">首页周边动态</option>
                    <option value="HOME_FEATURED">首页精选</option>
                    <option value="STALL_HOT_AREA">摊位-城市盲盒</option>
                    <option value="STALL_WEEKLY">摊位-周刊主文章</option>
                    <option value="STALL_WEEKLY_CARD">摊位-周刊卡片</option>
                  </select>
                  <input v-model.number="form.sortOrder" type="number" placeholder="排序号" class="ds-input" />
                </div>
              </div>
              <div class="mt-6 grid grid-cols-2 gap-3">
                <button class="ds-button ds-button-soft" @click="showForm = false">取消</button>
                <button class="ds-button ds-button-primary" @click="submitBanner">保存</button>
              </div>
            </div>
            <aside class="border-t border-stone-100 bg-[#FBF5EA] p-5 lg:border-l lg:border-t-0">
              <p class="text-sm font-black text-stone-950">移动端预览</p>
              <div class="mt-4 overflow-hidden rounded-[26px] border border-white bg-white shadow-lg">
                <div class="h-40 bg-stone-100">
                  <img v-if="form.imageUrl" :src="form.imageUrl" alt="预览图" class="h-full w-full object-cover" />
                  <div v-else class="flex h-full items-center justify-center text-stone-300">
                    <ImagePlus class="h-12 w-12" />
                  </div>
                </div>
                <div class="p-4">
                  <h3 class="line-clamp-2 text-lg font-black leading-tight text-stone-950">{{ form.title || 'Banner 标题' }}</h3>
                  <p class="mt-2 truncate text-xs font-semibold text-stone-400">{{ form.linkUrl || '点击后跳转到活动或内容页' }}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
