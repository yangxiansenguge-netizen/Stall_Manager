import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminApi } from '../api/admin'

export const useAdminStore = defineStore('admin', () => {
  // Dashboard
  const overview = ref<any>(null)
  const loading = ref(false)

  // Reviews
  const pendingReviews = ref<any[]>([])
  const currentDetail = ref<any>(null)
  const pendingCount = computed(() => pendingReviews.value.length)
  let lastLevel = 'FIRST'

  // Merchants
  const merchants = ref<any[]>([])
  const currentMerchant = ref<any>(null)

  // Announcements
  const announcements = ref<any[]>([])

  // Banners
  const banners = ref<any[]>([])

  // Toast
  const toastMessage = ref('')
  const toastVisible = ref(false)

  const showToast = (msg: string) => {
    toastMessage.value = msg
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, 3000)
  }

  // Dashboard
  const fetchOverview = async () => {
    loading.value = true
    try {
      overview.value = await adminApi.getOverview()
    } catch { showToast('加载失败') }
    finally { loading.value = false }
  }

  // Reviews
  const fetchPendingReviews = async (level = 'FIRST') => {
    lastLevel = level
    pendingReviews.value = await adminApi.getPendingReviews(level)
  }

  const fetchReviewDetail = async (id: number) => {
    currentDetail.value = await adminApi.getReviewDetail(id)
  }

  const submitReview = async (id: number, body: Record<string, any>) => {
    const result = await adminApi.submitReview(id, body)
    if (result) {
      showToast(body.action === 'REJECT' ? '已驳回' : '审核通过')
      await fetchPendingReviews(lastLevel)
    }
    return result
  }

  const assignStall = async (id: number, body: Record<string, any>) => {
    const result = await adminApi.assignStall(id, body)
    if (result) {
      showToast('摊位分配成功')
      await fetchPendingReviews(lastLevel)
    }
    return result
  }

  // Merchants
  const fetchMerchants = async (page = 1, keyword = '') => {
    const result = await adminApi.getMerchants(page, keyword)
    merchants.value = result?.list || []
    return result
  }

  const fetchMerchantDetail = async (merchantId: string) => {
    currentMerchant.value = await adminApi.getMerchantDetail(merchantId)
  }

  const updateMerchantStatus = async (merchantId: string, status: string) => {
    const result = await adminApi.updateMerchantStatus(merchantId, status)
    if (result) showToast(status === 'ACTIVE' ? '已启用' : '已禁用')
    return result
  }

  // Announcements
  const fetchAnnouncements = async () => {
    announcements.value = await adminApi.getAnnouncements()
  }

  const createAnnouncement = async (body: Record<string, any>) => {
    const result = await adminApi.createAnnouncement(body)
    if (result) { showToast('公告已发送'); await fetchAnnouncements() }
    return result
  }

  const deleteAnnouncement = async (id: number) => {
    const ok = await adminApi.deleteAnnouncement(id)
    if (ok) { showToast('已删除'); await fetchAnnouncements() }
  }

  // Banners
  const fetchBanners = async () => {
    banners.value = await adminApi.getBanners()
  }

  const createBanner = async (body: Record<string, any>) => {
    const result = await adminApi.createBanner(body)
    if (result) { showToast('Banner 已创建'); await fetchBanners() }
    return result
  }

  const updateBanner = async (body: Record<string, any>) => {
    const result = await adminApi.updateBanner(body)
    if (result) { showToast('Banner 已更新'); await fetchBanners() }
    return result
  }

  const toggleBanner = async (id: number) => {
    const ok = await adminApi.toggleBanner(id)
    if (ok) { showToast('状态已切换'); await fetchBanners() }
  }

  const deleteBanner = async (id: number) => {
    const ok = await adminApi.deleteBanner(id)
    if (ok) { showToast('已删除'); await fetchBanners() }
  }

  return {
    overview, loading,
    pendingReviews, pendingCount, currentDetail,
    merchants, currentMerchant,
    announcements,
    banners,
    toastMessage, toastVisible, showToast,
    fetchOverview,
    fetchPendingReviews, fetchReviewDetail, submitReview, assignStall,
    fetchMerchants, fetchMerchantDetail, updateMerchantStatus,
    fetchAnnouncements, createAnnouncement, deleteAnnouncement,
    fetchBanners, createBanner, updateBanner, toggleBanner, deleteBanner,
  }
})
