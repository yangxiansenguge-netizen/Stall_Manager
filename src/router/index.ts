import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/',
      component: () => import('../layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
        { path: 'stall', name: 'stall', component: () => import('../views/StallView.vue') },
        { path: 'business', name: 'business', component: () => import('../views/BusinessView.vue') },
        { path: 'ai', name: 'ai', component: () => import('../pages/ai/AIAssistantPage.vue') },
        { path: 'settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
        { path: 'messages', name: 'messages', component: () => import('../views/MessagesView.vue') },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 动态 import 避免循环依赖
  const { useAuthStore } = await import('../stores/auth')
  const auth = useAuthStore()

  if (to.path === '/login') {
    if (auth.isLoggedIn) return next('/dashboard')
    return next()
  }

  if (!auth.isLoggedIn) {
    await auth.checkAuth()
    if (!auth.isLoggedIn) return next('/login')
  }
  next()
})

export default router
