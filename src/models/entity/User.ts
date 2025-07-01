// src/models/entity/User.ts

/**
 * @module models/entity/User
 * @description 后端用户实体类。
 */
export interface User {
  id: number;           // 用户ID
  username: string;     // 用户名
  // password: string;  // 密码通常不在前端实体中传输，即使有也是加密后的，不直接显示
  email: string;        // 邮箱
  status: number;       // 状态（0-正常，1-封禁）
  roles: string;        // 角色字符串，逗号分隔
  deleted: number;      // 逻辑删除标志
  createTime: string;   // 创建时间 (后端LocalDateTime对应前端string)
  updateTime: string;   // 更新时间 (后端LocalDateTime对应前端string)
}