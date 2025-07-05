<template>
  <div class="my-posts-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!pageData.content.length" class="no-data">暂无收藏内容</div>

    <div class="post-list">
      <div
          v-for="post in pageData.content"
          :key="post.id"
          class="post-item"
          @click="handlePostClick(post.id!)"
      >
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-meta">发布于 {{ formatDate(post.createdAt) }}</p>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="pageData.totalElements > 0">
      <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pageData.totalElements"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {getMyFavoritePosts} from '@/api/postFavorite';
import type { Post } from '@/models/entity/Post';
import type { MongoPageResult } from '@/models/response/MongoPageResult.ts';
import router from '@/router';

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
});

// 页面数据
const pageData = ref<MongoPageResult<Post>>({
  content: [],
  totalElements: 0,
  size: pagination.size,
  number: 0,
  totalPages: 0,
});

const loading = ref(false);

// 日期格式化
const formatDate = (date?: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 获取收藏列表
const fetchMyFavorites = async () => {
  loading.value = true;
  try {
    const res = await getMyFavoritePosts({
      page: pagination.current - 1,
      size: pagination.size,
    });

    if (res.code === 200 && res.data) {
      pageData.value = res.data;
      pagination.current = res.data.number + 1;
      pagination.size = res.data.size;
    }
  } finally {
    loading.value = false;
  }
};

// 分页切换
const handleCurrentChange = (page: number) => {
  pagination.current = page;
  fetchMyFavorites();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  fetchMyFavorites();
};

// 点击跳转
const handlePostClick = (postId?: string) => {
  router.push(`/post/${postId}`);
};

onMounted(fetchMyFavorites);
</script>

<style scoped>
.my-posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading,
.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-item {
  position: relative;
  padding: 16px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.post-title {
  font-size: 1.1rem;
  font-weight: bold;
}

.post-meta {
  font-size: 0.9rem;
  color: #666;
  margin-top: 8px;
}

.post-actions {
  position: absolute;
  right: 16px;
  top: 16px;
}

.pagination-wrapper {
  margin-top: 30px;
  text-align: center;
}
</style>