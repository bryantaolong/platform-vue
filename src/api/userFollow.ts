// src/api/userFollow.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { User } from '@/models/entity/User'; // Assuming User entity is needed for lists
import type { PageResult } from '@/models/response/PageResult'; // Re-using PageResult from user API

/**
 * User Follow related API request module
 */

/**
 * Follow a user.
 * @param followingId The ID of the user to follow.
 */
export function followUser(followingId: number): Promise<Result<boolean>> {
  return request({
    url: `/api/user_follow/follow/${followingId}`,
    method: 'post',
  });
}

/**
 * Unfollow a user.
 * @param followingId The ID of the user to unfollow.
 */
export function unfollowUser(followingId: number): Promise<Result<boolean>> {
  return request({
    url: `/api/user_follow/unfollow/${followingId}`,
    method: 'post',
  });
}

/**
 * Get users that a specific user is following.
 * @param userId The ID of the user whose following list is requested.
 * @param pageNum Current page number (starts from 1).
 * @param pageSize Number of items per page.
 */
export function getFollowingUsers(
  userId: number,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<Result<PageResult<User>>> {
  return request({
    url: `/api/user_follow/following/${userId}`,
    method: 'get',
    params: { pageNum, pageSize },
  });
}

/**
 * Get users that are following a specific user (followers).
 * @param userId The ID of the user whose followers list is requested.
 * @param pageNum Current page number (starts from 1).
 * @param pageSize Number of items per page.
 */
export function getFollowerUsers(
  userId: number,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<Result<PageResult<User>>> {
  return request({
    url: `/api/user_follow/followers/${userId}`,
    method: 'get',
    params: { pageNum, pageSize },
  });
}

/**
 * Check if the current user is following a specific user.
 * @param followingId The ID of the user to check if currently following.
 */
export function isFollowing(followingId: number): Promise<Result<boolean>> {
  return request({
    url: `/api/user_follow/check/${followingId}`,
    method: 'get',
  });
}
