<template>
  <el-table :data="posts" :loading="loading" border style="width: 100%">
    <el-table-column prop="title" label="标题" />
    <el-table-column prop="authorName" label="作者" width="120" />
    <el-table-column prop="status" label="状态" width="100">
      <template #default="{ row }">
        <el-tag :type="statusTagType(row.status)">
          {{ statusLabel(row.status) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="createdAt" label="创建时间" width="180" />
    <el-table-column label="操作" width="200">
      <template #default="{ row }">
        <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
        <el-button link type="danger" size="small" @click="$emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { Post } from '@/models/entity/Post';

defineProps<{
  posts: Post[];
  loading: boolean;
}>();
defineEmits(['edit', 'delete']);

const statusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return '草稿';
    case 'PUBLISHED': return '已发布';
    case 'ARCHIVED': return '已归档';
    default: return status;
  }
};

const statusTagType = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'success';
    case 'DRAFT': return 'warning';
    case 'ARCHIVED': return 'info';
    default: return '';
  }
};
</script>
