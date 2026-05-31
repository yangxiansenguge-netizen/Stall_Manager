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
    // === 管理端路由 ===
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboard.vue') },
        { path: 'review', name: 'admin-review', component: () => import('../views/admin/StallReview.vue') },
        { path: 'merchants', name: 'admin-merchants', component: () => import('../views/admin/MerchantList.vue') },
        { path: 'messages', name: 'admin-messages', component: () => import('../views/admin/MessagePush.vue') },
        { path: 'banner', name: 'admin-banner', component: () => import('../views/admin/BannerManage.vue') },
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
    if (auth.isLoggedIn) {
      if (auth.session?.userType === 'admin') return next('/admin')
      return next('/dashboard')
    }
    return next()
  }

  if (!auth.isLoggedIn) {
    await auth.checkAuth()
    if (!auth.isLoggedIn) return next('/login')
  }
  // Admin 路由守卫
  if (to.meta.requiresAdmin) {
    if (auth.session?.userType !== 'admin') {
      return next('/dashboard')
    }
  }

  next()
})

export default router
