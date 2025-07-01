// src/api/post.ts
import request from '@/utils/request';
import type {Result} from '@/models/response/Result';
import type {Post} from '@/models/entity/Post';

/**
 * 博文相关的 RESTful API 请求模块
 */

/**
 * 获取所有已发布的博文列表（支持分页和排序）。
 * @param params
 */
export function getAllPublishedPosts(params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
}): Promise<Result<any>> {
    return request({
        url: '/api/posts',
        method: 'get',
        params,
    });
}

/**
 * 根据 Slug 获取单篇博文详情，并自动增加浏览量。
 * @param slug 博文的唯一标识符
 */
export function getPostBySlug(slug: string): Promise<Result<Post>> {
    return request({
        url: `/api/posts/${slug}`,
        method: 'get',
    });
}

/**
 * 创建新博文。
 * @param data 博文数据
 */
export function createPost(data: Partial<Post>): Promise<Result<Post>> {
    return request({
        url: '/api/posts',
        method: 'post',
        data,
    });
}

/**
 * 更新博文。
 * @param id 博文ID (MongoDB 的 String 类型 ID)
 * @param data 包含更新内容的博文实体
 */
export function updatePost(id: string, data: Partial<Post>): Promise<Result<Post>> {
    return request({
        url: `/api/posts/${id}`,
        method: 'put',
        data,
    });
}

/**
 * 删除博文。
 * @param id 博文ID (MongoDB 的 String 类型 ID)
 */
export function deletePost(id: string): Promise<Result<void>> {
    return request({
        url: `/api/posts/${id}`,
        method: 'delete',
    });
}

/**
 * 为指定博文添加评论。
 * @param postId 博文ID
 * @param commentContent
 */
export function addComment(postId: string, commentContent: string): Promise<Result<Post>> {
    return request({
        url: `/api/posts/${postId}/comments`,
        method: 'post',
        data: {content: commentContent}, // 仅发送 content 字段
    });
}

/**
 * 删除博文中的评论。
 * @param postId 博文ID
 * @param commentId 评论ID
 */
export function deleteComment(postId: string, commentId: string): Promise<Result<Post>> {
    return request({
        url: `/api/posts/${postId}/comments/${commentId}`,
        method: 'delete',
    });
}

/**
 * 对已发布的博文执行全文搜索。
 * @param query 搜索关键词
 */
export function searchPosts(query: string): Promise<Result<Post[]>> {
    return request({
        url: '/api/posts/search',
        method: 'get',
        params: {query},
    });
}

/**
 * 推荐博文。
 * @param currentPostId 当前博文ID
 * @param limit 推荐数量限制
 */
export function getRecommendations(currentPostId: string, limit?: number): Promise<Result<Post[]>> {
    return request({
        url: `/api/posts/recommendations/${currentPostId}`,
        method: 'get',
        params: {limit},
    });
}