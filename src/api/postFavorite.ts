// src/api/postFavorite.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { PostFavoriteAddRequest } from '@/models/request/PostFavoriteAddRequest';

/**
 * 博文收藏相关的 RESTful API 请求模块
 */

/**
 * 获取当前用户收藏的博文列表（分页）。
 * @param params
 */
export function getMyFavorites(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<Result<any>> {
  return request({
    url: '/api/post_favorite/my',
    method: 'get',
    params,
  });
}

/**
 * 添加博文到当前用户的收藏列表。
 * @param data 包含要收藏的博文ID
 */
export function addFavorite(data: PostFavoriteAddRequest): Promise<Result<string>> {
  return request({
    url: '/api/post_favorite',
    method: 'post',
    data,
  });
}

/**
 * 根据收藏记录的唯一ID取消收藏。
 * @param favoriteId 收藏记录的唯一ID (MySQL 中 PostFavorite 表的ID)
 */
export function deleteFavoriteById(favoriteId: string): Promise<Result<string>> {
  return request({
    url: `/api/post_favorite/${favoriteId}`,
    method: 'delete',
  });
}

/**
 * 根据博文ID取消当前用户对该博文的收藏。
 * @param postId 被取消收藏的博文ID (MongoDB 中的 Post 表ID)
 */
export function deleteFavoriteByPostId(postId: string): Promise<Result<string>> {
  return request({
    url: `/api/post_favorite/post/${postId}`,
    method: 'delete',
  });
}

/**
 * 检查当前用户是否已收藏指定博文。
 * @param postId 要检查的博文ID
 */
export function checkFavorite(postId: string): Promise<Result<boolean>> {
  return request({
    url: `/api/post_favorite/check/${postId}`,
    method: 'get',
  });
}