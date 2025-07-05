<template>
  <el-tooltip :content="isFavorited ? '取消收藏' : '收藏'" placement="top">
    <el-button
        :icon="isFavorited ? StarFilled : Star"
        :type="isFavorited ? 'warning' : 'default'"
        circle
        @click="toggleFavorite"
        :loading="loading"
    />
  </el-tooltip>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Star, StarFilled } from '@element-plus/icons-vue';
import {
  checkPostFavorite,
  addPostFavorite,
  deletePostFavorite,
} from '@/api/postFavorite';

interface Props {
  postId: string;
}

const props = defineProps<Props>();
const isFavorited = ref(false);
const loading = ref(false);

const fetchFavoriteStatus = async () => {
  try {
    const res = await checkPostFavorite(props.postId);
    if (res.code === 200) {
      isFavorited.value = res.data;
    }
  } catch (err) {
    console.error('检查收藏状态失败', err);
  }
};

const toggleFavorite = async () => {
  loading.value = true;
  try {
    if (isFavorited.value) {
      const res = await deletePostFavorite(props.postId);
      if (res.code === 200) isFavorited.value = false;
    } else {
      const res = await addPostFavorite({ postId: props.postId });
      if (res.code === 200) isFavorited.value = true;
    }
  } catch (err) {
    console.error('切换收藏失败', err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchFavoriteStatus);

// 当postId发生变更时自动重新获取状态
watch(() => props.postId, fetchFavoriteStatus);
</script>
