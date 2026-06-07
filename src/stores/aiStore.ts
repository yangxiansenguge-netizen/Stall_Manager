import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { aiApi } from '../api/ai'
import { buildApiUrl } from '../utils/api'
import type { AIAnalysisResponse, SuggestionItem, ActionDraft, HealthFactors, HeroData, AiDailyDecision } from '../types/ai'

export const useAIStore = defineStore('ai', () => {
  const report = ref<AIAnalysisResponse | null>(null)
  const dailyDecision = ref<AiDailyDecision | null>(null)
  const loading = ref(false)
  const noData = ref(false)
  const drawerOpen = ref(false)
  const selectedSchemeIndex = ref(0)
  const draft = ref<ActionDraft | null>(null)
  const toastMessage = ref('')
  const toastVisible = ref(false)
  const confirmOpen = ref(false)
  const confirmTitle = ref('')
  const confirmDesc = ref('')
  let pendingAction = ''

  const chartTopItems = computed(() => {
    const schemes = report.value?.schemes || []
    if (!schemes.length) return []
    // 从 schemes 中提取商品名和指标
    return schemes.slice(0, 5).map((s: any, i) => {
      const name = (s.name || '').replace(/库存仅剩\d+件/, '').replace(/销量下降\d+%/, '').trim().slice(0, 8)
      const percent = Math.max(10, 90 - i * 15)
      return { rank: i + 1, name: name || `分析${i+1}`, value: s.expectedEffect || '+10%', percent }
    })
  })

  const healthScore = computed(() => report.value?.healthScore ?? 0)

  const decisionData = computed(() => dailyDecision.value ?? {
    summary: '', recommendProduct: '', recommendPeriod: '', expectedIncrease: '',
    recommendReason: '', preparationSteps: '', isExistingProduct: false,
  } as AiDailyDecision)

  const healthFactors = computed<HealthFactors>(() => ({
    attraction: report.value?.healthFactors?.attraction ?? 0,
    profit: report.value?.healthFactors?.profit ?? 0,
    repurchase: report.value?.healthFactors?.repurchase ?? 0,
  }))

  const risks = computed<string[]>(() => report.value?.risks ?? [])

  const heroData = computed<HeroData>(() => ({
    todaySummary: dailyDecision.value?.summary ?? report.value?.heroSummary ?? '正在分析经营数据...',
    peakTime: dailyDecision.value?.recommendPeriod ?? '17:00 - 20:00',
    recommendedItem: dailyDecision.value?.recommendProduct ?? report.value?.title ?? '—',
    expectedIncrease: dailyDecision.value?.expectedIncrease ?? report.value?.expectedBenefit ?? '—',
  }))

  function parseEvidence(raw: any): any[] {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    try { return JSON.parse(raw) } catch { return [] }
  }

  const schemeMetrics: Record<string, string> = {
    SALES_DECLINE: '+12%', COMBO_OPPORTUNITY: '+18%', TIME_LOW_CONVERSION: '+10%',
    PRICE_ANOMALY: '+15%', HIGH_COST: '+8%',
  }

  const suggestions = computed<SuggestionItem[]>(() => {
    if (!report.value) return []
    const schemes = report.value.schemes || []
    return schemes.map((s, i) => ({
      id: `${i}`,
      title: s.name || `建议 ${i + 1}`,
      label: s.level || '需关注',
      labelType: mapSchemeLabelType(s.actionType),
      text: s.desc || '',
      rightText: (s as any).expectedEffect || schemeMetrics[s.actionType] || (report.value!.expectedBenefit || '+10%'),
      actionType: s.actionType,
      dataEvidence: parseEvidence((s as any).dataEvidence),
    }))
  })

  const mapSchemeLabelType = (actionType: string): SuggestionItem['labelType'] => {
    switch (actionType) {
      case 'SALES_DECLINE': return 'danger'
      case 'COMBO_OPPORTUNITY': return 'opportunity'
      case 'PRICE_ANOMALY': case 'HIGH_COST': return 'info'
      case 'TIME_LOW_CONVERSION': return 'info'
      default: return 'info'
    }
  }

  const loadingSteps = computed(() => report.value?.analysisSteps ?? [
    '分析近7日经营数据',
    '检查库存健康度与周转速率',
    '验证各时段商品转化率与曝光比值',
    '评估经营环境与定价合理性',
    '生成深度经营决策报告',
  ])

  const fetchReport = async (force = false) => {
    loading.value = true
    try {
      // 没有订单数据时不调用 AI
      try {
        const token = localStorage.getItem('stall_auth_token') || ''
        const resp = await fetch(buildApiUrl('/api/ai/has-data'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const p = await resp.json()
        if (p.success && p.data === false) {
          noData.value = true
          loading.value = false
          return
        }
      } catch { /* 接口不通则继续 */ }

      const [decision, analysis] = await Promise.all([
        aiApi.getDailyDecision(),
        aiApi.getAnalysis(force),
      ])
      dailyDecision.value = decision
      report.value = analysis
      // 检查是否有足够数据
      if (!analysis?.schemes || analysis.schemes.length === 0) {
        noData.value = true
        loading.value = false
        return
      }
      noData.value = false
      // 从 DB 记录中恢复已应用状态
      appliedSchemes.value = new Set()
      analysis?.schemes?.forEach((s: any, i: number) => {
        if (s.isApplied === '1' || s.isApplied === 1 || s.isApplied === true) {
          appliedSchemes.value.add(i)
        }
      })
    } catch (e) {
      report.value = null
      showToast('数据加载失败，请检查后端服务')
    } finally {
      loading.value = false
    }
  }

  const drawerReasons = ref<string[]>([])
  const drawerProblem = ref('')
  const drawerSchemes = ref<any[]>([])

  const openDrawer = (idx: number) => {
    selectedSchemeIndex.value = idx
    const scheme = (report.value?.schemes || [])[idx] as any
    drawerProblem.value = scheme?.detailDesc?.split('\n\n建议：')[0] || scheme?.desc || report.value?.problem || ''
    // 多维度分析：优先用 AI 的 multiAnalysis，fallback 到 reasonsJson
    if (scheme?.analysis) {
      drawerReasons.value = (scheme.analysis as string).split('\n').filter(s => s.trim())
    } else {
      try { drawerReasons.value = JSON.parse(scheme?.reasonsJson || '[]') } catch { drawerReasons.value = [] }
    }
    // 建议展示：detailDesc 中 "建议：" 之后的部分
    const suggestionText = scheme?.detailDesc?.includes('\n\n建议：')
      ? scheme.detailDesc.split('\n\n建议：')[1] || ''
      : (scheme?.desc || '')
    const ds = scheme ? { ...scheme, desc: suggestionText } : scheme
    drawerSchemes.value = ds ? [ds] : (report.value?.schemes || [])
    drawerOpen.value = true
  }

  const closeDrawer = () => { drawerOpen.value = false }

  const prepareApply = async (actionType: string) => {
    try {
      draft.value = await aiApi.prepareAction(actionType)
      return draft.value
    } catch { showToast('准备方案失败'); return null }
  }

  let pendingIndex = 0

  const openConfirm = async (index: number) => {
    pendingIndex = index
    const scheme = (report.value?.schemes || [])[index] as any
    if (!scheme) return
    const labels: Record<string, string> = {
      CREATE_DISCOUNT: 'AI 建议开启折扣促销', CREATE_COMBO: 'AI 建议创建组合套餐',
      CHANGE_PRICE: 'AI 建议调整商品价格', CHANGE_SORT: 'AI 建议优化商品排序', STOCK_ALERT: 'AI 建议立即补货',
    }
    confirmTitle.value = scheme.name || labels[scheme.actionType] || scheme.actionType
    confirmDesc.value = (scheme.actionDetail as string) || (scheme.desc || '')
    if (scheme.expectedEffect) confirmDesc.value += '\n\n预计效果：' + scheme.expectedEffect
    confirmOpen.value = true
  }


  const planOpen = ref(false)

  const openPlan = () => {
    if (!dailyDecision.value) return
    confirmTitle.value = '推荐新品：' + (dailyDecision.value.recommendProduct || '—')
    const reason = dailyDecision.value.recommendReason || ''
    const steps = dailyDecision.value.preparationSteps || ''
    confirmDesc.value = (reason ? '推荐原因：' + reason : '') + (steps ? '\n\n制作方法：\n' + steps : '')
    planOpen.value = true
  }

  const closePlan = () => { planOpen.value = false }

  const closeConfirm = () => { confirmOpen.value = false }

  const appliedSchemes = ref<Set<number>>(new Set())

  const executeConfirm = async () => {
    const idx = pendingIndex
    const scheme = (report.value?.schemes || [])[idx] as any
    confirmOpen.value = false
    if (!scheme) return

    // ① 先标记已应用 → UI 即时变绿
    appliedSchemes.value.add(idx)

    // ② 等 DB 写入 is_applied = 1 后再执行和刷新
    await fetch(buildApiUrl(`/api/ai/mark-applied?schemeIndex=${idx}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('stall_auth_token') || ''}` },
    })

    // ③ 再执行数据库修改
    await executeApply(scheme.actionType, {
      productId: scheme.productId,
      discountPercent: parseInt(scheme.discountPercent || '0'),
      newPrice: parseInt(scheme.newPrice || '0'),
    })
  }

  const executeApply = async (actionType: string, extraParams?: Record<string, any>) => {
    try {
      const result = await aiApi.executeAction(actionType, extraParams)
      showToast(result.detailMessage || '已应用')
      drawerOpen.value = false
      // ③ 静默刷新，并从 DB 恢复 is_applied 状态
      const analysis = await aiApi.getAnalysis(true)
      report.value = analysis
      dailyDecision.value = await aiApi.getDailyDecision()
      // 恢复已应用状态
      analysis?.schemes?.forEach((s: any, i: number) => {
        if (s.isApplied === '1' || s.isApplied === 1 || s.isApplied === true) {
          appliedSchemes.value.add(i)
        }
      })
    } catch { showToast('执行失败，请检查网络') }
  }

  const showToast = (msg: string) => {
    toastMessage.value = msg
    toastVisible.value = true
    setTimeout(() => { toastVisible.value = false }, 3000)
  }

  return {
    report, dailyDecision, loading, noData, drawerOpen, selectedSchemeIndex, draft, toastMessage, toastVisible,
    planOpen, openPlan, closePlan,
    confirmOpen, confirmTitle, confirmDesc, openConfirm, closeConfirm, executeConfirm,
    drawerReasons, drawerProblem, drawerSchemes, appliedSchemes,
    healthScore, healthFactors, risks, heroData, decisionData, suggestions, loadingSteps, chartTopItems,
    fetchReport, openDrawer, closeDrawer, prepareApply, executeApply, showToast,
  }
})
