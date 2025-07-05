import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { Post } from '@/models/entity/Post';
import type { MongoPageResult } from '@/models/response/MongoPageResult';
import type { PostFavoriteAddRequest } from '@/models/request/psot/PostFavoriteAddRequest';

/**
 * 博文收藏相关 API 封装
 */

// 获取当前用户收藏的博文列表（分页）
export function getMyFavoritePosts(params?: {
    page?: number;
    size?: number;
    sort?: string;
}): Promise<Result<MongoPageResult<Post>>> {
    return request({
        url: '/api/post_favorite/my',
        method: 'get',
        params: {
            page: params?.page ?? 0,
            size: params?.size ?? 10,
            sort: params?.sort ?? 'createdAt,desc'
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

// 根据收藏记录ID取消收藏
export function deletePostFavoriteById(favoriteId: string): Promise<Result<string>> {
    return request({
        url: `/api/post_favorite/${favoriteId}`,
        method: 'delete'
    });
}

// 根据博文ID取消收藏
export function deletePostFavoriteByPostId(postId: string): Promise<Result<string>> {
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
