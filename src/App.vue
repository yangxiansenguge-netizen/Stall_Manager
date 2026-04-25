<script setup lang="ts">
import { ref } from 'vue';
import Header from './components/Header.vue';
import BottomNav from './components/BottomNav.vue';
import AuthScreen from './screens/AuthScreen.vue';
import DashboardScreen from './screens/DashboardScreen.vue';
import StallScreen from './screens/StallScreen.vue';
import BusinessScreen from './screens/BusinessScreen.vue';
import SettingsScreen from './screens/SettingsScreen.vue';
import MessageScreen from './screens/MessageScreen.vue';
import { Tab } from './types';

const isLoggedIn = ref(false);
const activeTab = ref<Tab>('home');
const businessSubView = ref<'main' | 'products' | 'advanced'>('main');

const onTabChange = (tab: Tab) => {
  if (tab === 'business' && activeTab.value === 'business') {
    businessSubView.value = 'main';
  }
  activeTab.value = tab;
};

const navigateToBusiness = (subView: 'main' | 'products' | 'advanced' = 'main') => {
  activeTab.value = 'business';
  businessSubView.value = subView;
};

const navigateToStall = () => {
  activeTab.value = 'stall';
};
</script>

<template>
  <div v-if="!isLoggedIn" class="min-h-screen bg-[#FDFBF7]">
    <Transition name="fade" mode="out-in">
      <AuthScreen @login="isLoggedIn = true" />
    </Transition>
  </div>

  <div v-else class="min-h-screen bg-[#F8F7F5] pb-[calc(6.5rem+env(safe-area-inset-bottom))] flex flex-col items-center">
    <Header @open-messages="activeTab = 'messages'" />
    
    <main class="w-full max-w-screen-xl mx-auto flex-1 px-3 sm:px-4 md:px-6 pt-[calc(5rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-12">
      <Transition name="page-fade" mode="out-in">
        <div :key="activeTab" class="w-full">
          <DashboardScreen 
            v-if="activeTab === 'home'"
            @navigate-to-management="navigateToBusiness('main')"
            @navigate-to-stall-management="navigateToStall"
            @navigate-to-plan="navigateToStall"
            @navigate-to-add-product="navigateToBusiness('products')"
          />
          <StallScreen v-else-if="activeTab === 'stall'" />
          <BusinessScreen 
            v-else-if="activeTab === 'business'"
            :initial-view="businessSubView"
            @view-change="val => businessSubView = val"
          />
          <SettingsScreen v-else-if="activeTab === 'settings'" @logout="isLoggedIn = false" />
          <MessageScreen v-else-if="activeTab === 'messages'" />
        </div>
      </Transition>
    </main>

    <BottomNav 
      :active-tab="activeTab" 
      @tab-change="onTabChange" 
    />
  </div>
</template>

<style>
@import "tailwindcss";

:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: #F8F7F5;
  color: #1c1917;
  overflow-x: hidden;
}

#app {
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.writing-vertical-lr {
  writing-mode: vertical-lr;
}
</style>
