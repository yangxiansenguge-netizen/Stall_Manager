<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Check, Sparkles } from 'lucide-vue-next'

// 阶段模拟
const steps = ref([
  { text: '正在调取前置规则引擎指标...', completed: false, active: true },
  { text: '正在关联历史订单分布...', completed: false, active: false },
  { text: '正在验证本时段商品转化率与曝光比值...', completed: false, active: false },
  { text: '正在评估竞争环境定价模型...', completed: false, active: false },
  { text: '深度经营报告生成完毕！', completed: false, active: false }
])

// 动态副标题，根据当前进行的步骤变化
const currentStepText = ref('正在推演夜市经营策略...')

const emit = defineEmits<{
  (e: 'done'): void
}>()

const timers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  timers.push(setTimeout(() => {
    steps.value[0].completed = true
    steps.value[1].active = true
    currentStepText.value = '整合降雨干扰与周边客流流失率...'
  }, 600))

  timers.push(setTimeout(() => {
    steps.value[1].completed = true
    steps.value[2].active = true
    currentStepText.value = '匹配历史同周期周转曲线...'
  }, 1200))

  timers.push(setTimeout(() => {
    steps.value[2].completed = true
    steps.value[3].active = true
    currentStepText.value = '精算竞品降价引流稀释效应...'
  }, 1800))

  timers.push(setTimeout(() => {
    steps.value[3].completed = true
    steps.value[4].active = true
    currentStepText.value = '全盘定价及曝光权重避险预案生成中...'
  }, 2400))

  timers.push(setTimeout(() => {
    steps.value[4].completed = true
    emit('done')
  }, 3000))
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
})
</script>

<template>
  <div class="ai-loading py-8 px-6 select-none">

    <!-- 纸张堆叠动画区 -->
    <div class="paper-stack">
      <!-- 底层纸 2 -->
      <div class="paper back2"></div>
      <!-- 中层纸 1 -->
      <div class="paper back1"></div>

      <!-- 主层纸 (带扫描光与骨架内容) -->
      <div class="paper main">
        <!-- 扫描光 -->
        <div class="scan-light"></div>

        <!-- 经典账单/报告纸页占位纹路 -->
        <div class="line short"></div>
        <div class="line"></div>
        <div class="line"></div>

        <div class="kpi-row">
          <div class="kpi"></div>
          <div class="kpi"></div>
        </div>
      </div>
    </div>

    <!-- 顶端状态文案 -->
    <div class="loading-text mt-4">
      <div class="title flex items-center justify-center gap-1.5 text-stone-700">
        <Sparkles class="w-4 h-4 text-orange-500 animate-pulse" />
        <span>AI 经营沙盘推演中</span>
      </div>

      <div class="subtitle text-[#8a7968] font-medium h-4 mt-2 text-xs transition-all duration-300">
        {{ currentStepText }}
      </div>

      <!-- 三个优雅弹跳点 -->
      <div class="dots mt-3">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- 底部具体计算步骤链（比纯 loading 更有信服力与价值感） -->
    <div class="w-full max-w-sm bg-[#FAF8F5] border border-stone-200/45 rounded-2xl p-4.5 text-left space-y-3 shadow-sm mt-6">
      <div class="text-[10px] font-black text-[#A69276] uppercase tracking-wider mb-2 flex items-center gap-1 border-b border-stone-200/30 pb-2">
        <span>◇ 决策脑多层算网计算链</span>
      </div>

      <div 
        v-for="(step, idx) in steps" 
        :key="idx"
        class="flex items-center gap-3 transition-all duration-300"
        :style="{ opacity: step.active || step.completed ? '1' : '0.35' }"
      >
        <span class="flex-shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center transition-all duration-300">
          <span v-if="step.completed" class="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
            <Check class="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
          </span>
          <span v-else-if="step.active" class="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
          </span>
          <span v-else class="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
        </span>
        <span 
          class="text-[11.5px] transition-colors"
          :class="{ 
            'text-stone-800 font-bold': step.active, 
            'text-stone-400 font-medium': !step.active && !step.completed, 
            'text-emerald-700 font-extrabold': step.completed && idx === steps.length - 1,
            'text-[#9c8973]': step.completed && idx < steps.length - 1
          }"
        >
          {{ step.text }}
        </span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ai-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 纸张 */
.paper-stack {
  position: relative;
  width: 170px;
  height: 130px;
  margin-top: 10px;
}

.paper {
  position: absolute;
  border-radius: 20px;
}

/* 底层 */
.back2 {
  inset: 14px -8px -8px 8px;
  background: #e9ddcf;
  transform: rotate(-4deg);
  animation: float2 3.5s ease-in-out infinite;
  box-shadow: 0 15px 30px rgba(0, 0, 0, .04);
}

.back1 {
  inset: 8px -3px -6px 4px;
  background: #f5ede4;
  transform: rotate(2deg);
  animation: float1 3s ease-in-out infinite;
  box-shadow: 0 10px 20px rgba(0, 0, 0, .03);
}

/* 主纸 */
.main {
  inset: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #fffdfb, #faf4ec);
  box-shadow:
    0 18px 45px rgba(85, 65, 45, .15),
    0 6px 14px rgba(0, 0, 0, .04);
  animation: floatMain 2.8s ease-in-out infinite;
  border: 1px solid #ebdcc5;
}

/* 纸纹 */
.main::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: .18;
  background: radial-gradient(rgba(0, 0, 0, .03) 1px, transparent 1px);
  background-size: 4px 4px;
}

/* 扫描光 */
.scan-light {
  position: absolute;
  inset: -30%;
  background: linear-gradient(
    115deg,
    transparent 35%,
    rgba(255, 235, 210, 0.45) 45%,
    rgba(255, 255, 255, .72) 50%,
    rgba(255, 235, 210, 0.45) 55%,
    transparent 65%
  );
  animation: scan 2.4s linear infinite;
}

/* 内容骨架 */
.line {
  height: 8px;
  margin: 16px 18px;
  margin-bottom: 9px;
  border-radius: 999px;
  background: #ebe5dc;
}

.short {
  width: 40%;
}

.kpi-row {
  display: flex;
  gap: 8px;
  margin: 14px 18px;
}

.kpi {
  flex: 1;
  height: 32px;
  border-radius: 12px;
  background: #f2ece3;
}

/* 文字 */
.loading-text {
  text-align: center;
}

.title {
  font-size: 16px;
  font-weight: 800;
  color: #3e3830;
  animation: breathe 2s ease-in-out infinite;
}

.subtitle {
  color: #8c7f72;
}

/* 点 */
.dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.dots span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff8c54;
  animation: dot 1.2s infinite;
}

.dots span:nth-child(2) {
  animation-delay: .2s;
}

.dots span:nth-child(3) {
  animation-delay: .4s;
}

/* 动画 */
@keyframes scan {
  from {
    transform: translateX(-140%) rotate(8deg);
  }
  to {
    transform: translateX(140%) rotate(8deg);
  }
}

@keyframes floatMain {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes float1 {
  0%, 100% {
    transform: rotate(2deg) translateY(0);
  }
  50% {
    transform: rotate(2deg) translateY(-4px);
  }
}

@keyframes float2 {
  0%, 100% {
    transform: rotate(-4deg) translateY(0);
  }
  50% {
    transform: rotate(-4deg) translateY(-3px);
  }
}

@keyframes breathe {
  0%, 100% {
    opacity: .75;
  }
  50% {
    opacity: 1;
  }
}

@keyframes dot {
  0%, 100% {
    transform: scale(.75);
    opacity: .4;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>
