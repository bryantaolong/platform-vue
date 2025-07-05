<template>
  <el-container>
    <div class="post-container">
      <!-- 文章列表 -->
      <div class="post-list">
        <p v-if="loading" class="no-data">加载中...</p>
        <p v-else-if="!pageData.content.length" class="no-data">暂无文章</p>

        <div
            v-for="post in pageData.content"
            :key="post.id"
            class="post-item"
            @click="handlePostClick(post.id!)"
        >
          <div class="post-main">
            <h2 class="post-title">{{ post.title }}</h2>

            <div class="post-meta">
              <div class="author-info">
                <img
                    src="https://i.pravatar.cc/40"
                    alt="作者头像"
                    class="avatar"
                >
                <span class="author-name">{{ post.authorName || '匿名' }}</span>
              </div>

              <div class="post-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ formatNumber(post.stats.views || 0) }}
                </span>
                <span class="stat-item">
                  <el-icon><StarFilled /></el-icon>
                  {{ formatNumber(post.stats.likes || 0) }}
                </span>
                <span class="date">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>

            <div class="post-tags" v-if="post.tags && post.tags.length">
              <el-tag
                  v-for="tag in post.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="post-thumbnail" v-if="post.featuredImage">
            <img
                :src="post.featuredImage"
                :alt="post.title"
                class="thumbnail-image"
            >
          </div>
        </div>
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
import {ref, reactive, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import {View, StarFilled} from '@element-plus/icons-vue';
import {getAllPublishedPosts} from '@/api/post';
import type {Post} from '@/models/entity/Post';
import type {MongoPageResult} from '@/models/response/MongoPageResult';

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

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
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
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f5f5;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 1rem;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.post-item {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
}

.post-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-summary {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  color: #666;
  font-size: 0.9rem;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 0.85rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-item .el-icon {
  font-size: 14px;
}

.date {
  color: #999;
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
}

.post-thumbnail {
  margin-left: 20px;
  flex-shrink: 0;
}

.thumbnail-image {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 6px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-container {
    padding: 12px;
  }

  .post-item {
    padding: 16px;
    flex-direction: column;
  }

  .post-thumbnail {
    margin-left: 0;
    margin-top: 12px;
    align-self: center;
  }

  .thumbnail-image {
    width: 100%;
    height: 180px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .post-stats {
    gap: 12px;
  }

  .post-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .post-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .post-tags {
    margin-top: 8px;
  }
}
</style>