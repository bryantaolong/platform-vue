// src/models/response/MongoPageResult.ts

export interface MongoPageResult<T = any> {
  content: T[];            // 对应 records
  totalElements: number;   // 对应 total
  number: number;          // 当前页码（从 0 开始）
  size: number;            // 每页大小
  totalPages: number;      // 总页数

  pageable?: {
    pageNumber?: number;
    pageSize?: number;
  };
}