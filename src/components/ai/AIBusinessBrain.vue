<script setup lang="ts">
import { useAIStore } from './aiStore'
import AIHero from './AIHero.vue'
import AISuggestionCard from './AISuggestionCard.vue'
import AIHealthScore from './AIHealthScore.vue'
import AIQuickActions from './AIQuickActions.vue'
import AIAnalysisDrawer from './AIAnalysisDrawer.vue'
import { Sparkles } from 'lucide-vue-next'

// Initializing Pinia Store
const store = useAIStore()

const handleAnalyze = (id: string | number) => {
  store.openAnalysis(id)
}

const handleApplyStrategy = (id: string) => {
  store.applyRecommendation(id)
}

const handleApplyAllHero = () => {
  store.applyRecommendation('sales-decline')
}
</script>

<template>
  <div class="w-full flex flex-col items-center select-none relative">
    
    <!-- Main Container Area - Adjusted to layout upwards and adapt to embed scenarios -->
    <div class="w-full max-w-6xl px-2 pt-2 md:px-4 md:pt-4 flex-1 flex flex-col">
      <div class="w-full bg-white border border-stone-200/60 rounded-3xl p-5 md:p-6 space-y-6 shadow-sm flex flex-col text-left">
        
        <!-- Hero Dynamic Recommendation Block -->
        <AIHero 
          :isMobile="false"
          todaySummary="昨日多雨致熟食滞销，建议今明全力促销炸串，搭配冰茶降低损耗"
          peakTime="18:30 - 21:30 (夜市高峰)"
          recommendedItem="柠檬冰茶 + 炸串第二份半价"
          expectedIncrease="+12%"
          @applyAll="handleApplyAllHero"
        />
        
        <!-- Two-column interactive layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left Column: Core Suggestions Feed (Span 2/3) -->
          <div class="lg:col-span-2 space-y-5">
            <div class="flex justify-between items-center border-b border-stone-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                <h3 class="font-extrabold text-stone-850 text-base">建议诊断决策流 ({{ store.suggestions.length }})</h3>
              </div>
              <span class="text-[11px] font-bold text-orange-600 font-mono">诊断模型：DYN-MARKET-V2</span>
            </div>
            
            <div class="space-y-4">
              <AISuggestionCard 
                v-for="item in store.suggestions"
                :key="item.id"
                :item="item"
                @analyze="handleAnalyze"
                @apply="handleApplyStrategy"
              />
            </div>
          </div>
          
          <!-- Right Column: Business Health Score & Tactical Actions (Span 1/3) -->
          <div class="space-y-6">
            <AIHealthScore 
              :score="store.healthScore"
              :factors="store.factors"
              :risks="store.risks"
            />
            
            <AIQuickActions @action="handleApplyStrategy" />
          </div>
        </div>
      </div>
    </div>

    <!-- Slide-over analysis Drawer popup (Retained completely as requested) -->
    <AIAnalysisDrawer 
      :isOpen="store.drawerOpen"
      :title="store.selectedTitle"
      @close="store.closeAnalysis"
      @applyStrategy="handleApplyStrategy"
    />

    <!-- Toast Notification (Styled with orange brand) -->
    <Transition name="fade-toast">
      <div 
        v-if="store.toastVisible" 
        class="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-md text-white font-black text-xs md:text-sm px-6 py-3.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 max-w-md text-center animate-fade-in"
      >
        <Sparkles class="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
        <span>{{ store.toastMessage }}</span>
      </div>
    </Transition>
    
  </div>
</template>

<style scoped>
/* Toast transitions */
.fade-toast-enter-active,
.fade-toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-toast-enter-from,
.fade-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
