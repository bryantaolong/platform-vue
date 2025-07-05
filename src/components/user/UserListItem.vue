<template>
  <div class="user-list-item" @click="goToUserProfile">
    <div class="user-info">
      <el-avatar :src="`https://i.pravatar.cc/40?u=${user.id}`" :size="40" />
      <div class="user-details">
        <div class="user-name">{{ user.username }}</div>
      </div>
    </div>
    <div class="action-area">
      <el-button
          size="small"
          :type="isFollowingState ? 'danger' : 'primary'"
          @click.stop="toggleFollow"
          :loading="loading"
      >
        {{ isFollowingState ? '取消关注' : '关注' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { followUser, unfollowUser, isFollowing } from '@/api/userFollow'
import type { User } from '@/models/entity/User'

const props = defineProps<{
  user: User
}>()

const router = useRouter()
const isFollowingState = ref(false)
const loading = ref(false)

// 判断是否已关注
watchEffect(async () => {
  const res = await isFollowing(props.user.id)
  if (res.code === 200 || res.code === 0) {
    isFollowingState.value = res.data
  }
})

// 跳转用户主页
const goToUserProfile = () => {
  router.push(`/user/${props.user.id}`)
}

// 关注/取消关注
const toggleFollow = async () => {
  loading.value = true
  try {
    const res = isFollowingState.value
        ? await unfollowUser(props.user.id)
        : await followUser(props.user.id)
    if (res.code === 200 || res.code === 0) {
      isFollowingState.value = !isFollowingState.value
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.user-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
  background-color: #ffffff;
  cursor: pointer;
  box-sizing: border-box;
}

.user-list-item:hover {
  background-color: #f9fafb;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: #111827;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-area {
  flex-shrink: 0;
  margin-left: 16px;
  z-index: 1;
  display: flex;
  align-items: center;
}

@media (max-width: 640px) {
  .user-list-item {
    padding: 12px;
  }

  .user-info {
    gap: 8px;
  }

  .action-area {
    margin-left: 8px;
  }
}
</style>
