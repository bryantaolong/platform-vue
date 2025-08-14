/**
 * @module models/entity/PostFavorite
 * @description 博文收藏记录的前端实体定义，对应后端的 PostFavorite 实体类。
 */
export interface PostFavorite {
    userId: string;                 // 收藏者用户ID
    postId: string;                 // 被收藏的博文ID
    deleted: number;                // 逻辑删除标志
    version: number;                // 乐观锁版本号
    createdAt?: string;             // 创建时间 (后端LocalDateTime对应前端string)
    updatedAt?: string;             // 更新时间 (后端LocalDateTime对应前端string)
    createdBy: string;
    updatedBy: string;
}