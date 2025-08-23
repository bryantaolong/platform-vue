// src/api/user.ts
import request from '@/utils/request';
import type { User } from '@/models/entity/User';
import type { Result } from '@/models/response/Result';
import type {MyBatisPageResult} from '@/models/response/MyBatisPageResult.ts';
import type { UserSearchRequest } from '@/models/request/user/UserSearchRequest';
import type {UserUpdateRequest} from "@/models/request/user/UserUpdateRequest.ts";
import type {ChangePasswordRequest} from "@/models/request/user/ChangePasswordRequest.ts";
import type {ChangeRoleRequest} from "@/models/request/user/ChangeRoleRequest.ts";

/**
 * 获取所有用户列表（不分页）
 */
export function getAllUsers(pageNum: number = 1,
                            pageSize: number = 10): Promise<Result<MyBatisPageResult<User>>> {
    return request({
        url: '/api/users/all',
        method: 'post',
        params: { pageNum, pageSize },
    });
}

/**
 * 根据用户ID获取用户信息
 * @param id 用户ID
 */
export function getUserById(id: number): Promise<Result<User>> {
    return request({
        url: `/api/users/${id}`,
        method: 'get'
    });
}

/**
 * 根据用户名获取用户信息
 * @param username 用户名
 */
export function getUserByUsername(username: string): Promise<Result<User>> {
    return request({
        url: `/api/users/username/${username}`,
        method: 'get'
    });
}

/**
 * 多条件搜索用户，带分页
 * @param search 查询条件
 * @param pageNum
 * @param pageSize
 */
export function searchUsers(
    search: UserSearchRequest,
    pageNum: number = 1,
    pageSize: number = 10
): Promise<Result<MyBatisPageResult<User>>> {
    return request({
        url: '/api/users/search',
        method: 'post',
        data: search,
        params: { pageNum, pageSize },
    });
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param data 用户对象
 */
export function updateUser(id: number, data: UserUpdateRequest): Promise<Result<User>> {
    return request({
        url: `/api/users/${id}`,
        method: 'put',
        data
    });
}

/**
 * 修改用户角色
 * @param id 用户ID
 * @param roleIds 角色ID数组
 */
export function updateUserRole(id: number, roleIds: number[]): Promise<Result<User>> {
    return request({
        url: `/api/users/roles/${id}/`,
        method: 'put',
        data: { roleIds } as ChangeRoleRequest
    });
}

/**
 * 修改用户密码
 * @param id 用户ID
 * @param oldPassword
 * @param newPassword
 */
export function changePassword(id: number, oldPassword: string, newPassword: string): Promise<Result<User>> {
    return request({
        url: `/api/users/password/${id}`,
        method: 'put',
        data: { oldPassword, newPassword } as ChangePasswordRequest
    });
}

/**
 * 管理员强制修改用户密码
 * @param id 用户ID
 * @param newPassword 新密码
 */
export function changePasswordForcefully(id: number, newPassword: string): Promise<Result<User>> {
    return request({
        url: `/api/users/password/force/${id}`,
        method: 'put',
        data: { newPassword } as ChangePasswordRequest
    });
}

/**
 * 封禁用户
 * @param id 用户ID
 */
export function blockUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/users//block${id}`,
        method: 'put'
    });
}

/**
 * 解封用户
 * @param id 用户ID
 */
export function unblockUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/users/unblock/${id}`,
        method: 'put'
    });
}

/**
 * 删除用户（逻辑删除）
 * @param id 用户ID
 */
export function deleteUser(id: number): Promise<Result<User>> {
    return request({
        url: `/api/users/${id}`,
        method: 'delete'
    });
}
