// src/models/request/UserExportRequest.ts
export interface UserExportRequest {
  fields?: string[]; // 要导出的字段列表
  fileName?: string; // 导出文件名
  status?: number; // 状态过滤
}