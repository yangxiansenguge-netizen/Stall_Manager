import { ref } from 'vue'
import { buildApiUrl } from '../utils/api'

// 全局共享的未读计数，解决 Header 和 MessageScreen 各自 fetch 不同步的问题
const unreadCount = ref(0)

export function useMessageStore() {
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('stall_auth_token') || ''
      const resp = await fetch(buildApiUrl('/api/messages/center'), {
        headers: { Authorization: `Bearer ${token}` },
      })
      const p = await resp.json()
      if (p.success && p.data?.categories) {
        let count = 0
        for (const cat of p.data.categories) {
          for (const m of (cat.messages || [])) {
            if (!m.read) count++
          }
        }
        unreadCount.value = count
      }
    } catch { }
  }

  const markOneRead = () => {
    if (unreadCount.value > 0) unreadCount.value--
  }

  return { unreadCount, fetchUnreadCount, markOneRead }
}
