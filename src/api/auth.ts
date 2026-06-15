import { buildApiUrl } from '../utils/api'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

async function request<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const resp = await fetch(buildApiUrl(path), {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let payload: ApiResponse<T> | null = null
  try { payload = (await resp.json()) as ApiResponse<T> } catch { /* ignore */ }
  if (!resp.ok || !payload?.success || !payload.data) {
    throw new Error(payload?.message || '服务暂不可用')
  }
  return payload.data
}

export const authApi = {
  profile(token: string) {
    return request<{
      token: string; merchantId: string; merchantName: string; phone: string
      onboardingStatus: string; expiresAt: string; roles: string[]
      userType: 'admin' | 'merchant'; role: string
    }>('/api/auth/profile', undefined, token)
  },
  login(phone: string, credential: string, mode: 'code' | 'password') {
    return request<{
      token: string; merchantId: string; merchantName: string; phone: string
      onboardingStatus: string; expiresAt: string; roles: string[]
      userType: 'admin' | 'merchant'; role: string
    }>('/api/auth/login', { phone, loginMode: mode, credential })
  },
  register(phone: string, smsCode: string, password: string, confirmPassword: string) {
    return request<{
      token: string; merchantId: string; merchantName: string; phone: string
      onboardingStatus: string; expiresAt: string; roles: string[]
      userType: 'admin' | 'merchant'; role: string
    }>('/api/auth/register', { phone, smsCode, password, confirmPassword })
  },
}
