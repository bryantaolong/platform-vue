import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import DefaultLayout from "@/layouts/DefaultLayout.vue"
import BlankLayout from "@/layouts/BlankLayout.vue"
import AdminLayout from "@/layouts/AdminLayout.vue"

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/views/home/Home.vue')
            },
            {
                path: 'follow',
                name: 'Follow',
                component: () => import('@/views/home/Follow.vue')
            },
            {
                path: 'hot',
                name: 'Hot',
                component: () => import('@/views/home/Hot.vue')
            },
            {
                path: '/post/:id',
                name: 'PostDetail',
                component: () => import('@/views/post/PostDetail.vue')
            },
        ]
    },
    {
        path: '/login',
        component: BlankLayout,
        children: [
            {
                path: '',
                name: 'Login',
                component: () => import('@/views/Login.vue')
            }
        ]
    },
    {
        path: '/register',
        component: BlankLayout,
        children: [
            {
                path: '',
                name: 'Register',
                component: () => import('@/views/Register.vue')
            }
        ]
    },
    {
        path: '/user/:id',
        component: DefaultLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                component: () => import('@/views/Profile.vue'),
                redirect: to => `/user/${to.params.id}/publications`,
                children: [
                    {
                        path: 'publications',
                        name: 'UserPublications',
                        component: () => import('@/views/profile/Publications.vue')
                    },
                    {
                        path: 'favorites',
                        name: 'UserFavorites',
                        component: () => import('@/views/profile/Favorites.vue')
                    },
                    {
                        path: 'settings',
                        name: 'UserSettings',
                        component: () => import('@/views/profile/Settings.vue')
                    },
                    {
                        path: 'following',
                        name: 'UserFollowing',
                        component: () => import('@/views/profile/Following.vue')
                    },
                    {
                        path: 'followers',
                        name: 'UserFollowers',
                        component: () => import('@/views/profile/Followers.vue')
                    }
                ]
            }
        ]
    },
    {
        path: '/admin',
        component: AdminLayout,
        redirect: '/dashboard',
        meta: { requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/admin/Dashboard.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/views/admin/Users.vue'),
                meta: { requiresAdmin: true }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth || to.meta.requiresAdmin) {
        if (!userStore.userInfo && userStore.token) {
            try {
                const res = await userStore.fetchUserInfo()
                if (res.code !== 200 || !userStore.userInfo) {
                    ElMessage.error('认证信息失效，请重新登录！')
                    userStore.logout()
                    return next('/login')
                }
            } catch (error) {
                console.error('路由守卫获取用户信息失败:', error)
                ElMessage.error('网络错误或认证失败，请重新登录！')
                userStore.logout()
                return next('/login')
            }
        } else if (!userStore.token) {
            ElMessage.warning('您尚未登录，请先登录。')
            return next('/login')
        }
    }

    if (to.meta.requiresAuth) {
        const isUser = userStore.userInfo && userStore.userInfo.roles.includes('ROLE_USER')
        if (!isUser) {
            ElMessage.error('您尚未登录，请登录！')
            return next('/')
        }
    }

    if (to.meta.requiresAdmin) {
        const isAdmin = userStore.userInfo && userStore.userInfo.roles.includes('ROLE_ADMIN')
        if (!isAdmin) {
            ElMessage.error('您没有权限访问此页面！')
            return next('/')
        }
    }

    next()
})

router.onError((error, to, from) => {
    console.error('Vue Router 导航错误:', error)
    console.error('跳转目标:', to)
    console.error('跳转来源:', from)
})

export default router
