// src/models/entity/UserRole.ts
export interface UserRole {
    id: number;
    roleName: string;
    isDefault?: boolean;
    deleted?: 0 | 1;
    version?: number;
    createdAt?: string;         // ISO 格式字符串
    updatedAt?: string;         // ISO 格式字符串
    createdBy?: string;
    updatedBy?: string;
}