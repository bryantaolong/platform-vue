<template>
  <div class="post-detail-container" v-loading="loadingPost">
    <el-card class="post-detail-card">
      <template #header>
        <div class="card-header">
          <el-button link type="primary" @click="router.back()">返回</el-button>
          <span>{{ post?.title || '加载中...' }}</span>
          <div class="actions">
            <el-button
              v-if="userStore.token"
              :type="isFavorite ? 'warning' : 'primary'"
              :icon="isFavorite ? StarFilled : Star"
              circle
              @click="toggleFavorite"
              :loading="favoriteLoading"
            ></el-button>
            <el-button
              v-if="canEditOrDeletePost"
              type="primary"
              :icon="Edit"
              circle
              @click="handleEditPost"
            ></el-button>
            <el-button
              v-if="canEditOrDeletePost"
              type="danger"
              :icon="Delete"
              circle
              @click="handleDeletePost"
            ></el-button>
          </div>
        </div>
      </template>

      <div v-if="post" class="post-content-area">
        <div class="post-meta-detail">
          <span>作者: {{ post.authorName }}</span>
          <span>发布于: {{ formatDateTime(post.createdAt) }}</span>
          <span><el-icon><View /></el-icon> {{ post.stats.views }} 阅读</span>
        </div>
        <div class="post-tags-detail">
          <el-tag v-for="tag in post.tags" :key="tag" size="large" type="info" effect="plain">{{ tag }}</el-tag>
        </div>
        <img v-if="post.featuredImage" :src="post.featuredImage" class="post-detail-image" alt="博文封面" />

        <div class="post-full-content" v-html="post.content"></div>

        <el-divider>评论</el-divider>

        <div class="comments-section">
          <div v-if="userStore.token" class="add-comment">
            <el-input
              v-model="newCommentContent"
              type="textarea"
              :rows="3"
              placeholder="发表你的评论..."
              maxlength="500"
              show-word-limit
            ></el-input>
            <el-button type="primary" :loading="commentLoading" @click="addComment" style="margin-top: 10px;">发表评论</el-button>
          </div>
          <div v-else class="login-to-comment">
            <p>登录后即可发表评论。</p>
            <el-button type="primary" @click="router.push('/login')">去登录</el-button>
          </div>

          <el-empty v-if="post.comments.length === 0 && !commentLoading" description="暂无评论"></el-empty>
          <div v-else class="comment-list">
            <el-card v-for="comment in sortedComments" :key="comment.id" class="comment-item">
              <div class="comment-header">
                <span class="comment-author">{{ comment.authorName }}</span>
                <span class="comment-time">{{ formatDateTime(comment.createdAt) }}</span>
                <el-button
                  v-if="canDeleteComment(comment)"
                  type="danger"
                  link
                  size="small"
                  @click="handleDeleteComment(comment.id)"
                >删除</el-button>
              </div>
              <p class="comment-content">{{ comment.content }}</p>
            </el-card>
          </div>
        </div>

        <el-divider>推荐博文</el-divider>
        <div v-loading="loadingRecommendations" class="recommendations-section">
          <el-empty v-if="recommendations.length === 0 && !loadingRecommendations" description="暂无推荐博文"></el-empty>
          <div v-else>
            <el-row :gutter="20">
              <el-col v-for="recPost in recommendations" :key="recPost.id" :span="8">
                <el-card shadow="hover" class="recommendation-card" @click="goToPostDetail(recPost.slug)">
                  <h4>{{ recPost.title }}</h4>
                  <p class="rec-excerpt">{{ getExcerpt(recPost.content, 50) }}</p>
                  <div class="rec-meta">
                    <span>{{ recPost.authorName }}</span>
                    <span><el-icon><View /></el-icon> {{ recPost.stats.views }}</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
      <div v-else-if="!loadingPost && !post" class="empty-state">
        <el-empty description="博文未找到或已删除"></el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import * as postService from '@/api/post';
import * as postFavoriteService from '@/api/postFavorite';
import type { Post } from '@/models/entity/Post';
import type { Comment } from '@/models/entity/Comment';
// 导入 Element Plus 图标
import { View, Star, StarFilled, Edit, Delete } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const post = ref<Post | null>(null);
const loadingPost = ref(false);
const newCommentContent = ref('');
const commentLoading = ref(false);
const recommendations = ref<Post[]>([]);
const loadingRecommendations = ref(false);
const isFavorite = ref(false); // 是否已收藏
const favoriteLoading = ref(false); // 收藏操作加载状态

