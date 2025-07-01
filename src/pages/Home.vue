<template>
  <div class="home-container">
    <el-card class="box-card home-main-content">
      <template #header>
        <div class="card-header">
          <span>最新博文</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索博文标题或内容"
              style="width: 200px; margin-right: 10px;"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch"></el-button>
              </template>
            </el-input>

            <el-dropdown v-if="userStore.userInfo" trigger="hover" class="user-dropdown">
              <span class="el-dropdown-link user-greeting">
                欢迎，{{ userStore.userInfo.username }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToDashboard" v-if="isAdmin">后台管理</el-dropdown-item>
                  <el-dropdown-item @click="goToMyFavorites" v-if="userStore.token">我的收藏</el-dropdown-item>
                  <el-dropdown-item @click="goToPersonalCenter">个人中心</el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" @click="goToLogin" v-else>前往登录</el-button>
          </div>
        </div>
      </template>

      <el-divider></el-divider>

      <div v-loading="loadingPosts" class="post-list">
        <div v-if="posts?.length === 0 && !loadingPosts" class="empty-state">
          <el-empty description="暂无博文"></el-empty>
        </div>
        <el-row :gutter="20">
          <el-col v-for="post in posts" :key="post.id" :xs="24" :sm="12" :md="8" :lg="6">
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
        v-if="posts?.length > 0 || totalPosts > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalPosts"
        @size-change="handlePageSizeChange"
        @current-change="handleCurrentPageChange"
        class="pagination-container"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import * as postService from '@/api/post';
import type { Post } from '@/models/entity/Post';
import { Search, View, ChatDotRound, Star, ArrowDown } from '@element-plus/icons-vue'; // Import ArrowDown icon

const userStore = useUserStore();
const router = useRouter();

const posts = ref<Post[]>([]);
const loadingPosts = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPosts = ref(0);
const searchQuery = ref('');

const isAdmin = computed(() => {
  if (userStore.userInfo && userStore.userInfo.roles) {
    return userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');
  }
  return false;
});

const fetchPosts = async (query?: string) => {
  loadingPosts.value = true;
  try {
    let res;
    if (query) {
      res = await postService.searchPosts(query);
      if (res.code === 200 && res.data) {
        posts.value = res.data;
        totalPosts.value = res.data.length;
        currentPage.value = 1;
      } else {
        posts.value = [];
        totalPosts.value = 0;
        ElMessage.error(res?.message || '搜索博文失败！');
      }
    } else {
      res = await postService.getAllPublishedPosts({
        page: currentPage.value - 1,
        size: pageSize.value,
        sortBy: 'createdAt',
        sortDir: 'DESC',
      });
      if (res.code === 200 && res.data) {
        posts.value = res.data.content || [];
        totalPosts.value = res.data.totalElements || 0;
        currentPage.value = (res.data.number !== undefined ? res.data.number + 1 : 1);
      } else {
        posts.value = [];
        totalPosts.value = 0;
        ElMessage.error(res?.message || '获取博文列表失败！');
      }
    }
  } catch (error: any) {
    console.error('获取博文列表失败:', error);
    posts.value = [];
    totalPosts.value = 0;
    ElMessage.error('网络错误，无法获取博文！');
  } finally {
    loadingPosts.value = false;
  }
};

const handlePageSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPosts();
};

const handleCurrentPageChange = (val: number) => {
  currentPage.value = val;
  fetchPosts();
};

const handleSearch = () => {
  fetchPosts(searchQuery.value);
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    userStore.logout();
    ElMessage.success('已成功退出登录！');
    router.push('/login');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('登出失败:', error);
      ElMessage.error('登出失败，请重试。');
    }
  }
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

const goToLogin = () => {
  router.push('/login');
};

const goToDashboard = () => {
  if (isAdmin.value) {
    router.push('/dashboard');
  } else {
    ElMessage.warning('您没有权限访问仪表盘。');
  }
};

const goToPostDetail = (slug: string) => {
  router.push(`/post/${slug}`);
};

const goToMyFavorites = () => {
  if (!userStore.token) {
      ElMessage.warning('请先登录以查看收藏！');
      router.push('/login');
      return;
  }
  router.push('/my-favorites');
};

const goToPersonalCenter = () => {
  if (!userStore.token) {
      ElMessage.warning('请先登录以查看个人中心！');
      router.push('/login');
      return;
  }
  router.push('/profile');
};

onMounted(async () => {
  if (!userStore.userInfo && userStore.token) {
    try {
      const res = await userStore.fetchUserInfo();
      if (res.code !== 200 || !userStore.userInfo) {
        ElMessage.warning('未能获取到用户信息，请重新登录。');
        handleLogout();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请检查网络或重新登录。');
      handleLogout();
    }
  }

  fetchPosts();
});

watch(searchQuery, (newVal) => {
  if (newVal === '') {
    fetchPosts();
  }
});
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.home-main-content {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* Add gap for spacing between elements */
}

/* New styles for user dropdown */
.user-dropdown {
  margin-left: 10px; /* Adjust as needed */
}

.user-greeting {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #409eff; /* Element Plus primary color */
}

.el-icon--right {
  margin-left: 5px;
}
/* End new styles */

.user-info-summary {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-list {
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