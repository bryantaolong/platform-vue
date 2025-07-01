/**
 * @module models/ChangePasswordRequest
 * @description 定义用户修改密码请求的数据结构。
 */
export interface ChangePasswordRequest {
  /**
   * 旧密码
   * @TJS-required
   * @TJS-type string
   * @TJS-pattern ^.{6,20}$
   */
  oldPassword: string;

  /**
   * 新密码
   * @TJS-required
   * @TJS-type string
   * @TJS-pattern ^.{6,20}$
   */
  newPassword: string;
}