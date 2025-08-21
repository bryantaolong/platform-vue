// src/models/response/MyBatisPageResult.ts

export interface MyBatisPageResult<T> {
    rows: T[];
    total: number;
    pageNum: number;
    pageSize: number;
    pages: number;
}