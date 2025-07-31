/**
 * @module src/models/request/user/UserSearchRequest.ts
 * @description 定义搜索用户请求的数据结构。
 */
export interface UserSearchRequest {
    username?: string;

    phoneNumber?: string;

    email?: string;

    gender?: number;

    status?: number;

    roles?: string;

    loginTime?: string;

    loginIp?: string;

    passwordResetTime?: string;

    createTime?: string;

    createTimeStart?: string;

    createTimeEnd?: string;

    updateTime?: string;

    updateTimeStart?: string;

    updateTimeEnd?: string;
}