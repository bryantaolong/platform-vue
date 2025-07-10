<template>
  <el-container class="post-detail-container">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!post" class="not-found">文章不存在</div>

    <div v-else class="post-wrapper">
      <!-- 文章主体 -->
      <article class="post-content">
        <h1 class="title">
          {{ post.title }}
          <PostFavoriteButton :post-id="post.id!" />
          <el-button
              v-if="userStore.userInfo?.username === post.authorName"
              type="text"
              size="small"
              @click="goToEditor"
              class="edit-button"
          >
            <el-icon><edit /></el-icon> 编辑
          </el-button>
        </h1>

        <div class="meta">
          <img
              src="https://i.pravatar.cc/40"
              alt="作者头像"
              class="author-avatar"
              @click="handleClickAuthorAvatar()"
          />
          <span @click="handleClickAuthorAvatar" class="author-name">{{ post.authorName || '匿名' }}</span>
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
          <el-tag v-for="tag in post.tags || []" :key="tag" type="info" size="small">
            {{ tag }}
          </el-tag>
        </div>
      </article>

      <!-- 评论区 -->
      <section class="comments-section">
        <h2 class="comments-title">评论</h2>

        <!-- 发布评论表单 -->
        <div class="comment-form">
          <el-input
              v-model="newCommentContent"
              type="textarea"
              placeholder="说点什么吧..."
              :autosize="{ minRows: 3, maxRows: 6 }"
              class="comment-textarea"
          />
          <div class="form-actions">
            <el-button type="primary" @click="handleSubmitComment" :loading="submitting">
              发布评论
            </el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div v-if="post.comments?.length" class="comments-list">
          <div v-for="comment in post.comments" :key="comment.id" class="comment">
            <div class="comment-header">
              <img src="https://i.pravatar.cc/40?u=" class="comment-avatar" alt="评论者头像" />
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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostById, addComment } from '@/api/post'
import type { Post } from '@/models/entity/Post'
import type { Comment } from '@/models/entity/Comment'
import PostFavoriteButton from '@/components/post/PostFavoriteButton.vue'
import { ElMessage } from 'element-plus'
import { getUserByUsername } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { Edit } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref<Post | null>(null)
const loading = ref(true)
const newCommentContent = ref('')
const submitting = ref(false)

/**
 * 格式化日期为中文格式
 */
const formatDate = (date?: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 获取博文详情
 */
const fetchPost = async () => {
  const id = route.params.id as string

  try {
    const res = await getPostById(id)
    if (res.code === 200 && res.data) {
      post.value = res.data
    } else {
      post.value = null
    }
  } catch (err) {
    console.error('获取文章详情失败', err)
    post.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 点击作者头像，跳转作者主页
 */
const handleClickAuthorAvatar = async () => {
  if (!post.value?.authorName) return

  try {
    const res = await getUserByUsername(post.value.authorName)
    if (res.code === 200 && res.data) {
      router.push(`/user/${res.data.id}/publications`)
    } else {
      console.error('获取用户信息失败')
    }
  } catch (err) {
    console.error('获取用户信息出错', err)
  }
}

/**
 * 提交评论
 */
const handleSubmitComment = async () => {
  if (!newCommentContent.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  if (!post.value?.id) {
    ElMessage.error('文章ID不可用')
    return
  }

  submitting.value = true

  try {
    const res = await addComment(post.value.id, {
      content: newCommentContent.value
    } as Comment)

    if (res.code === 200) {
      ElMessage.success('评论发布成功')
      newCommentContent.value = ''
      await fetchPost()
    }
  } catch (err) {
    ElMessage.error('评论提交失败')
  } finally {
    submitting.value = false
  }
}

/**
 * 点击“编辑”按钮跳转到编辑器
 */
const goToEditor = () => {
  if (post.value?.id) {
    router.push(`/editor?id=${post.value.id}`)
  }
}

onMounted(fetchPost)
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
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
  width: 100%;
}

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
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-button {
  font-size: 14px;
  color: #409eff;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
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

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
}

.author-name {
  cursor: pointer;
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

.comment-form {
  margin-bottom: 24px;
}

.comment-textarea {
  width: 100%;
  margin-bottom: 12px;
}

.form-actions {
  text-align: right;
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
