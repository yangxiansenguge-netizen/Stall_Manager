<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  PieChart,
  LayoutGrid
} from 'lucide-vue-next';
import BusinessMain from './BusinessMain.vue';
import ProductManagement from '../components/ProductManagement.vue';
import ManualOrderPanel from '../components/ManualOrderPanel.vue';
import AdvancedDashboard from '../components/AdvancedDashboard.vue';

const props = defineProps<{
  initialView?: 'main' | 'products' | 'manualOrder' | 'advanced';
}>();

const emit = defineEmits(['view-change']);

const activeView = ref<'main' | 'products' | 'manualOrder' | 'advanced'>(props.initialView || 'main');

watch(() => props.initialView, (newView) => {
  if (newView) {
    activeView.value = newView;
  }
});

const handleSetView = (view: 'main' | 'products' | 'manualOrder' | 'advanced') => {
  activeView.value = view;
  emit('view-change', view);
};
</script>

<template>
  <div class="relative min-h-screen pt-4 pb-32">
    <!-- 子视图切换 -->
    <Transition
      name="fade-slide"
      mode="out-in"
    >
      <component 
        :is="activeView === 'products' ? ProductManagement : (activeView === 'manualOrder' ? ManualOrderPanel : (activeView === 'advanced' ? AdvancedDashboard : BusinessMain))"
        v-bind="activeView !== 'main' ? { onBack: () => handleSetView('main') } : {}"
        @view-change="handleSetView"
      />
    </Transition>

    <!-- 底部切换浮窗 - 仅在主视图显示 -->
    <div v-if="activeView === 'main'" class="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[22rem] -translate-x-1/2 sm:bottom-28 sm:max-w-fit">
      <div class="flex items-center justify-between gap-1.5 rounded-[1.6rem] border border-white/60 bg-white/92 p-1.5 shadow-[0_18px_45px_rgba(28,25,23,0.12)] backdrop-blur-xl sm:gap-2 sm:rounded-[2rem] sm:p-2">
        <button
          @click="handleSetView('advanced')"
          class="group flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[1.2rem] px-3 py-2.5 transition-all duration-200 hover:bg-stone-50 active:scale-[0.98] sm:flex-none sm:gap-2 sm:px-5 sm:py-3"
        >
          <PieChart class="h-4 w-4 shrink-0 text-stone-400 transition-colors group-hover:text-amber-500 sm:h-5 sm:w-5" />
          <span class="whitespace-nowrap text-[12px] font-bold tracking-[0.02em] text-stone-500 transition-colors group-hover:text-amber-600 sm:text-sm">进阶看板</span>
        </button>

        <div class="h-7 w-px shrink-0 bg-stone-200 sm:h-8"></div>

        <button
          @click="handleSetView('products')"
          class="group flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[1.2rem] px-3 py-2.5 transition-all duration-200 hover:bg-stone-50 active:scale-[0.98] sm:flex-none sm:gap-2 sm:px-5 sm:py-3"
        >
          <LayoutGrid class="h-4 w-4 shrink-0 text-stone-400 transition-colors group-hover:text-indigo-500 sm:h-5 sm:w-5" />
          <span class="whitespace-nowrap text-[12px] font-bold tracking-[0.02em] text-stone-500 transition-colors group-hover:text-indigo-600 sm:text-sm">商品管理</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
