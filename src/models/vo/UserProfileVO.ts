/**
 * @module src/models/vo/UserVO.ts
 * @description 定义用户信息更新请求的数据结构。
 */
export interface UserProfileVO {
    userId?: number;
    username?: string;
    phone?: string;
    email?: string;
    realName?: string;
    gender?: number;
    birthday?: string;
    avatar?: string;
}
