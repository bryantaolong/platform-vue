<template>
  <div class="my-posts-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!pageData.content.length" class="no-data">暂无发布文章</div>

    <div class="post-list">
      <div
          v-for="post in pageData.content"
          :key="post.id"
          class="post-item"
          @click="handlePostClick(post.id!)"
      >
        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-meta">
          发布于 {{ formatDate(post.createdAt) }}
        </p>
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
import { getPostsByAuthorId } from '@/api/post';
import { useUserStore } from '@/stores/user'; // 假设你用 pinia 管理用户
import type { Post } from '@/models/entity/Post';
import type { MongoPageResult } from '@/models/response/MongoPageResult';
import router from "@/router";

const userStore = useUserStore();
const authorId = userStore.userInfo?.id; // 从 store 中获取当前用户 ID

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

// 格式化日期
const formatDate = (date?: Date | string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 加载我的博文
const fetchMyPosts = async () => {
  if (!authorId) return;

  loading.value = true;
  try {
    const res = await getPostsByAuthorId(authorId, {
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

const handleCurrentChange = (page: number) => {
  pagination.current = page;
  fetchMyPosts();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  fetchMyPosts();
};

// 点击文章卡片
const handlePostClick = (postId?: string) => {
  router.push(`/post/${postId}`);
};

onMounted(fetchMyPosts);
</script>

<style scoped>
.my-posts-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
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

.pagination-wrapper {
  margin-top: 30px;
  text-align: center;
}
</style>
