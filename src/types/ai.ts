export interface AiDailyDecision {
  summary: string
  recommendProduct: string
  recommendReason: string
  preparationSteps: string
  isExistingProduct: boolean
  recommendPeriod: string
  expectedIncrease: string
}

export interface AIAnalysisResponse {
  stallId: number | null
  analysisTime: string
  alertCategory: string
  triggerReason: string
  title: string
  level: string
  problem: string
  expectedBenefit: string
  reasons: string[]
  schemes: Scheme[]
  analysisSteps: string[]
  healthScore: number
  healthFactors?: HealthFactors
  risks?: string[]
  heroSummary?: string
}

export interface HealthFactors {
  attraction: number
  profit: number
  repurchase: number
}

export interface HeroData {
  todaySummary: string
  peakTime: string
  recommendedItem: string
  expectedIncrease: string
}

export interface Scheme {
  name: string
  desc: string
  actionType: string
  level?: string
  dataEvidence?: EvidenceItem[]
  expectedEffect?: string
  detailDesc?: string
  actionDetail?: string
  analysis?: string
}

export interface EvidenceItem {
  label: string
  value: string
}

export interface SuggestionItem {
  id: string
  title: string
  label: string
  labelType: 'danger' | 'opportunity' | 'risk' | 'info'
  text: string
  rightText: string
  actionType: string
  dataEvidence?: EvidenceItem[]
}

export interface ActionDraft {
  actionType: string
  title: string
  description: string
  parameters: Record<string, any>
  expectedEffect: string
}

export interface AIExecuteResponse {
  stallId: number | null
  actionType: string
  success: boolean
  executedTime: string
  detailMessage: string
}
