import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { Post } from '@/models/entity/Post';
import type { MongoPageResult } from '@/models/response/MongoPageResult';
import type { PostFavoriteAddRequest } from '@/models/request/psot/PostFavoriteAddRequest';

/**
 * 博文收藏相关 API 封装
 */

/**
 * 获取指定用户收藏的博文列表（支持分页和排序）
 * @param userId 用户 ID
 * @param params 分页和排序参数 { page?: number, size?: number, sortBy?: string, sortDir?: 'ASC' | 'DESC' }
 */
export function getFavoritePostsByUserId(
    userId: number,
    params?: {
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: 'ASC' | 'DESC';
    }
): Promise<Result<MongoPageResult<Post>>> {
    return request({
        url: `/api/post_favorite/${userId}`,
        method: 'get',
        params: {
            page: params?.page ?? 0,
            size: params?.size ?? 10,
            sortBy: params?.sortBy ?? 'createdAt',
            sortDir: params?.sortDir ?? 'DESC'
        }
    });
}

// 添加收藏
export function addPostFavorite(data: PostFavoriteAddRequest): Promise<Result<string>> {
    return request({
        url: '/api/post_favorite',
        method: 'post',
        data
    });
}

// 根据博文ID取消收藏
export function deletePostFavorite(postId: string): Promise<Result<string>> {
    return request({
        url: `/api/post_favorite/post/${postId}`,
        method: 'delete'
    });
}

// 检查当前用户是否已收藏某博文
export function checkPostFavorite(postId: string): Promise<Result<boolean>> {
    return request({
        url: `/api/post_favorite/check/${postId}`,
        method: 'get'
    });
}