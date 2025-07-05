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
              <h2 class="username">{{ user.username }}</h2>

              <div class="stats-section">
                <span class="stat-item" @click="handleViewFollowing">
                  关注 <strong>{{ followingCount }}</strong>
                </span>
                <span class="stat-item" @click="handleViewFollowers">
                  粉丝 <strong>{{ followerCount }}</strong>
                </span>
              </div>
            </div>

            <!-- ✅ 通过 showEditButtons 控制按钮显示 -->
            <div v-if="showEditButtons" class="action-buttons">
              <el-button
                  type="primary"
                  @click="handleUpdate"
                  :loading="loading"
                  class="action-btn primary-btn"
              >
                修改信息
              </el-button>
              <el-button
                  type="info"
                  @click="handleModifyPassword"
                  :loading="loading"
                  class="action-btn secondary-btn"
              >
                修改密码
              </el-button>
            </div>

            <!-- ✅ 非本人主页显示访问提示 -->
            <div v-else class="visitor-info">
              <el-text type="info" size="small">
                <el-icon><View /></el-icon>
                正在查看 {{ user.username }} 的主页
              </el-text>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-card>

    <!-- 编辑用户信息弹窗 -->
    <EditUserDialog
        :visible="showEditUserDialog"
        :user-data="user"
        @update:visible="showEditUserDialog = $event"
        @userUpdated="handleUserUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { View } from '@element-plus/icons-vue'
import router from '@/router'
import EditUserDialog from '@/components/user/operations/EditUserDialog.vue'
import { getFollowingUsers, getFollowerUsers } from '@/api/userFollow'
import type { User } from '@/models/entity/User'

// Props 定义
const props = defineProps<{
  user: User
  showEditButtons?: boolean // ✅ 控制是否显示编辑按钮，默认为 false
}>()

// 设置默认值
const showEditButtons = computed(() => props.showEditButtons ?? false)

// 事件定义
const emit = defineEmits(['update-profile', 'modify-password'])

// 响应式数据
const loading = ref(false)
const followingCount = ref(0)
const followerCount = ref(0)
const showEditUserDialog = ref(false)

// 组件挂载时获取关注和粉丝数据
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
    // 对于访问他人主页的情况，可能没有权限获取详细数据，不显示错误提示
    if (showEditButtons.value) {
      ElMessage.error('加载关注/粉丝失败')
    }
  }
})

// 处理修改用户信息
const handleUpdate = () => {
  showEditUserDialog.value = true
}

// 处理用户信息更新成功
const handleUserUpdated = () => {
  emit('update-profile')
  ElMessage.success('更新成功')
}

// 处理修改密码
const handleModifyPassword = () => {
  loading.value = true
  try {
    emit('modify-password', props.user)
    ElMessage.success('请在弹窗中修改密码！')
  } finally {
    loading.value = false
  }
}

// 查看关注列表
const handleViewFollowing = () => {
  router.push(`/user/${props.user.id}/following`)
}

// 查看粉丝列表
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
  overflow: visible;
}

.user-avatar {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.user-info-main {
  padding: 0;
  overflow: visible;
}

.user-info-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 150px;
  overflow: visible;
}

.user-basic-info {
  flex: 1;
  overflow: visible;
}

.username {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: visible;
}

.stats-section {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  overflow: visible;
}

.stat-item {
  color: #4a5568;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  white-space: nowrap;
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
  overflow: visible;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.secondary-btn {
  background: linear-gradient(135deg, #4fd1c7 0%, #06b6d4 100%);
  color: white;
}

.secondary-btn:hover {
  background: linear-gradient(135deg, #3fc5ba 0%, #0891b2 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 209, 199, 0.4);
}

/* ✅ 访问者信息样式 */
.visitor-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.visitor-info .el-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

/* 隐藏 Element Plus 容器的滚动条 */
:deep(.el-container) {
  overflow: visible;
}

:deep(.el-aside) {
  overflow: visible;
}

:deep(.el-main) {
  overflow: visible;
  padding: 0;
}

/* 响应式设计 */
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