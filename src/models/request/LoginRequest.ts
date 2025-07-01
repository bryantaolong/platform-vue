/**
 * @module models/request/LoginRequest
 * @description 定义用户登录请求的数据结构。
 */
export interface LoginRequest {
  /**
   * 用户名
   * @TJS-required
   * @TJS-type string
   * @TJS-pattern ^.{1,15}$
   */
  username: string;

  /**
   * 密码
   * @TJS-required
   * @TJS-type string
   * @TJS-pattern ^.{6,20}$
   */
  password: string;
}