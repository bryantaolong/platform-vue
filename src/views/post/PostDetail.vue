<template>
  <el-container class="post-detail-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!post" class="not-found">文章不存在</div>

    <div v-else class="post-wrapper">
      <!-- 文章主体 -->
      <article class="post-content">
        <h1 class="title">
          {{ post.title }}
          <PostFavoriteButton :post-id="post.id"/>
        </h1>

        <div class="meta">
          <img src="https://i.pravatar.cc/40" alt="作者头像" class="avatar"/>
          <span>{{ post.authorName || '匿名' }}</span>
          <span>•</span>
          <span>{{ formatDate(post.createdAt) }}</span>
        </div>

        <img
            v-if="post.featuredImage"
            :src="post.featuredImage"
            class="featured-image"
            alt="封面图"
        />

        <div class="body" v-html="post.content"></div>

        <div class="tags">
          <el-tag
              v-for="tag in post.tags || []"
              :key="tag"
              type="info"
              size="small"
          >
            {{ tag }}
          </el-tag>
        </div>
      </article>

      <!-- 评论区 -->
      <section class="comments-section">
        <h2 class="comments-title">评论</h2>

        <div v-if="post.comments?.length" class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <img src="https://i.pravatar.cc/40?u=" class="comment-avatar"/>
              <div class="comment-meta">
                <strong>{{ comment.authorName || '匿名用户' }}</strong>
                <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
              </div>
            </div>
            <div class="comment-content" v-html="comment.content"></div>
          </div>
        </div>

        <div v-else class="no-comments">暂无评论</div>
      </section>
    </div>
  </el-container>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import {getPostById} from '@/api/post';
import type {Post} from '@/models/entity/Post';
import PostFavoriteButton from "@/components/post/PostFavoriteButton.vue";

const route = useRoute();
const post = ref<Post | null>(null);
const loading = ref(true);

const formatDate = (date?: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchPost = async () => {
  const id = route.params.id as string;

  try {
    const res = await getPostById(id);
    if (res.code === 200 && res.data) {
      post.value = res.data;
    } else {
      post.value = null;
    }
  } catch (err) {
    console.error('获取文章详情失败', err);
    post.value = null;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchPost);
</script>

<style scoped>
.post-detail-container {
  max-width: 900px; /* 调整为略窄的宽度 */
  margin: 0 auto;
  padding: 30px 20px; /* 调整左右padding */
  background-color: #f8f9fa;
  min-height: 100vh;
}

.loading,
.not-found {
  text-align: center;
  font-size: 1.2rem;
  color: #999;
  background-color: #fff;
  padding: 60px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  width: 100%;
  box-sizing: border-box;
}

.post-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%; /* 确保wrapper占满容器宽度 */
}

/* 文章主体样式 */
.post-content {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
}

.title {
  font-size: 2rem;
  margin-bottom: 16px;
  color: #1a1a1a;
  line-height: 1.3;
}

.meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.featured-image {
  width: 100%;
  height: auto;
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.body {
  line-height: 1.8;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.05rem;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 评论区样式 */
.comments-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  width: 100%;
  box-sizing: border-box;
}

.comments-title {
  font-size: 1.4rem;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 12px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #dee2e6;
  transition: all 0.2s ease;
}

.comment:hover {
  background-color: #f1f3f4;
  border-left-color: #6c757d;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-meta strong {
  color: #2c3e50;
  font-size: 0.95rem;
}

.comment-date {
  font-size: 0.8rem;
  color: #8a8a8a;
}

.comment-content {
  color: #495057;
  line-height: 1.6;
  font-size: 0.95rem;
}

.no-comments {
  color: #8a8a8a;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .post-detail-container {
    max-width: 100%;
    padding: 20px 15px;
  }

  .post-content {
    padding: 24px;
  }

  .comments-section {
    padding: 24px;
  }

  .title {
    font-size: 1.6rem;
  }
}
</style>