// src/api/userRole.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';

/**
 * 获取所有角色下拉选项（管理员权限）
 */
export function listAllRoles(): Promise<Result<UserRoleOptionDTO[]>> {
    return request({
        url: '/api/user-roles/all',
        method: 'get'
    });
}

export interface UserRoleOptionDTO {
    id: number;
    roleName: string;
}