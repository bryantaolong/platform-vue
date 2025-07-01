import {createRouter, createWebHistory} from 'vue-router'
import Home from '@/pages/Home.vue'
import Login from '@/pages/Login.vue'
import NotFound from '@/pages/NotFound.vue'
import Register from "@/pages/Register.vue";

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
        path: '/register', // 添加注册路由
        component: Register
    },
    // 404 路由，必须放在所有路由的最后
    {
        path: '/:pathMatch(.*)*', // 匹配所有未匹配到的路径
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router