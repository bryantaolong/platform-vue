// src/api/userProfile.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { MyBatisPageResult } from '@/models/response/MyBatisPageResult.ts';
import type {UserProfileVO} from "@/models/vo/UserProfileVO.ts";
import type {UserProfile} from "@/models/entity/UserProfile.ts";
import type {UserUpdateRequest} from "@/models/request/user/UserUpdateRequest.ts"; // Re-using MongoPageResult from user API

/**
 * User Follow related API request module
 */

export function getUserProfileByUserId(userId: number): Promise<Result<UserProfileVO>> {
    return request({
        url: `/api/user-profiles/${userId}`,
        method: 'get',
    });
}

export function unfollowUser(realName: string): Promise<Result<UserProfileVO>> {
    return request({
        url: `/api/user-profiles/name/${realName}`,
        method: 'get',
    });
}

export function getCurrentUserProfile(): Promise<Result<MyBatisPageResult<UserProfileVO>>> {
    return request({
        url: `/api/user-profiles/me`,
        method: 'get',
    });
}

export function updateUser(
    userId: number,
    req: UserUpdateRequest
): Promise<Result<MyBatisPageResult<UserProfile>>> {
    return request({
        url: `/api/user-profiles/${userId}`,
        method: 'get',
        params: req
    });
}
