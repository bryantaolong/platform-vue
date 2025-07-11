<template>
  <el-dialog v-model="visible" title="编辑博文" width="800px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="标签">
        <el-select v-model="form.tags" multiple placeholder="请选择标签">
          <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
        </el-select>
      </el-form-item>

      <el-form-item label="内容">
        <el-input v-model="form.content" type="textarea" rows="10" placeholder="支持 Markdown 格式" />
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="form.status" placeholder="请选择状态">
          <el-option label="草稿" value="DRAFT" />
          <el-option label="已发布" value="PUBLISHED" />
          <el-option label="已归档" value="ARCHIVED" />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { updatePost } from '@/api/post';
import { ElMessage } from 'element-plus';
import type { Post } from '@/models/entity/Post';

const props = defineProps<{
  post: Post;
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'saved']);

const visible = ref(props.visible);
const form = ref<Post>({
  ...props.post,
  tags: props.post.tags ?? [],
  status: props.post.status ?? 'DRAFT',
  stats: props.post.stats ?? { views: 0, likes: 0, shares: 0 },
  comments: props.post.comments ?? [],
});

const allTags = ref(['前端', '后端', 'AI', '算法', '面试']); // 可从后端接口拉取

// 同步 prop 更新
watch(() => props.visible, (val) => {
  visible.value = val;
});
watch(() => props.post, (newPost) => {
  form.value = {
    ...newPost,
    tags: newPost.tags ?? [],
    status: newPost.status ?? 'DRAFT',
    stats: newPost.stats ?? { views: 0, likes: 0, shares: 0 },
    comments: newPost.comments ?? [],
  };
});

const save = async () => {
  if (!form.value.id) {
    ElMessage.error('文章 ID 不可为空');
    return;
  }

  const res = await updatePost(form.value.id, form.value);
  if (res.code === 200) {
    ElMessage.success('保存成功');
    emit('update:visible', false);
    emit('saved');
  } else {
    ElMessage.error(res.message || '保存失败');
  }
};
</script>

