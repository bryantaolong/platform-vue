// src/router/index.ts
import {createRouter, createWebHistory} from 'vue-router'
import {useUserStore} from '@/stores/user'
import {ElMessage} from 'element-plus'
import DefaultLayout from "@/layout/DefaultLayout.vue";
import BlankLayout from "@/layout/BlankLayout.vue";
import NotFound from "@/views/NotFound.vue";
import Dashboard from "@/views/admin/Dashboard.vue";
import Users from "@/views/admin/Users.vue";
import AdminLayout from "@/layout/AdminLayout.vue";
import Profile from "@/views/Profile.vue";

const routes = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {path: '', name: 'Home', component: () => import('@/views/Home.vue')}
        ]
    },
    {
        path: '/login',
        component: BlankLayout,
        children: [
            {path: '', name: 'Login', component: () => import('@/views/Login.vue')}
        ]
    },
    {
        path: '/user',
        component: BlankLayout,
        redirect: '/profile',
        children: [
            {
                path: '',
                component: Profile,
                name: 'Profile',
            },
        ]
    },
    {
        path: '/admin',
        component: AdminLayout,
        redirect: '/dashboard',
        meta: {requiresAdmin: true},
        children: [
            {
                path: '',
                component: Dashboard,
                name: 'Dashboard',
                meta: {requiresAdmin: true}
            },
            {
                path: 'users',
                component: Users,
                name: 'Users',
                meta: {requiresAdmin: true}
            }
        ]
    },
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

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore();

    // 检查是否需要认证
    if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        // 确保用户信息已加载
        if (!userStore.userInfo && userStore.token) {
            try {
                const res = await userStore.fetchUserInfo();
                if (res.code !== 200 || !userStore.userInfo) {
                    ElMessage.error('认证信息失效，请重新登录！');
                    userStore.logout();
                    return next('/login');
                }
            } catch (error) {
                console.error('路由守卫获取用户信息失败:', error);
                ElMessage.error('网络错误或认证失败，请重新登录！');
                userStore.logout();
                return next('/login');
            }
        } else if (!userStore.token) { // 没有token直接去登录
            ElMessage.warning('您尚未登录，请先登录。');
            return next('/login');
        }
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
        const isAdmin = userStore.userInfo && userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');
        if (!isAdmin) {
            ElMessage.error('您没有权限访问此页面！');
            return next('/');
        }
    }

    next();
});

router.onError((error, to, from) => {
    console.error('Vue Router 导航错误:', error);
    console.error('跳转目标:', to);
    console.error('跳转来源:', from);
});

export default router