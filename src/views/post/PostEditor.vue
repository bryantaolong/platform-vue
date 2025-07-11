<template>
  <div class="edit-post">
    <el-form :model="post" label-width="80px">
      <!-- 标题输入 -->
      <el-form-item label="标题">
        <el-input
            v-model="post.title"
            placeholder="请输入标题"
            class="title-input"
        />
      </el-form-item>

      <!-- 标签选择 -->
      <el-form-item label="标签">
        <el-select v-model="post.tags" multiple placeholder="请选择标签">
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>

      <!-- Markdown 编辑 + 预览 -->
      <el-form-item label="内容">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
                type="textarea"
                v-model="post.content"
                :rows="20"
                placeholder="请输入 Markdown 内容..."
                resize="none"
            />
          </el-col>
          <el-col :span="12">
            <div class="preview" v-html="compiledMarkdown" />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button @click="submitPost('DRAFT')">保存草稿</el-button>
        <el-button type="primary" @click="submitPost('PUBLISHED')">发布</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import { useRoute, useRouter } from 'vue-router'
import { createPost, updatePost, getPostById } from '@/api/post.ts'
import type { Post, PostStatus } from '@/models/entity/Post.ts'

const route = useRoute()
const router = useRouter()

const post = ref<Post>({
  title: '',
  content: '',
  tags: [],
  status: 'DRAFT',
  stats: { views: 0, likes: 0, shares: 0 },
  comments: []
})

// 示例：你可以用接口拉取所有标签
const allTags = ref(['前端', '后端', 'AI'])

const compiledMarkdown = computed(() => marked.parse(post.value.content ?? ''))

// 如果 URL 中有 id，说明是编辑已有文章
const postId = route.query.id as string | undefined

if (postId) {
  getPostById(postId).then(res => {
    if (res.code === 200 && res.data) {
      post.value = res.data
    } else {
      ElMessage.error('获取博文失败')
    }
  })
}

function submitPost(status: PostStatus) {
  post.value.status = status

  if (!post.value.title || !post.value.content) {
    ElMessage.warning('标题和内容不能为空！')
    return
  }

  if (postId) {
    updatePost(postId, post.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('更新成功！')
        router.push(`/post/${res.data.slug || res.data.id}`)
      }
    })
  } else {
    createPost(post.value).then(res => {
      if (res.code === 200) {
        ElMessage.success('发布成功！')
        router.push(`/post/${res.data.slug || res.data.id}`)
      }
    })
  }
}
</script>

<style scoped>
.edit-post {
  padding: 32px 40px;
  background-color: #fff;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;

  /* 使整个编辑区高度占满视口高度，减去上下 padding */
  min-height: calc(100vh - 64px);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
}

/* 标题输入大字号 */
.title-input .el-input__inner {
  font-size: 24px;
  font-weight: bold;
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 0;
  padding-left: 0;
  box-shadow: none;
}

/* 标签选择 */
.edit-post .el-select {
  width: 100%;
}

/* 内容区域：左右并排两栏，撑满剩余高度 */
.edit-post .el-row {
  margin-top: 10px;
  flex: 1; /* 占满剩余高度 */
  display: flex !important; /* 覆盖 element-plus el-row 默认样式，变为flex布局 */
  gap: 20px;
}

/* 左右两栏各占 50% 宽度且撑满高度 */
.edit-post .el-col {
  flex: 1; /* 两列平分宽度 */
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 编辑框区域，textarea撑满父容器高度 */
.edit-post textarea {
  flex: 1;
  font-family: Consolas, monospace;
  font-size: 14px;
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
  resize: none;
}

/* 预览区域撑满高度，允许内部滚动 */
.preview {
  flex: 1;
  background-color: #fff;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
}

/* 按钮对齐右侧 */
.el-form-item:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
