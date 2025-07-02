<template>
  <div class="home-wrapper">
    <header class="top-navbar">
      <div class="navbar-left">
        <router-link to="/" class="platform-title-link">
          <span class="platform-title">Platform</span>
        </router-link>
        <nav class="main-nav">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/hot-posts" class="nav-item">热榜</router-link>
          <router-link to="/friends" class="nav-item">好友</router-link>
          <router-link to="/coming-soon" class="nav-item">待开发</router-link>
        </nav>
      </div>
      <div class="navbar-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索博文标题或内容"
          style="width: 250px;"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch">查找更多</el-button>
          </template>
        </el-input>

        <el-button type="primary" @click="showAIChatBox = true" style="margin-left: 10px;">
          AI 聊天
        </el-button>

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
    </header>

    <div class="home-container">
      <el-card class="box-card home-main-content">
        <div class="horizontal-tabs">
          <el-button
            v-for="tab in tabs"
            :key="tab.value"
            :type="activeTab === tab.value ? 'primary' : 'info'"
            link
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
          </el-button>
        </div>
        <el-divider class="tabs-divider"></el-divider>

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

      <AIChatBox
        :visible="showAIChatBox"
        @update:visible="showAIChatBox = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import * as postService from '@/api/post';
import type { Post } from '@/models/entity/Post';
import { Search, View, ChatDotRound, Star, ArrowDown } from '@element-plus/icons-vue';

// Import the new AI Chat Box component
import AIChatBox from '@/components/AIChatBox.vue';

const userStore = useUserStore();
const router = useRouter();

const posts = ref<Post[]>([]);
const loadingPosts = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalPosts = ref(0);
const searchQuery = ref('');
const activeTab = ref('recommended'); // Default active tab

// State to control AI Chat Box visibility
const showAIChatBox = ref(false);

const tabs = [
  { label: '推荐', value: 'recommended' },
  { label: '榜单', value: 'ranking' },
  { label: '帖子', value: 'posts' },
  { label: '百科', value: 'encyclopedia' },
];

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
      // You would add logic here to fetch posts based on `activeTab.value`
      // For now, it defaults to fetching all published posts as before.
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

// Watch activeTab to refetch posts when tab changes
watch(activeTab, () => {
  // You would typically reset pagination and fetch new data based on the activeTab
  currentPage.value = 1;
  fetchPosts();
});
</script>

<style scoped>
.home-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.top-navbar {
  background-color: #2c3e50; /* Dark blue background from image */
  color: white;
  padding: 15px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

/* New style for the router-link wrapping the platform title */
.platform-title-link {
  text-decoration: none; /* Remove underline */
  color: inherit; /* Inherit color from parent */
}

.platform-title {
  font-size: 24px;
  font-weight: bold;
  cursor: pointer; /* Indicate it's clickable */
  color: white; /* Ensure color is white */
  transition: color 0.3s ease; /* Smooth transition */
}

.platform-title:hover {
  color: #409eff; /* Element Plus primary blue for hover */
}

.main-nav {
  display: flex;
  gap: 25px;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 16px;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #409eff; /* Element Plus primary blue for hover */
}

.nav-item.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409eff; /* Active indicator */
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* Adjust search input to match image style */
.navbar-right .el-input {
  --el-input-bg-color: rgba(255, 255, 255, 0.15); /* Slightly transparent background */
  --el-input-border-color: rgba(255, 255, 255, 0.2);
  --el-input-text-color: white;
  --el-input-placeholder-color: rgba(255, 255, 255, 0.7);
  border-radius: 20px; /* Rounded corners */
  overflow: hidden; /* Ensure append button is within rounded corners */
}

.navbar-right .el-input .el-input__inner {
  padding-left: 15px;
}

.navbar-right .el-input .el-input-group__append {
  background-color: #409eff; /* Blue button */
  border-color: #409eff;
  color: white;
  border-radius: 0 20px 20px 0;
}

/* Adjust AI Chat Button */
.navbar-right .el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
  border-radius: 20px;
}

.navbar-right .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}


.user-dropdown {
  margin-left: 10px;
}

.user-greeting {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: bold;
  color: white; /* Changed to white for navbar */
}

.user-greeting:hover {
  color: #409eff;
}

.home-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  flex-grow: 1; /* Allows it to take remaining vertical space */
}

.home-main-content {
  width: 100%;
  max-width: 1200px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px; /* Add padding for content inside the card */
}

/* Horizontal Tabs Styles */
.horizontal-tabs {
  display: flex;
  justify-content: flex-start; /* Align tabs to the left */
  margin-bottom: 10px; /* Space between tabs and divider */
}

.horizontal-tabs .el-button {
  font-size: 16px;
  font-weight: bold;
  color: #606266; /* Default tab color */
  padding: 10px 15px;
  margin-right: 20px; /* Space between tabs */
  background: none;
  border: none;
  position: relative;
}

.horizontal-tabs .el-button.is-link {
  --el-button-text-color: var(--el-text-color-regular); /* Override link button color */
}

.horizontal-tabs .el-button.el-button--primary {
  color: #409eff; /* Active tab color */
}

.horizontal-tabs .el-button.el-button--primary::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 70%; /* Shorter underline */
  height: 3px; /* Thicker underline */
  background-color: #409eff; /* Underline color */
  border-radius: 2px;
}

.tabs-divider {
  margin-top: 0px; /* Remove extra margin */
  margin-bottom: 20px;
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