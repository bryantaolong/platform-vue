/**
 * @module src/models/request/user/UserSearchRequest.ts
 * @description 定义搜索用户请求的数据结构。
 */
export interface UserSearchRequest {
    username?: string;
    phoneNumber?: string;
    email?: string;
    status?: number;
    roles?: string;
    loginTime?: string;
    loginIp?: string;
    passwordResetTime?: string;      // 密码重置时间
    loginFailCount?: number;         // 登录失败次数
    accountLockTime?: string;        // 账号锁定时间
    deleted?: number;                // 逻辑删除标志
    version?: number;                // 乐观锁版本号
    createTime?: string;
    createTimeStart?: string;
    createTimeEnd?: string;
    createBy?: string;
    updateTime?: string;
    updateTimeStart?: string;
    updateTimeEnd?: string;
    updateBy?: string;
}