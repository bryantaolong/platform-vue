/**
 * @module src/models/request/UserUpdateRequest.ts
 * @description 定义用户信息更新请求的数据结构。
 */
export interface UserUpdateRequest {
    username?: string; // 可选
    phone?: string;
    email?: string; // 可选
}