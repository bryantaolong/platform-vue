<template>
  <div class="my-favorites-container">
    <el-card class="my-favorites-card">
      <template #header>
        <div class="card-header">
          <span>我的收藏</span>
          <el-button link type="primary" @click="router.push('/')">返回主页</el-button>
        </div>
      </template>

      <div v-loading="loadingFavorites" class="favorite-post-list">
        <div v-if="favoritePosts?.length === 0 && !loadingFavorites" class="empty-state">
          <el-empty description="您还没有收藏任何博文"></el-empty>
        </div>
        <el-row :gutter="20">
          <el-col v-for="post in favoritePosts" :key="post.id" :xs="24" :sm="12" :md="8" :lg="6">
            <el-card class="post-card" shadow="hover" @click="goToPostDetail(post.slug)">
              <img v-if="post.featuredImage" :src="post.featuredImage" class="post-card-image" alt="封面图片" />
              <div class="post-card-content">
                <h3 class="post-card-title">{{ post.title }}</h3>
                <div class="post-meta">
                  <span>作者: {{ post.authorName }}</span>
                  <span>发布于: {{ formatDateTime(post.createdAt) }}</span>
                </div>
                <div class="post-tags">
                  <el-tag v-for="tag in post.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
                </div>
                <p class="post-excerpt">{{ getExcerpt(post.content) }}</p>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ post.stats.views }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ post.comments.length }}</span>
                  <span><el-icon><Star /></el-icon> {{ post.stats.likes }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <el-pagination
        v-if="favoritePosts?.length > 0 || totalFavorites > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalFavorites"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
        class="pagination-container"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as postFavoriteService from '@/api/postFavorite.ts';
import type { Post } from '@/models/entity/Post.ts';
import { View, ChatDotRound, Star } from '@element-plus/icons-vue';

const router = useRouter();

const favoritePosts = ref<Post[]>([]);
const loadingFavorites = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalFavorites = ref(0);

const fetchMyFavorites = async () => {
  loadingFavorites.value = true;
  try {
    // getMyFavorites 返回的是一个包含 content, totalElements 的对象
    const res = await postFavoriteService.getMyFavorites({
      page: currentPage.value - 1,
      size: pageSize.value,
      sort: 'createdAt,desc',
    });
    if (res.code === 200 && res.data) {
      // 从 res.data 中提取 content 数组和 totalElements
      favoritePosts.value = res.data.content || [];
      totalFavorites.value = res.data.totalElements || 0;
      currentPage.value = (res.data.number !== undefined ? res.data.number + 1 : 1);
    } else {
      favoritePosts.value = [];
      totalFavorites.value = 0;
      ElMessage.error(res?.message || '获取收藏列表失败！');
    }
  } catch (error: any) {
    console.error('获取收藏列表失败:', error);
    favoritePosts.value = [];
    totalFavorites.value = 0;
    ElMessage.error('网络错误，无法获取收藏列表！');
  } finally {
    loadingFavorites.value = false;
  }
};

const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  fetchMyFavorites();
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  fetchMyFavorites();
};

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const getExcerpt = (content: string, length: number = 100): string => {
  if (!content) return '';
  const strippedContent = content.replace(/(<([^>]+)>)/gi, "");
  if (strippedContent.length <= length) {
    return strippedContent;
  }
  return strippedContent.substring(0, length) + '...';
};

const goToPostDetail = (slug: string) => {
  router.push(`/post/${slug}`);
};

onMounted(() => {
  fetchMyFavorites();
});
</script>

<style scoped>
/* ... (MyFavorites.vue 的原有样式保持不变) ... */

.my-favorites-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.my-favorites-card {
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.favorite-post-list {
  min-height: 300px;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #909399;
}

.post-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.15);
}

.post-card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
}

.post-card-content {
  padding: 15px;
}

.post-card-title {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 10px;
  font-weight: bold;
  color: #303133;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.post-meta span {
  margin-right: 15px;
}

.post-tags .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.post-excerpt {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-top: 10px;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.post-stats {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  gap: 15px;
  margin-top: 10px;
}

.post-stats .el-icon {
  margin-right: 5px;
}

.pagination-container {
  margin-top: 25px;
  justify-content: center;
  display: flex;
}
</style>