// 计算属性：当前用户是否是管理员
const isAdmin = computed(() => {
  return userStore.userInfo?.roles?.split(',').includes('ROLE_ADMIN') || false;
});

// 计算属性：当前用户是否是博文作者或者管理员
const canEditOrDeletePost = computed(() => {
  if (!userStore.token || !post.value || !userStore.userInfo) {
    return false;
  }
  return isAdmin.value || (userStore.userInfo.id === post.value.authorId);
});

const goToPostDetail = (slug: string) => { // 确保它在这里，是顶层声明
  router.push(`/post/${slug}`);
};

// 计算属性：判断是否能删除评论
const canDeleteComment = (comment: Comment) => {
  if (!userStore.token || !userStore.userInfo) {
    return false;
  }
  // 管理员或评论作者可以删除
  return isAdmin.value || (userStore.userInfo.id === comment.authorId);
};

// 计算属性：按时间倒序排序评论
const sortedComments = computed(() => {
  if (!post.value || !post.value.comments) return [];
  // 创建副本再排序，避免直接修改原始数组引起警告
  return [...post.value.comments].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
});

// 获取博文详情
const fetchPostDetail = async (slug: string) => {
  loadingPost.value = true;
  try {
    const res = await postService.getPostBySlug(slug);
    if (res.code === 200 && res.data) {
      post.value = res.data;
      checkPostFavoriteStatus(); // 获取博文详情后检查收藏状态
      fetchRecommendations(post.value.id); // 获取推荐博文
    } else {
      post.value = null;
      ElMessage.error(res?.message || '获取博文详情失败！');
    }
  } catch (error: any) {
    console.error('获取博文详情失败:', error);
    post.value = null;
    ElMessage.error('网络错误或博文不存在！');
  } finally {
    loadingPost.value = false;
  }
};

// 检查博文收藏状态
const checkPostFavoriteStatus = async () => {
  if (!userStore.token || !post.value) { // 未登录或没有博文ID则不检查
    isFavorite.value = false;
    return;
  }
  favoriteLoading.value = true;
  try {
    const res = await postFavoriteService.checkFavorite(post.value.id);
    if (res.code === 200 && typeof res.data === 'boolean') {
      isFavorite.value = res.data;
    } else {
      isFavorite.value = false; // 默认未收藏
      console.error('检查收藏状态失败:', res?.message || '未知错误');
    }
  } catch (error) {
    isFavorite.value = false;
    console.error('检查收藏状态请求失败:', error);
  } finally {
    favoriteLoading.value = false;
  }
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!userStore.token) {
    ElMessage.warning('请登录后进行收藏操作！');
    router.push('/login');
    return;
  }
  if (!post.value) return;

  favoriteLoading.value = true;
  try {
    let res;
    if (isFavorite.value) {
      // 取消收藏 (根据postId)
      res = await postFavoriteService.deleteFavoriteByPostId(post.value.id);
      if (res.code === 200) {
        ElMessage.success('已取消收藏！');
        isFavorite.value = false;
      } else {
        ElMessage.error(res?.message || '取消收藏失败！');
      }
    } else {
      // 添加收藏
      res = await postFavoriteService.addFavorite({ postId: post.value.id });
      if (res.code === 201) { // 后端返回 201 Created
        ElMessage.success('收藏成功！');
        isFavorite.value = true;
      } else {
        ElMessage.error(res?.message || '收藏失败！');
      }
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error);
    ElMessage.error('网络错误或操作失败！');
  } finally {
    favoriteLoading.value = false;
  }
};


// 添加评论
const addComment = async () => {
  if (!userStore.token) {
    ElMessage.warning('请登录后发表评论！');
    router.push('/login');
    return;
  }
  if (!post.value?.id || !newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空！');
    return;
  }
  commentLoading.value = true;
  try {
    const res = await postService.addComment(post.value.id, newCommentContent.value.trim());
    if (res.code === 200 && res.data) {
      post.value.comments = res.data.comments; // 更新评论列表
      newCommentContent.value = ''; // 清空评论输入框
      ElMessage.success('评论发表成功！');
    } else {
      ElMessage.error(res?.message || '发表评论失败！');
    }
  } catch (error: any) {
    console.error('发表评论失败:', error);
    ElMessage.error('网络错误或发表评论失败！');
  } finally {
    commentLoading.value = false;
  }
};

