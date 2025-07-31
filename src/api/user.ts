// src/api/user.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { User } from '@/models/entity/User';
import type { UserUpdateRequest } from '@/models/request/user/UserUpdateRequest.ts';
import type { ChangePasswordRequest } from '@/models/request/user/ChangePasswordRequest.ts';
import type {MyBatisPlusPageResult} from "@/models/response/MyBatisPlusPageResult.ts";

/**
 * 用户相关的 RESTful API 请求模块
 */

/**
 * 获取所有用户列表（支持分页和搜索）
 * 后端 getAllUsers() 返回的是 Result<Page<User>>
 * @param params 分页和搜索参数 { page: number, size: number, username?: string, email?: string, status?: number }
 */
export function getAllUsers(params?: {
    page?: number;
    size?: number;
    username?: string;
    email?: string;
    status?: number;
}): Promise<Result<MyBatisPlusPageResult<User>>> {
    return request({
        url: '/api/user/all',
        method: 'get',
        params, // 将分页和搜索参数作为查询参数发送
    });
}

/**
 * 根据用户 ID 获取用户信息。
 * @param userId 用户 ID
 */
export function getUserById(userId: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${userId}`,
        method: 'get',
    });
}

/**
 * 根据用户名获取用户信息。
 * @param username 用户名
 */
export function getUserByUsername(username: string): Promise<Result<User>> {
    return request({
        url: `/api/user/username/${username}`,
        method: 'get',
    });
}

/**
 * 更新用户基本信息。
 * @param userId 要更新的用户 ID
 * @param data 包含需要更新的用户信息（username, email）
 */
export function updateUser(userId: number, data: UserUpdateRequest): Promise<Result<User>> {
    return request({
        url: `/api/user/${userId}`,
        method: 'put',
        data,
    });
}

/**
 * 更改用户角色。
 * @param userId 要更改角色的用户 ID
 * @param roles 新的角色字符串，多个角色以逗号分隔（例如 "ROLE_USER,ROLE_ADMIN"）
 */
export function changeRole(userId: number, roles: string): Promise<Result<User>> {
    return request({
        url: `/api/user/${userId}/role`,
        method: 'put',
        // 注意：后端接收的是 String 类型的 @RequestBody，前端需要以纯文本或 application/json 形式发送
        // request 工具函数通常会处理为 application/json，所以直接传字符串即可
        data: roles,
        headers: {
            'Content-Type': 'text/plain' // 明确告诉后端这是纯文本，如果后端是 @RequestBody String
                                         // 如果后端希望是 JSON 字符串，则不需要此头，直接传 `"rolesString"`
        }
    });
}

/**
 * 更改用户密码。
 * @param userId 要更改密码的用户 ID
 * @param data 包含旧密码和新密码的数据传输对象
 */
export function changePassword(userId: number, data: ChangePasswordRequest): Promise<Result<User>> {
    return request({
        url: `/api/user/${userId}/password`,
        method: 'put',
        data,
    });
}

/**
 * 删除用户（逻辑删除）。
 * @param userId 要删除的用户 ID
 */
export function deleteUser(userId: number): Promise<Result<User>> {
    return request({
        url: `/api/user/${userId}`,
        method: 'delete',
    });
}
