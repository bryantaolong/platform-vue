// src/models/response/PageResult.ts
export interface PageResult<T> {
    records: T[]; // 数据列表
    total: number; // 总记录数
    size: number; // 每页大小
    current: number; // 当前页码
    pages: number; // 总页数
}