// 删除评论
const handleDeleteComment = async (commentId: string) => {
  if (!post.value?.id) return;

  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const res = await postService.deleteComment(post.value.id, commentId);
    if (res.code === 200 && res.data) {
      post.value.comments = res.data.comments; // 更新评论列表
      ElMessage.success('评论删除成功！');
    } else {
      ElMessage.error(res?.message || '删除评论失败！');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除评论失败:', error);
      ElMessage.error('网络错误或删除失败！');
    }
  }
};

// 获取推荐博文
const fetchRecommendations = async (currentPostId: string) => {
  loadingRecommendations.value = true;
  try {
    const res = await postService.getRecommendations(currentPostId, 3); // 获取3篇推荐
    if (res.code === 200 && res.data) {
      recommendations.value = res.data;
    } else {
      recommendations.value = [];
    }
  } catch (error: any) {
    console.error('获取推荐博文失败:', error);
    recommendations.value = [];
  } finally {
    loadingRecommendations.value = false;
  }
};

// 处理编辑博文
const handleEditPost = () => {
  if (post.value?.slug) {
    ElMessage.info('编辑博文功能待实现，将跳转到编辑页面...');
    // router.push(`/post/edit/${post.value.id}`); // 假设有编辑页面
  }
};

// 处理删除博文
const handleDeletePost = async () => {
  if (!post.value?.id) return;
  try {
    await ElMessageBox.confirm(`确定要删除博文 "${post.value.title}" 吗？此操作不可逆！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    const res = await postService.deletePost(post.value.id);
    if (res.code === 204) { // HTTP 204 No Content
      ElMessage.success('博文删除成功！');
      router.push('/'); // 删除后返回主页
    } else {
      ElMessage.error(res?.message || '删除博文失败！');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除博文失败:', error);
      ElMessage.error('网络错误或删除失败！');
    }
  }
};


// 格式化日期时间的辅助函数
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

// 获取文章摘要（与Home.vue中相同）
const getExcerpt = (content: string, length: number = 100): string => {
  if (!content) return '';
  const strippedContent = content.replace(/(<([^>]+)>)/gi, "");
  if (strippedContent.length <= length) {
    return strippedContent;
  }
  return strippedContent.substring(0, length) + '...';
};

// 监听路由参数变化，重新获取博文详情
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug && typeof newSlug === 'string') {
      fetchPostDetail(newSlug);
    }
  },
  { immediate: true } // 组件初次加载时也执行
);

// 组件挂载时检查用户信息（确保 isAdmin 和 canEditOrDeletePost 计算属性正确）
onMounted(() => {
  if (!userStore.userInfo && userStore.token) {
    userStore.fetchUserInfo().catch(err => console.error("Failed to fetch user info on PostDetail:", err));
  }
});
</script>

<style scoped>
.post-detail-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.post-detail-card {
  width: 100%;
  max-width: 960px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.card-header span {
  flex-grow: 1; /* 标题占据中间位置 */
  text-align: center;
  margin: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-header .actions {
  display: flex;
  gap: 10px;
}

.post-content-area {
  padding: 20px;
}

.post-meta-detail {
  font-size: 14px;
  color: #909399;
  margin-bottom: 15px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.post-tags-detail {
  margin-bottom: 20px;
}
.post-tags-detail .el-tag {
  margin-right: 8px;
}

.post-detail-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 25px;
}

.post-full-content {
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 针对 v-html 渲染的内容，确保样式美观 */
.post-full-content :deep(p) {
  margin-bottom: 1em;
}
.post-full-content :deep(h1),
.post-full-content :deep(h2),
.post-full-content :deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  font-weight: bold;
}
.post-full-content :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 15px auto;
  border-radius: 4px;
}
.post-full-content :deep(pre),
.post-full-content :deep(code) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  overflow-x: auto;
}
.post-full-content :deep(blockquote) {
  border-left: 4px solid #ccc;
  padding-left: 15px;
  margin: 1em 0;
  color: #666;
  font-style: italic;
}


.comments-section {
  margin-top: 30px;
}

.add-comment {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.login-to-comment {
  text-align: center;
  padding: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  color: #909399;
}
.login-to-comment p {
  margin-bottom: 15px;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  margin-bottom: 15px;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.05);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #303133;
}

.comment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #606266;
}

.recommendations-section {
  margin-top: 30px;
}

.recommendation-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.recommendation-card h4 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: bold;
  color: #303133;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rec-excerpt {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.rec-meta {
  font-size: 12px;
  color: #c0c4cc;
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.rec-meta .el-icon {
  margin-right: 3px;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #909399;
}
</style>