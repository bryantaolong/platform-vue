// src/api/userRole.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';

/**
 * 获取所有角色下拉选项（管理员权限）
 */
export function listAllRoles(): Promise<Result<RoleOptionDTO[]>> {
    return request({
        url: '/api/user/role/all',
        method: 'get'
    });
}

export interface RoleOptionDTO {
    id: number;
    roleName: string;
}