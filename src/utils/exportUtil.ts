// src/utils/exportUtils.ts

import type { Post } from '@/models/entity/Post';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

/**
 * 触发浏览器下载
 * @param blob - 文件内容的 Blob 对象
 * @param fileName - 下载的文件名
 */
function triggerDownload(blob: Blob, fileName: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放内存
}

/**
 * 导出为 Markdown 或 TXT
 * @param post - 博文对象
 * @param format - 'md' 或 'txt'
 */
export function exportAsText(post: Post, format: 'md' | 'txt') {
    const title = format === 'md' ? `# ${post.title}\n\n` : `${post.title}\n\n`;
    const content = title + post.content;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${post.slug || 'post'}.${format}`);
}

/**
 * 导出为 Word (.docx)
 * @param post - 博文对象
 */
export async function exportAsDocx(post: Post) {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: post.title,
                    heading: HeadingLevel.HEADING_1,
                    alignment: 'center'
                }),
                // 添加一个空行
                new Paragraph({ text: '' }),
                // 博文内容。注意：这会将 HTML 标签作为纯文本处理。
                // 如需复杂转换，需要先将 HTML 转为 docx 可识别的格式。
                new Paragraph({
                    text: post.content
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    triggerDownload(blob, `${post.slug || 'post'}.docx`);
}

/**
 * 导出为 PDF
 * @param post - 博文对象
 */
export function exportAsPdf(post: Post) {
    const doc = new jsPDF();

    // 设置字体以支持中文（如果需要）
    // 注意：需要提供字体文件，或使用 jspdf-autotable 等插件的内置字体
    // doc.setFont('simhei'); // 示例

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const usableWidth = pageWidth - 2 * margin;

    // 添加标题
    doc.setFontSize(18);
    doc.text(post.title!, pageWidth / 2, 20, { align: 'center' });

    // 添加内容
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(post.content!, usableWidth);
    doc.text(splitContent, margin, 35);

    doc.save(`${post.slug || 'post'}.pdf`);
}