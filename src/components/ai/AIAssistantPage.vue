<script setup lang="ts">
import { onMounted } from 'vue'
import { useAIStore } from './aiStore'
import AIHero from './AIHero.vue'
import AISuggestionCard from './AISuggestionCard.vue'
import AIQuickActions from './AIQuickActions.vue'
import AIHealthScore from './AIHealthScore.vue'
import AIAnalysisDrawer from './AIAnalysisDrawer.vue'
import { Sparkles, HelpCircle } from 'lucide-vue-next'

const store = useAIStore()

// 一键应用所有
const handleApplyAll = () => {
  store.applyRecommendation('CREATE_DISCOUNT')
}

// 触发特定卡片的一键应用
const handleApplyItem = (id: string | number) => {
  store.applyRecommendation(id === 'combo-opportunity' ? 'CREATE_COMBO' : 'CREATE_DISCOUNT')
}

// 触发卡片 AI 分析
const handleAnalyzeItem = (id: string | number) => {
  store.openAnalysis(id)
}
</script>

<template>
  <div class="min-h-screen bg-stone-50/60 pb-16 font-sans w-full">
    <!-- 1. 置顶小巧导航 -->
    <header class="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-100 px-5 py-4 w-full">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shrink-0">
            A
          </div>
          <div class="text-left">
            <h1 class="font-extrabold text-stone-800 text-base sm:text-lg leading-none">AI分析助手</h1>
          </div>
        </div>
        
        <button class="text-stone-400 hover:text-stone-700 p-1.5 transition shrink-0">
          <HelpCircle class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 主展示层 -->
    <main class="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      <!-- 2. AI Hero 今日经营建议区 -->
      <AIHero 
        :isMobile="false"
        todaySummary="昨晚炸串受降雨折损，建议今明推广特惠组合，将滞后量降至最低"
        peakTime="18:30 - 21:00 (晚餐档)"
        recommendedItem="柠檬冰茶 + 炸串双拼"
        expectedIncrease="+12%"
        @applyAll="handleApplyAll"
      />
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 3. 左侧经营分析卡片流 (占 2 宽) -->
        <div class="lg:col-span-2 space-y-5">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2">
            <div class="space-y-0.5 text-left">
              <h3 class="font-black text-stone-800 text-base">今日经营建议 ({{ store.suggestions.length }})</h3>
              <p class="text-xs text-stone-400">结合传感器、订单、天气等多因子深度识别</p>
            </div>
            <span class="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
              实时生成
            </span>
          </div>
          
          <div class="space-y-4">
            <AISuggestionCard 
              v-for="item in store.suggestions"
              :key="item.id"
              :item="item"
              @analyze="handleAnalyzeItem"
              @apply="handleApplyItem"
            />
          </div>
        </div>
        
        <!-- 4. 右侧经营健康和快捷指令 (占 1 宽) -->
        <div class="space-y-6">
          <AIHealthScore 
            :score="store.healthScore"
            :factors="store.factors"
            :risks="store.risks"
          />
        </div>
      </div>
      
      <!-- 5. 快捷功能面板 -->
      <div class="pt-2">
        <AIQuickActions @action="store.applyRecommendation" />
      </div>
    </main>

    <!-- 6. AI 经营剖析侧滑抽屉 -->
    <AIAnalysisDrawer 
      :isOpen="store.drawerOpen"
      :title="store.selectedTitle"
      @close="store.closeAnalysis"
      @applyStrategy="store.applyRecommendation"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
