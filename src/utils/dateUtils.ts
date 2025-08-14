// 格式化日期
export const formatDate = (date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};