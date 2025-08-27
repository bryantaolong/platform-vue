<template>
  <div class="user-info-card-wrapper">
    <el-card class="user-info-card">
      <el-container>
        <el-aside width="170px" class="avatar-section">
          <el-avatar
              :src="`https://i.pravatar.cc/40?u=${user.id}`"
              shape="square"
              :size="150"
              class="user-avatar"
          />
        </el-aside>

        <el-main class="user-info-main">
          <div class="user-info-content">
            <div class="user-basic-info">
              <h2 class="username">{{ user.username || '匿名用户' }}</h2>

              <div class="stats-section">
                <span class="stat-item" @click="handleViewFollowing">
                  关注 <strong>{{ followingCount }}</strong>
                </span>
                <span class="stat-item" @click="handleViewFollowers">
                  粉丝 <strong>{{ followerCount }}</strong>
                </span>
              </div>
            </div>

            <div v-if="isOwner" class="action-buttons">
              <el-button
                  type="primary"
                  @click="handleUpdate"
                  :loading="loading"
                  class="action-btn btn-update"
              >
                修改信息
              </el-button>
              <el-button
                  type="info"
                  @click="handleModifyPassword"
                  :loading="loading"
                  class="action-btn btn-password"
              >
                修改密码
              </el-button>
            </div>

            <div v-else class="action-buttons">
              <div class="visitor-info">
                <el-text type="info" size="small">
                  <el-icon>
                    <View/>
                  </el-icon>
                  正在查看 <strong>{{ user.username }}</strong> 的主页
                </el-text>
              </div>
              <el-button
                  :type="isFollowingState ? 'danger' : 'primary'"
                  @click.stop="toggleFollow"
                  :loading="loading"
                  class="action-btn btn-update"
              >
                {{ isFollowingState ? '取消关注' : '关注' }}
              </el-button>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-card>

    <!-- 编辑用户信息弹窗 -->
    <EditUserProfileDialog
        :visible="showEditUserDialog"
        :user-data="user"
        @update:visible="showEditUserDialog = $event"
        @userUpdated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed, watchEffect} from 'vue'
import {ElMessage} from 'element-plus'
import router from '@/router'
import EditUserProfileDialog from '@/components/user/operations/EditUserProfileDialog.vue'
import {getFollowingUsers, getFollowerUsers, unfollowUser, followUser, isFollowing} from '@/api/userFollow'
import type {User} from '@/models/entity/User'
import {View} from "@element-plus/icons-vue";

// Props
const props = defineProps<{
  user: User
  showEditButtons?: boolean
}>()

const isOwner = computed(() => props.showEditButtons ?? false)
const emit = defineEmits(['update-profile', 'modify-password'])

// 状态
const loading = ref(false)
const followingCount = ref(0)
const followerCount = ref(0)
const showEditUserDialog = ref(false)
const isFollowingState = ref(false)

watchEffect(async () => {
  const res = await isFollowing(props.user.id)
  if (res.code === 200 || res.code === 0) {
    isFollowingState.value = res.data
  }
})

// 方法
const toggleFollow = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = isFollowingState.value
        ? await unfollowUser(props.user.id)
        : await followUser(props.user.id)

    if (res.code === 200 || res.code === 0) {
      isFollowingState.value = !isFollowingState.value
      ElMessage.success(isFollowingState.value ? '关注成功' : '已取消关注')
    }
  } catch (e) {
    ElMessage.error('操作失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const [followingRes, followerRes] = await Promise.all([
      getFollowingUsers(props.user.id),
      getFollowerUsers(props.user.id),
    ])

    if (followingRes.code === 200) {
      followingCount.value = followingRes.data.total
    }
    if (followerRes.code === 200) {
      followerCount.value = followerRes.data.total
    }
  } catch (e) {
    console.error('加载关注/粉丝数据失败:', e)
    if (isOwner.value) {
      ElMessage.error('加载关注/粉丝失败')
    }
  }
})

const handleUpdate = () => {
  showEditUserDialog.value = true
}

const handleUserUpdated = () => {
  emit('update-profile')
  ElMessage.success('更新成功')
}

const handleModifyPassword = () => {
  loading.value = true
  try {
    emit('modify-password', props.user)
    ElMessage.success('请在弹窗中修改密码！')
  } finally {
    loading.value = false
  }
}

const handleViewFollowing = () => {
  router.push(`/user/${props.user.id}/following`)
}

const handleViewFollowers = () => {
  router.push(`/user/${props.user.id}/followers`)
}
</script>

<style scoped>
.user-info-card-wrapper {
  width: 100%;
  overflow: visible;
}

.user-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  overflow: visible;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.user-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.user-info-card :deep(.el-card__body) {
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: visible;
}

.avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 20px;
}

.user-avatar {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.user-info-main {
  padding: 0;
}

.user-info-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150px;
}

.user-basic-info {
  flex: 1;
}

.username {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-item {
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
}

.stat-item:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

.stat-item strong {
  color: #667eea;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
}

.action-btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
  min-width: 100px;
}

.btn-update {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-update:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a4190);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.btn-password {
  background: linear-gradient(135deg, #4fd1c7, #06b6d4);
  color: white;
}

.btn-password:hover {
  background: linear-gradient(135deg, #3fc5ba, #0891b2);
  box-shadow: 0 4px 12px rgba(79, 209, 199, 0.4);
  transform: translateY(-1px);
}

/* ✅ 更新后的 visitor-info */
.visitor-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 42px;
  padding: 0 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  gap: 8px;
  line-height: 1;
}

.visitor-info .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.visitor-info .el-icon {
  font-size: 16px;
}

:deep(.el-container),
:deep(.el-aside),
:deep(.el-main) {
  overflow: visible;
  padding: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .user-info-card :deep(.el-card__body) {
    padding: 20px;
  }

  .avatar-section {
    width: 120px !important;
    padding-right: 15px;
  }

  .user-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .username {
    font-size: 22px;
  }

  .stats-section {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .visitor-info {
    justify-content: center;
    text-align: center;
  }
}
</style>
