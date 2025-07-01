// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import NotFound from '@/pages/NotFound.vue'
import Register from '@/pages/Register.vue'
import DashboardLayout from '@/pages/Dashboard.vue' // Dashboard 现在是布局组件
import DashboardOverview from '@/pages/dashboard/Overview.vue' // 仪表盘概览
import UserManagement from '@/pages/dashboard/UserManagement.vue' // 用户管理

import { useUserStore } from '@/stores/user' // 导入用户store
import { ElMessage } from 'element-plus' // 导入 ElMessage

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/register',
    component: Register
  },
  {
    path: '/dashboard',
    component: DashboardLayout, // 使用布局组件
    redirect: '/dashboard/overview', // 默认重定向到概览页
    meta: { requiresAdmin: true }, // 整个 /dashboard 路径都需要管理员权限
    children: [
      {
        path: 'overview', // 完整路径为 /dashboard/overview
        component: DashboardOverview,
        name: 'DashboardOverview',
        meta: { requiresAdmin: true }
      },
      {
        path: 'user-management', // 完整路径为 /dashboard/user-management
        component: UserManagement,
        name: 'UserManagement',
        meta: { requiresAdmin: true }
      }
      // 更多子路由...
    ]
  },
  // 404 路由，必须放在所有路由的最后
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫 (与之前相同，但已优化)
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 如果目标路由需要管理员权限
  if (to.meta.requiresAdmin) {
    // 确保用户信息已加载
    if (!userStore.userInfo && userStore.token) {
      try {
        const res = await userStore.fetchUserInfo();
        if (res.code !== 200 || !userStore.userInfo) {
          ElMessage.error('认证信息失效，请重新登录！');
          userStore.logout();
          return next('/login'); // 返回登录页
        }
      } catch (error) {
        console.error('路由守卫获取用户信息失败:', error);
        ElMessage.error('网络错误或认证失败，请重新登录！');
        userStore.logout();
        return next('/login'); // 返回登录页
      }
    }

    // 检查是否是管理员
    const isAdmin = userStore.userInfo && userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');

    if (!isAdmin) {
      ElMessage.error('您没有权限访问此页面！');
      return next('/'); // 重定向到主页
    } else {
      next(); // 允许访问
    }
  } else {
    next(); // 不需要管理员权限的页面直接放行
  }
});

// 捕获导航错误 (与之前相同)
router.onError((error, to, from) => {
  console.error('Vue Router 导航错误:', error);
  console.error('跳转目标:', to);
  console.error('跳转来源:', from);
  // ElMessage.error('页面跳转发生错误，请重试！');
});

export default router