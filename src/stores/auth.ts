import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

interface AuthSession {
  token: string
  merchantId: string
  merchantName: string
  phone: string
  onboardingStatus: string
  expiresAt: string
  roles: string[]
  userType: 'admin' | 'merchant'
  role: string
}

const AUTH_TOKEN = 'stall_auth_token'
const AUTH_SESSION = 'stall_auth_session'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(AUTH_TOKEN) || '')
  const session = ref<AuthSession | null>(null)
  const isAuthLoading = ref(true)
  const isLoggedIn = ref(false)
  const kickedMsg = ref('')

  const merchantName = computed(() => session.value?.merchantName ?? '')

  const persistSession = (s: AuthSession) => {
    localStorage.setItem(AUTH_TOKEN, s.token)
    localStorage.setItem(AUTH_SESSION, JSON.stringify(s))
    token.value = s.token
    session.value = s
    isLoggedIn.value = true
  }

  const checkAuth = async () => {
    const t = localStorage.getItem(AUTH_TOKEN)
    if (!t) { isAuthLoading.value = false; return }
    // 防止并发刷新触发多次鉴权
    if (isAuthLoading.value && session.value) { return }
    try {
      const s = await authApi.profile(t)
      persistSession(s)
    } catch (e: any) {
      // 被踢了先弹窗，不直接清退
      if (e?.message?.includes('其他设备')) {
        kickedMsg.value = e.message
        return
      }
      if (e?.message?.includes('401') || e?.message?.includes('鉴权') || e?.message?.includes('失效')) {
        logout()
      }
    } finally {
      isAuthLoading.value = false
    }
  }

  const login = async (phone: string, credential: string, mode: 'code' | 'password') => {
    const s = await authApi.login(phone, credential, mode)
    persistSession(s)
    return s
  }

  const register = async (phone: string, smsCode: string, password: string, confirmPassword: string) => {
    const s = await authApi.register(phone, smsCode, password, confirmPassword)
    persistSession(s)
    return s
  }

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN)
    localStorage.removeItem(AUTH_SESSION)
    token.value = ''
    session.value = null
    isLoggedIn.value = false
    kickedMsg.value = ''
  }

  const clearKicked = () => {
    kickedMsg.value = ''
    logout()
  }

  return { token, session, isAuthLoading, isLoggedIn, merchantName, kickedMsg, checkAuth, login, register, logout, clearKicked }
})
