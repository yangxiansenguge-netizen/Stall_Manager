import { buildApiUrl } from '../utils/api'
import type { AIAnalysisResponse, ActionDraft, AIExecuteResponse, AiDailyDecision } from '../types/ai'

const headers = () => {
  const token = localStorage.getItem('stall_auth_token') || ''
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export const aiApi = {
  async getDailyDecision(): Promise<AiDailyDecision> {
    const resp = await fetch(buildApiUrl('/api/ai/daily-decision'), { headers: headers() })
    const p = await resp.json()
    if (!p.success) throw new Error(p.message || '获取决策失败')
    return p.data
  },

  async getAnalysis(forceRefresh = false, stockThreshold = 20): Promise<AIAnalysisResponse> {
    const resp = await fetch(buildApiUrl(`/api/ai/analysis?forceRefresh=${forceRefresh}&stockThreshold=${stockThreshold}`), { headers: headers() })
    const p = await resp.json()
    if (!p.success) throw new Error(p.message || '获取分析失败')
    return p.data
  },

  async prepareAction(actionType: string, parameters?: Record<string, any>): Promise<ActionDraft> {
    const resp = await fetch(buildApiUrl('/api/ai/prepare-action'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ actionType, parameters: parameters || {} }),
    })
    const p = await resp.json()
    if (!p.success) throw new Error(p.message || '准备方案失败')
    return p.data
  },

  async executeAction(actionType: string, parameters?: Record<string, any>): Promise<AIExecuteResponse> {
    const resp = await fetch(buildApiUrl('/api/ai/execute-action'), {
      method: 'POST', headers: headers(),
      body: JSON.stringify({ actionType, parameters: parameters || {} }),
    })
    const p = await resp.json()
    if (!p.success) throw new Error(p.message || '执行失败')
    return p.data
  },
}
