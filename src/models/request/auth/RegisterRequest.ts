/**
 * @module models/RegisterRequest
 * @description 定义用户注册请求的数据结构。
 */
export interface RegisterRequest {
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
     * @TJS-pattern ^.{6,}$
     */
    password: string;

    /**
     * 电话号码
     * @TJS-type string
     */
    phone: string;

    /**
     * 邮箱地址
     * @TJS-type string
     * @TJS-format email
     */
    email: string;
}