// src/models/entity/UserFollow.ts

/**
 * @module models/entity/UserFollow
 * @description Backend UserFollow entity.
 */
export interface UserFollow {
    id: number;           // ID
    followerId: number;   // Follower ID
    followingId: number;  // Following ID
    deleted: number;                // 逻辑删除标志
    version: number;                // 乐观锁版本号
    createdAt: string;              // 创建时间 (后端LocalDateTime对应前端string)
    updatedAt: string;              // 更新时间 (后端LocalDateTime对应前端string)
    createdBy: string;
    updatedBy: string;
}
