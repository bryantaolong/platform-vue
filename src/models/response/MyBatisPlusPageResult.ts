// src/models/response/MyBatisPlusPageResult.ts

export interface MyBatisPlusPageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}