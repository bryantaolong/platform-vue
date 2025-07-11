<template>
  <el-form :inline="true" :model="searchForm" class="search-form">
    <el-form-item label="标题">
      <el-input v-model="searchForm.title" placeholder="输入标题关键词" />
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
        <el-option label="草稿" value="DRAFT" />
        <el-option label="已发布" value="PUBLISHED" />
        <el-option label="已归档" value="ARCHIVED" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="$emit('search')">搜索</el-button>
      <el-button @click="$emit('reset')">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
defineProps<{ searchForm: any }>();
defineEmits(['search', 'reset']);
</script>

<style scoped>
.search-form {
  margin-bottom: 16px;
}
</style>
