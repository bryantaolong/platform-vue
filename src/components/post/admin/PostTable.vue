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
        <el-dropdown size="small" @command="command => $emit('export', row, command)">
          <el-button link type="primary" size="small">
            导出<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="txt">TXT</el-dropdown-item>
              <el-dropdown-item command="md">Markdown</el-dropdown-item>
              <el-dropdown-item command="docx">Word (DOCX)</el-dropdown-item>
              <el-dropdown-item command="pdf">PDF</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { Post } from '@/models/entity/Post';
import { ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon, ElButton, ElTag } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';

defineProps<{
  posts: Post[];
  loading: boolean;
}>();
// 更新 defineEmits，添加 'export' 事件
defineEmits(['edit', 'delete', 'export']);

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