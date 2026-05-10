<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import Header from './components/Header.vue';
import BottomNav from './components/BottomNav.vue';
import ToastNotification from './components/ToastNotification.vue';
import AuthScreen from './screens/AuthScreen.vue';
import DashboardScreen from './screens/DashboardScreen.vue';
import StallScreen from './screens/StallScreen.vue';
import BusinessScreen from './screens/BusinessScreen.vue';
import SettingsScreen from './screens/SettingsScreen.vue';
import MessageScreen from './screens/MessageScreen.vue';
import { buildApiUrl } from './utils/api';
import { Tab } from './types';


interface AuthSession {
  token: string;
  merchantId: string;
  merchantName: string;
  phone: string;
  onboardingStatus: string;
  expiresAt: string;
  roles: string[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const AUTH_TOKEN_KEY = 'stall_auth_token';
const AUTH_SESSION_KEY = 'stall_auth_session';


const isLoggedIn = ref(false);
const isAuthLoading = ref(true);
const activeTab = ref<Tab>('home');
const businessSubView = ref<'main' | 'products' | 'manualOrder'>('main');
const authSession = ref<AuthSession | null>(null);

const merchantName = computed(() => authSession.value?.merchantName ?? '');


const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_SESSION_KEY);
  isLoggedIn.value = false;
  authSession.value = null;
  activeTab.value = 'home';
  businessSubView.value = 'main';
};

const requestProfile = async (token: string): Promise<AuthSession> => {
  const response = await fetch(buildApiUrl('/api/auth/profile'), {

    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as ApiResponse<AuthSession>;
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || '登录状态已失效');
  }
  return payload.data;
};

const handleLogin = (session: AuthSession) => {
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  authSession.value = session;
  isLoggedIn.value = true;
  activeTab.value = 'home';
};

const handleLogout = () => {
  clearAuth();
};

onMounted(async () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    isAuthLoading.value = false;
    return;
  }

  try {
    const session = await requestProfile(token);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    authSession.value = session;
    isLoggedIn.value = true;
  } catch {
    clearAuth();
  } finally {
    isAuthLoading.value = false;
  }
});

const onTabChange = (tab: Tab) => {
  if (tab === 'business' && activeTab.value === 'business') {
    businessSubView.value = 'main';
  }
  activeTab.value = tab;
};

const navigateToBusiness = (subView: 'main' | 'products' | 'manualOrder' = 'main') => {
  activeTab.value = 'business';
  businessSubView.value = subView;
};

const navigateToStall = () => {
  activeTab.value = 'stall';
};
</script>

<template>
  <div v-if="isAuthLoading" class="flex min-h-screen items-center justify-center bg-[#FDFBF7] text-stone-500">
    正在校验登录状态...
  </div>

  <div v-else-if="!isLoggedIn" class="min-h-screen bg-[#FDFBF7]">
    <Transition name="fade" mode="out-in">
      <AuthScreen @login="handleLogin" />
    </Transition>
    <ToastNotification />
  </div>

  <div v-else class="min-h-screen bg-[#F8F7F5] pb-[calc(6.5rem+env(safe-area-inset-bottom))] flex flex-col items-center">
    <Header :merchant-name="merchantName" @open-messages="activeTab = 'messages'" />

    <main class="w-full max-w-screen-xl mx-auto flex-1 px-3 sm:px-4 md:px-6 pt-[calc(5rem+env(safe-area-inset-top))] sm:pt-[calc(6rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))] sm:pb-12">
      <Transition name="page-fade" mode="out-in">
        <div :key="activeTab" class="w-full">
          <DashboardScreen
            v-if="activeTab === 'home'"
            :merchant-name="merchantName"
            @navigate-to-management="navigateToBusiness('main')"
            @navigate-to-stall-management="navigateToStall"
            @navigate-to-plan="navigateToBusiness('manualOrder')"
            @navigate-to-add-product="navigateToBusiness('products')"
          />
          <StallScreen v-else-if="activeTab === 'stall'" />
          <BusinessScreen
            v-else-if="activeTab === 'business'"
            :initial-view="businessSubView"
            @view-change="val => businessSubView = val"
            @navigate-stall="navigateToStall"
          />
          <SettingsScreen v-else-if="activeTab === 'settings'" :on-logout="handleLogout" />
          <MessageScreen v-else-if="activeTab === 'messages'" />
        </div>
      </Transition>
    </main>

    <BottomNav
      :active-tab="activeTab"
      @tab-change="onTabChange"
    />
    <ToastNotification />
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
