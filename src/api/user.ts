// src/api/user.ts
import request from '@/utils/request';
import type { User } from '@/models/entity/User';
import type { Result } from '@/models/response/Result';
import type {MyBatisPlusPageResult} from '@/models/response/MyBatisPlusPageResult';
import type { UserSearchRequest } from '@/models/request/user/UserSearchRequest';
import type { PageRequest } from '@/models/request/PageRequest';
import type {UserUpdateRequest} from "@/models/request/user/UserUpdateRequest.ts";

/**
 * 获取所有用户列表（不分页）
 */
export function getAllUsers(pageRequest: PageRequest): Promise<Result<MyBatisPlusPageResult<User>>> {
    return request({
        url: '/api/user/all',
        method: 'post',
        data: pageRequest,
    });
}

/**
 * 根据用户ID获取用户信息
 * @param id 用户ID
 */
export function getUserById(id: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}`,
        method: 'get'
    });
}

/**
 * 根据用户名获取用户信息
 * @param username 用户名
 */
export function getUserByUsername(username: string): Promise<Result<User>> {
    return request({
        url: `/api/user/username/${username}`,
        method: 'get'
    });
}

/**
 * 多条件搜索用户，带分页
 * @param search 查询条件
 * @param page 分页参数
 */
export function searchUsers(
    search: UserSearchRequest,
    page: PageRequest
): Promise<Result<MyBatisPlusPageResult<User>>> {
    return request({
        url: '/api/user/search',
        method: 'post',
        data: search,
        params: page
    });
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 用户对象
 */
export function updateUser(id: number, data: UserUpdateRequest): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}`,
        method: 'put',
        data
    });
}

/**
 * 修改用户角色
 * @param id 用户ID
 * @param roles 角色数组
 */
export function updateUserRole(id: number, roles: string[]): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}/role`,
        method: 'put',
        data: roles
    });
}

/**
 * 修改用户密码
 * @param id 用户ID
 * @param password 密码
 */
export function changePassword(id: number, password: string): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}/password`,
        method: 'put',
        data: password
    });
}

/**
 * 管理员强制修改用户密码
 * @param id 用户ID
 * @param newPassword 新密码
 */
export function changePasswordForcefully(id: number, newPassword: string): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}/password/force/${newPassword}`,
        method: 'put'
    });
}

/**
 * 封禁用户
 * @param id 用户ID
 */
export function blockUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}/block`,
        method: 'put'
    });
}

/**
 * 解封用户
 * @param id 用户ID
 */
export function unblockUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}/unblock`,
        method: 'put'
    });
}

/**
 * 删除用户（逻辑删除）
 * @param id 用户ID
 */
export function deleteUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${id}`,
        method: 'delete'
    });
}

