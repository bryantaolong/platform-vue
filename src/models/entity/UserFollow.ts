// src/models/entity/UserFollow.ts

/**
 * @module models/entity/UserFollow
 * @description Backend UserFollow entity.
 */
export interface UserFollow {
  id: number;           // ID
  followerId: number;   // Follower ID
  followingId: number;  // Following ID
  createTime: string;   // Follow time (backend LocalDateTime corresponds to string)
}
