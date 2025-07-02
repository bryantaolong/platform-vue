// src/router/index.ts
import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import NotFound from '@/pages/NotFound.vue'
import Register from '@/pages/Register.vue'
import DashboardLayout from '@/pages/Dashboard.vue'
import DashboardOverview from '@/pages/dashboard/Overview.vue'
import UserManagement from '@/pages/dashboard/UserManagement.vue'
import PostDetail from '@/pages/post/PostDetail.vue' // 导入博文详情页
import MyFavorites from '@/pages/post/MyFavorites.vue' // 导入我的收藏页

import {useUserStore} from '@/stores/user'
import {ElMessage} from 'element-plus'
import Profile from "@/pages/Profile.vue";
import UserProfile from "@/pages/UserProfile.vue";
import ChatView from "@/pages/ChatView.vue";
import FriendList from "@/pages/FriendList.vue";

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
        path: '/post/:slug', // 博文详情路由，使用 slug 作为参数
        component: PostDetail,
        name: 'PostDetail'
    },
    {
        path: '/my-favorites', // 我的收藏路由
        component: MyFavorites,
        name: 'MyFavorites',
        meta: {requiresAuth: true} // 需要登录才能访问
    },
    {
        path: '/dashboard',
        component: DashboardLayout,
        redirect: '/dashboard/overview',
        meta: {requiresAdmin: true},
        children: [
            {
                path: 'overview',
                component: DashboardOverview,
                name: 'DashboardOverview',
                meta: {requiresAdmin: true}
            },
            {
                path: 'user-management',
                component: UserManagement,
                name: 'UserManagement',
                meta: {requiresAdmin: true}
            }
        ]
    },
    {
        path: '/profile', // 个人中心路由
        component: Profile,
        name: 'Profile',
        meta: {requiresAuth: true} // 需要登录才能访问
    },
    {
        path: '/user/:id', // 新增的用户主页路由，使用 :id 作为用户ID参数
        component: UserProfile,
        name: 'UserProfile',
        props: true // 允许组件通过 props 接收路由参数
    },
    {
        path: '/friends',
        component: FriendList,
        name: 'FriendList',
        meta: {requiresAuth: true} // 需要登录才能查看好友列表
    },
    {
        path: '/chat/:otherUserId', // 对方用户ID
        component: ChatView,
        name: 'ChatView',
        props: true, // 允许组件通过 props 接收路由参数 (otherUserId)
        meta: {requiresAuth: true} // 需要登录才能聊天
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