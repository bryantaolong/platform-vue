<template>
  <el-container>
    <div class="post-container">
      <!-- 文章列表 -->
      <div class="post-list">
        <p v-if="loading" class="no-data">加载中...</p>
        <p v-else-if="!pageData.content.length" class="no-data">暂无文章</p>

        <el-card
          v-for="post in pageData.content"
          :key="post.id"
          class="post-card"
          shadow="hover"
          @click="handlePostClick(post.id!)"
        >
          <img
            v-if="post.featuredImage"
            :src="post.featuredImage"
            class="featured-image"
            alt="文章封面图"
          >

          <div class="post-content">
            <h2>{{ post.title }}</h2>

            <div class="post-meta">
              <img
                src="https://i.pravatar.cc/40"
                alt="作者头像"
                class="avatar"
              >
              <span>作者：{{ post.authorName || '匿名' }}</span>
              <span>•</span>
              <span>{{ formatDate(post.createdAt) }}</span>
            </div>

            <div class="post-tags">
              <el-tag
                v-for="tag in post.tags || []"
                :key="tag"
                size="small"
                type="info"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 分页栏 -->
      <div class="pagination-wrapper" v-if="pageData.totalElements > 0">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pageData.totalElements"
          :page-sizes="[5, 10, 20, 50]"
          :page-count="pageData.totalPages"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllPublishedPosts } from '@/api/post';
import type { Post } from '@/models/entity/Post';
import type { MongoPageResult } from '@/models/response/MongoPageResult';

const router = useRouter();

// 分页配置
const pagination = reactive({
  current: 1,  // 前端页码从1开始
  size: 10,
});

// 页面数据
const pageData = ref<MongoPageResult<Post>>({
  content: [],
  totalElements: 0,
  size: pagination.size,
  number: 0,    // 后端页码从0开始
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

// 获取文章数据
const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await getAllPublishedPosts({
      page: pagination.current - 1,  // 转换为后端从0开始的页码
      size: pagination.size,
    });

    if (response.code === 200 && response.data) {
      pageData.value = {
        content: response.data.content || [],
        totalElements: response.data.totalElements || 0,
        size: response.data.pageable?.pageSize || pagination.size,
        number: response.data.pageable?.pageNumber || 0,
        totalPages: response.data.totalPages || 0,
      };

      // 同步前端分页状态
      pagination.current = (response.data.pageable?.pageNumber || 0) + 1;
      pagination.size = response.data.pageable?.pageSize || pagination.size;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    pageData.value.content = [];
  } finally {
    loading.value = false;
  }
};

// 分页大小变化
const handleSizeChange = (newSize: number) => {
  pagination.size = newSize;
  pagination.current = 1;  // 切换每页大小时重置到第一页
  fetchPosts();
};

// 当前页变化
const handleCurrentChange = (newPage: number) => {
  pagination.current = newPage;
  fetchPosts();
};

// 点击文章卡片
const handlePostClick = (postId?: string) => {
  router.push(`/post/${postId}`);
};


// 初始化加载
onMounted(fetchPosts);
</script>

<style scoped>
.post-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.post-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 1rem;
  grid-column: 1 / -1;
}

.post-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.featured-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
}

.post-content {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.post-content h2 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.post-meta .avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 5px;
}

.post-tags {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .post-list {
    grid-template-columns: 1fr;
  }

  .post-content h2 {
    font-size: 1rem;
  }
}
</style>