<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAIStore } from '../../stores/aiStore'
import AIHero from '../../components/ai/AIHero.vue'
import AISuggestionCard from '../../components/ai/AISuggestionCard.vue'
import AIQuickActions from '../../components/ai/AIQuickActions.vue'
import AIHealthScore from '../../components/ai/AIHealthScore.vue'
import AIAnalysisDrawer from '../../components/ai/AIAnalysisDrawer.vue'
import AIThinkingAnimation from '../../components/ai/AIThinkingAnimation.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const store = useAIStore()

const report = computed(() => store.report)

const handleQuickAction = (type: string) => {
  // 快捷操作仅展示，不弹窗
}

onMounted(() => {
  store.fetchReport(true)
})
</script>

<template>
  <div class="min-h-screen bg-stone-50/60 pb-24 font-sans">
    <button @click="router.push('/business')" class="absolute top-4 left-4 z-40 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition">
      <ArrowLeft class="w-4 h-4" />
    </button>

    <main class="max-w-5xl mx-auto px-4 py-5 space-y-5">
      <template v-if="store.loading">
        <AIThinkingAnimation />
      </template>

      <template v-else-if="report">
        <AIHero
          :today-summary="store.heroData.todaySummary"
          :peak-time="store.heroData.peakTime"
          :recommended-item="store.heroData.recommendedItem"
          :expected-increase="store.heroData.expectedIncrease"
          @view-plan="store.openPlan"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div class="lg:col-span-2 space-y-3">
            <AISuggestionCard
              v-for="(s, i) in store.suggestions"
              :key="i"
              :item="s"
              :applied="store.appliedSchemes.has(i)"
              @analyze="(id: any) => store.openDrawer(i)"
              @apply="(id: any) => store.openConfirm(i)"
            />
          </div>
          <div class="space-y-5">
            <AIHealthScore
              :score="store.healthScore"
              :factors="store.healthFactors"
              :risks="store.risks"
            />
          </div>
        </div>

        <AIQuickActions @action="handleQuickAction" />
      </template>

      <div v-else-if="store.noData" class="flex flex-col items-center justify-center py-20 text-center">
        <span class="text-5xl mb-4">📋</span>
        <p class="text-sm font-bold text-stone-400">暂无足够经营数据</p>
        <p class="text-xs text-stone-400 mt-1">请先申请摊位并添加商品，有订单数据后再来查看 AI 分析</p>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-20 text-center">
        <span class="text-5xl mb-4">📊</span>
        <p class="text-sm font-bold text-stone-400">暂无法获取分析数据</p>
        <button @click="store.fetchReport(true)" class="mt-4 text-xs font-bold text-orange-500 hover:text-orange-600 transition">重新加载</button>
      </div>
    </main>

    <AIAnalysisDrawer
      :is-open="store.drawerOpen"
      :title="(report?.schemes || [])[store.selectedSchemeIndex]?.name || report?.title || ''"
      :problem="store.drawerProblem"
      :reasons="store.drawerReasons"
      :schemes="store.drawerSchemes"
      @close="store.closeDrawer"
      @apply-strategy="(type: string) => { const idx = (report?.schemes || []).findIndex((s: any) => s.actionType === type); store.openConfirm(idx >= 0 ? idx : 0) }"
    />

    <!-- 推荐方案弹窗 -->
    <Transition name="toast">
      <div v-if="store.planOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/30 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-5 mx-4 max-w-sm w-full shadow-2xl border border-stone-100 max-h-[80vh] overflow-y-auto">
          <p class="text-sm font-black text-stone-800 mb-3">{{ store.confirmTitle }}</p>
          <p class="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{{ store.confirmDesc }}</p>
          <button @click="store.closePlan" class="mt-4 w-full bg-stone-100 hover:bg-stone-200 rounded-xl py-2.5 text-xs font-bold text-stone-600">知道了</button>
        </div>
      </div>
    </Transition>

    <!-- 确认弹窗 -->
    <Transition name="toast">
      <div v-if="store.confirmOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/30 backdrop-blur-sm">
        <div class="bg-white rounded-2xl p-5 mx-4 max-w-sm w-full shadow-2xl border border-stone-100">
          <p class="text-sm font-black text-stone-800 mb-2">{{ store.confirmTitle }}</p>
          <p class="text-xs text-stone-500 mb-4 whitespace-pre-line">{{ store.confirmDesc }}</p>
          <div class="flex gap-2">
            <button @click="store.closeConfirm" class="flex-1 border border-stone-200 rounded-xl py-2 text-xs font-bold text-stone-500 hover:bg-stone-50">再想想</button>
            <button @click="store.executeConfirm" class="flex-1 bg-orange-500 hover:bg-orange-600 rounded-xl py-2 text-xs font-bold text-white">确认应用</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="store.toastVisible" class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-xl">
        {{ store.toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px); }
</style>
