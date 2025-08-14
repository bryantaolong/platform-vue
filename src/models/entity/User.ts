// src/models/entity/User.ts

/**
 * @module models/entity/User
 * @description 后端用户实体类。
 */
export interface User {
    id: number;                     // 用户ID
    username: string;               // 用户名
    // password: string;            // 密码通常不在前端实体中传输，即使有也是加密后的，不直接显示
    phone: string;                  // 电话号码
    email: string;                  // 邮箱
    status: number;                 // 状态（0-正常，1-禁用，2锁定）
    roles: string;                  // 角色字符串，逗号分隔
    lastLoginAt: string;            // 上次登录时间
    lastLoginIp: string;            // 上次登录 IP
    passwordResetAt: string;        // 密码重置时间
    loginFailCount: number;         // 登录失败次数
    lockedAt: string;               // 账号锁定时间
    deleted: number;                // 逻辑删除标志
    version: number;                // 乐观锁版本号
    createdAt: string;              // 创建时间 (后端LocalDateTime对应前端string)
    updatedAt: string;              // 更新时间 (后端LocalDateTime对应前端string)
    createdBy: string;
    updatedBy: string;
}