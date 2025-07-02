// src/models/response/PageResult.ts
// 假设后端返回的分页结构是这样的，请根据实际情况调整
export interface PageResult<T> {
    records: T[]; // 数据列表
    total: number; // 总记录数
    size: number; // 每页大小
    current: number; // 当前页码
    pages: number; // 总页数
}