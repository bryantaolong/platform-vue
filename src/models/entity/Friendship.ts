// src/models/entity/Friendship.ts

/**
 * @module models/entity/Friendship
 * @description Backend Friendship entity.
 */
export interface Friendship {
    id: number;           // ID
    userId1: number;   // User ID 1
    userId2: number;  // User ID 2
    deleted: boolean;
    createTime: string;
    updateTime: string;
}
