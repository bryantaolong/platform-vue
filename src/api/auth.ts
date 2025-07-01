// src/api/auth.ts
import request from '@/utils/request';
import type { LoginRequest } from '@/models/request/LoginRequest';
import type { RegisterRequest } from '@/models/request/RegisterRequest';
import type { Result } from '@/models/response/Result';
import type {User} from "@/models/entity/User.ts";

/**
 * 用户认证相关 API 请求模块
 */

/**
 * 注册接口
 * @param data 注册请求数据
 */
export function register(data: RegisterRequest): Promise<Result<User>> { // 注册接口的返回类型，你可以根据实际情况定义更具体的data类型
    return request({
        url: '/api/auth/register',
        method: 'post',
        data,
    });
}

/**
 * 登录接口
 * @param data 登录请求数据
 */
export function login(data: LoginRequest): Promise<Result<string>> { // 明确指定返回类型
    return request({
        url: '/api/auth/login',
        method: 'post',
        data,
    });
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<Result<User>> { // 获取用户信息接口的返回类型
    return request({
        url: '/api/auth/me',
        method: 'get',
    });
}

/**
 * 验证 Token 是否有效
 * @param token 用户Token
 */
export function validateToken(token: string): Promise<Result<string>> { // 验证Token接口的返回类型
    return request({
        url: '/api/auth/validate',
        method: 'get',
        params: { token },
    });
}