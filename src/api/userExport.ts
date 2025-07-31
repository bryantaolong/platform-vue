// src/api/userExport.ts
import request from '@/utils/request';
import type { Result } from '@/models/response/Result';
import type { UserExportRequest } from '@/models/request/user/UserExportRequest.ts';
/**
 * 用户相关的 RESTful API 请求模块
 */

/**
 * 获取可导出的字段列表
 */
export function getExportFields(): Promise<Result<Record<string, string>>> {
    return request({
        url: '/api/user/export/fields',
        method: 'get'
    });
}

/**
 * 导出用户数据（支持字段选择）
 * @param data 用户导出请求数据
 */
export function exportUsers(data: UserExportRequest): Promise<void> {
    // 注意：导出文件通常不返回JSON，而是直接触发文件下载。
    // Axios 默认会解析JSON，这里需要配置 responseType: 'blob' 来接收文件流。
    // 并且返回值是 Promise<void>，因为我们不关心其JSON响应。
    return request({
        url: '/api/user/export',
        method: 'post',
        data,
        responseType: 'blob' // 接收二进制数据
    }).then(response => {
        // 处理文件下载 - 修复：使用 response.data 而不是 response
        const filename = data.fileName ? `${data.fileName}.xlsx` : '用户数据.xlsx'; // 默认文件名
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }) as Promise<void>; // 强制转换为 Promise<void>
}

/**
 * 导出所有用户数据（包含所有字段）
 * @param fileName 导出文件名
 * @param status 状态过滤（可选）
 */
export function exportAllUsers(fileName?: string, status?: number | null): Promise<void> {
    return request({
        url: '/api/user/export/all',
        method: 'get',
        params: {
            fileName: fileName || '用户数据',
            status: status ?? undefined
        },
        responseType: 'blob' // 接收二进制数据
    }).then(response => {
        // 修复：使用 response.data 而不是 response
        const filename = fileName ? `${fileName}.xlsx` : '用户数据.xlsx';
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }) as Promise<void>;
}