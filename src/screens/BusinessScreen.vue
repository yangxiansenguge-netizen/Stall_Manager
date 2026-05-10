<script setup lang="ts">
import { ref, watch } from 'vue';
import BusinessMain from './BusinessMain.vue';
import ProductManagement from '../components/ProductManagement.vue';
import ManualOrderPanel from '../components/ManualOrderPanel.vue';

const props = defineProps<{
  initialView?: 'main' | 'products' | 'manualOrder';
}>();

const emit = defineEmits(['view-change', 'navigate-stall']);

const activeView = ref<'main' | 'products' | 'manualOrder'>(props.initialView || 'main');

watch(() => props.initialView, (newView) => {
  if (newView) {
    activeView.value = newView;
  }
});

const handleSetView = (view: 'main' | 'products' | 'manualOrder') => {
  activeView.value = view;
  emit('view-change', view);
};
</script>

<template>
  <div class="relative min-h-screen pt-4 pb-32">
    <Transition name="fade-slide" mode="out-in">
      <component
        :is="activeView === 'products' ? ProductManagement : (activeView === 'manualOrder' ? ManualOrderPanel : BusinessMain)"
        v-bind="activeView !== 'main' ? { onBack: () => handleSetView('main') } : {}"
        @view-change="handleSetView"
        @navigate-stall="emit('navigate-stall')"
      />
    </Transition>
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
