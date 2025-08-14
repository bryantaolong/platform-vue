// src/models/entity/UserProfile.ts

export interface UserProfile {
    userId: number;
    realName?: string;
    gender?: number;
    birthday?: string;          // ISO 格式字符串，对应后端 LocalDateTime
    avatar?: string;
    deleted?: 0 | 1;
    version?: number;
    createdAt?: string;         // ISO 格式字符串
    updatedAt?: string;         // ISO 格式字符串
    createdBy?: string;
    updatedBy?: string;
}