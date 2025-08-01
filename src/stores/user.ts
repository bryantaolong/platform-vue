import { defineStore } from 'pinia'
import { login, register, getCurrentUser } from '@/api/auth'
import type { LoginRequest } from '@/models/request/auth/LoginRequest.ts'
import type { RegisterRequest } from '@/models/request/auth/RegisterRequest.ts'
import type { Result } from '@/models/response/Result'
import type { User } from '@/models/entity/User'
// import {initWebSocket} from "@/utils/websocket.ts"; // 用户实体类型

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    // userInfo 可以是 User 类型或者 null
    userInfo: null as User | null,
  }),

  getters: {
    /**
     * 判断用户是否已登录
     * 基于 token 和 userInfo 的存在性来判断
     */
    isLoggedIn(): boolean {
      return !!(this.token && this.userInfo)
    }
  },

  actions: {
    /**
     * 用户登录操作
     * @param form 登录请求数据
     * @returns 包含登录结果的 Result
     */
    async login(form: LoginRequest): Promise<Result<string>> {
      // login 函数现在明确返回 ApiResponse<LoginResponseData> 类型
      const res = await login(form)
      if (res.code === 200) {
        // res.data 现在被明确为 LoginResponseData (即 string)，所以可以访问其属性
        this.token = res.data // 直接赋值，因为 res.data 就是 token 字符串
        localStorage.setItem('token', res.data)
        await this.fetchUserInfo()
      }
      return res
    },

    /**
     * 用户注册操作
     * @param form 注册请求数据
     * @returns 包含注册结果的 Result (data为User实体)
     */
    async register(form: RegisterRequest): Promise<Result<User>> {
      // register 函数明确返回 ApiResponse<User> 类型
      return await register(form)
    },

    /**
     * 获取当前用户信息
     * @returns 包含用户信息User的ApiResponse
     */
    async fetchUserInfo(): Promise<Result<User>> {
      // getCurrentUser 函数明确返回 ApiResponse<User> 类型
      const res = await getCurrentUser()
      if (res.code === 200) {
        this.userInfo = res.data // res.data 现在被明确为 User 类型
        // initWebSocket(); // ⬅️ 添加这里
      }
      return res // 返回 res 方便调用者处理
    },

    /**
     * 用户登出操作
     */
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
    },

    /**
     * 初始化用户状态
     * 在应用启动时调用，如果有 token 但没有用户信息，则获取用户信息
     */
    async initUserState() {
      if (this.token && !this.userInfo) {
        await this.fetchUserInfo()
      }
    }
  }
})