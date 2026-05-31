import { buildApiUrl } from '../utils/api'

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('stall_auth_token') || ''}`,
})

export const adminApi = {
  // Dashboard
  async getOverview(): Promise<any> {
    const resp = await fetch(buildApiUrl('/api/admin/dashboard/overview'), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  // Reviews
  async getPendingReviews(level = 'FIRST'): Promise<any[]> {
    const resp = await fetch(buildApiUrl(`/api/admin/reviews/pending?level=${level}`), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : []
  },

  async getReviewDetail(id: number): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/reviews/${id}`), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async submitReview(id: number, body: Record<string, any>): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/reviews/${id}/review`), {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async assignStall(id: number, body: Record<string, any>): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/reviews/${id}/assign`), {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  // Merchants
  async getMerchants(page = 1, keyword = ''): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/merchants?page=${page}&keyword=${encodeURIComponent(keyword)}`), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async getMerchantDetail(merchantId: string): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/merchants/${merchantId}`), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async updateMerchantStatus(merchantId: string, status: string): Promise<any> {
    const resp = await fetch(buildApiUrl(`/api/admin/merchants/${merchantId}/status`), {
      method: 'PUT', headers: headers(), body: JSON.stringify({ status }),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  // Announcements
  async getAnnouncements(): Promise<any[]> {
    const resp = await fetch(buildApiUrl('/api/admin/announcements'), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : []
  },

  async createAnnouncement(body: Record<string, any>): Promise<any> {
    const resp = await fetch(buildApiUrl('/api/admin/announcements'), {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async deleteAnnouncement(id: number): Promise<boolean> {
    const resp = await fetch(buildApiUrl(`/api/admin/announcements/${id}`), {
      method: 'DELETE', headers: headers(),
    })
    const p = await resp.json()
    return p.success
  },

  // Banners
  async getBanners(): Promise<any[]> {
    const resp = await fetch(buildApiUrl('/api/admin/banners'), { headers: headers() })
    const p = await resp.json()
    return p.success ? p.data : []
  },

  async createBanner(body: Record<string, any>): Promise<any> {
    const resp = await fetch(buildApiUrl('/api/admin/banners'), {
      method: 'POST', headers: headers(), body: JSON.stringify(body),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async updateBanner(body: Record<string, any>): Promise<any> {
    const resp = await fetch(buildApiUrl('/api/admin/banners'), {
      method: 'PUT', headers: headers(), body: JSON.stringify(body),
    })
    const p = await resp.json()
    return p.success ? p.data : null
  },

  async toggleBanner(id: number): Promise<boolean> {
    const resp = await fetch(buildApiUrl(`/api/admin/banners/${id}/toggle`), {
      method: 'PUT', headers: headers(),
    })
    const p = await resp.json()
    return p.success
  },

  async deleteBanner(id: number): Promise<boolean> {
    const resp = await fetch(buildApiUrl(`/api/admin/banners/${id}`), {
      method: 'DELETE', headers: headers(),
    })
    const p = await resp.json()
    return p.success
  },
}
