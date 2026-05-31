import { defineStore } from 'pinia'
import { ref } from 'vue'
import { buildApiUrl } from '../utils/api'
import { showToast } from '../composables/useToast'

function getLocationKey(): string {
  try {
    const session = JSON.parse(localStorage.getItem('stall_auth_session') || '{}');
    return 'stall_location_' + (session.merchantId || 'default');
  } catch { return 'stall_location_default'; }
}

interface LocationCache {
  displayAddress: string
  fullAddress: string
  latitude: number
  longitude: number
  time: number
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function loadFromPersist(): LocationCache | null {
  try {
    const raw = localStorage.getItem(getLocationKey())
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveToPersist(cache: LocationCache) {
  localStorage.setItem(getLocationKey(), JSON.stringify(cache))
}

export const useLocationStore = defineStore('location', () => {
  const displayAddress = ref('')
  const locatingMe = ref(false)
  const locateFailed = ref(false)
  const lastGeoKey = ref('')  // GPS debounce

  // 初始化时从 localStorage 恢复
  const cached = loadFromPersist()
  if (cached) {
    displayAddress.value = cached.displayAddress
  }

  const locateMe = async () => {
    if (!navigator.geolocation) {
      showToast('error', '定位失败', '浏览器不支持')
      return
    }
    locatingMe.value = true

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      // GPS 去抖：同一网格静默跳过
      const geoKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`
      if (lastGeoKey.value === geoKey) {
        locatingMe.value = false
        return
      }
      lastGeoKey.value = geoKey

      // 第一层：localStorage 缓存（坐标差 < 100m）
      const persisted = loadFromPersist()
      if (persisted && persisted.latitude && persisted.longitude) {
        if (haversine(lat, lng, persisted.latitude, persisted.longitude) < 100) {
          displayAddress.value = persisted.displayAddress
          locateFailed.value = false
          showToast('success', '定位成功（缓存）', `📍 ${persisted.displayAddress}`)
          locatingMe.value = false
          return
        }
      }

      // 第二层：后端缓存
      try {
        const token = localStorage.getItem('stall_auth_token') || ''
        const resp = await fetch(buildApiUrl('/api/location/resolve'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        })
        const p = await resp.json()
        if (p.success && p.data) {
          const d = p.data
          // "定位失败" 是后端兜底值，不应作为成功结果
          if (!d.displayAddress || d.displayAddress === '定位失败') {
            locateFailed.value = true
            showToast('error', '定位失败', '百度地图 API 额度已用完，请更换 AK')
            locatingMe.value = false
            return
          }
          locateFailed.value = false
          const addr = d.displayAddress || d.businessArea || d.district || d.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          displayAddress.value = addr
          saveToPersist({
            displayAddress: addr,
            fullAddress: d.address || '',
            latitude: lat,
            longitude: lng,
            time: Date.now(),
          })
          showToast('success', d.cached ? '定位成功（缓存命中）' : '定位成功', `📍 ${addr}`)
        }
      } catch (err) {
        locateFailed.value = true
        console.error('[定位]', err)
        showToast('error', '定位失败', '网络异常')
      }
      locatingMe.value = false
    }, () => {
      locateFailed.value = true
      showToast('error', '定位失败', '无法获取GPS')
      locatingMe.value = false
    }, { enableHighAccuracy: true, timeout: 10000 })
  }

  return {
    displayAddress,
    locatingMe,
    locateFailed,
    locateMe,
  }
})
