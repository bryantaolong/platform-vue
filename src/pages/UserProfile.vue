<!-- src/pages/UserProfile.vue -->
<template>
  <div class="user-profile-container">
    <el-card class="box-card user-profile-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ userProfile?.username || '用户主页' }}</span>
          <div class="header-actions-right">
            <!-- Back to My Profile Button -->
            <el-button
              v-if="userStore.userInfo && userProfile && userStore.userInfo.id === routeUserId && userProfile.id !== userStore.userInfo.id"
              type="info"
              size="small"
              @click="goToMyProfile"
              style="margin-right: 10px;"
            >
              回到我的
            </el-button>
            <!-- Follow/Unfollow Button -->
            <el-button
              v-if="userStore.userInfo && userProfile && userStore.userInfo.id !== userProfile.id"
              :type="isFollowingUser ? 'danger' : 'primary'"
              @click="toggleFollow"
              :loading="followLoading"
            >
              {{ isFollowingUser ? '取消关注' : '关注' }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="userProfile" class="profile-details">
        <el-descriptions
          class="margin-top"
          :column="1"
          border
        >
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><user /></el-icon>
                用户名
              </div>
            </template>
            {{ userProfile.username }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><message /></el-icon>
                邮箱
              </div>
            </template>
            {{ userProfile.email }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><postcard /></el-icon>
                角色
              </div>
            </template>
            <el-tag
              v-for="role in userProfile.roles.split(',')"
              :key="role"
              size="small"
              type="info"
              style="margin-right: 5px;"
            >
              {{ getRoleDisplayName(role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><calendar /></el-icon>
                注册时间
              </div>
            </template>
            {{ formatDateTime(userProfile.createTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Following and Followers counts for the displayed user -->
        <div class="user-follow-stats">
          <span class="stat-item" @click="handleShowFollowing">
            关注 <span class="count">{{ followingCount }}</span>
          </span>
          <el-divider direction="vertical"></el-divider>
          <span class="stat-item" @click="handleShowFollowers">
            粉丝 <span class="count">{{ followersCount }}</span>
          </span>
        </div>

      </div>
      <div v-else class="empty-state">
        <el-empty description="用户不存在或无法加载。"></el-empty>
      </div>
    </el-card>

    <!-- 关注列表弹窗 -->
    <UserListDialog
      :visible="showFollowingDialog"
      :user-id="routeUserId"
      list-type="following"
      dialog-title="TA 的关注"
      @update:visible="showFollowingDialog = $event"
    />

    <!-- 粉丝列表弹窗 -->
    <UserListDialog
      :visible="showFollowersDialog"
      :user-id="routeUserId"
      list-type="followers"
      dialog-title="TA 的粉丝"
      @update:visible="showFollowersDialog = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter
import { ElMessage } from 'element-plus';
import { User, Message, Postcard, Calendar } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user';
import * as userService from '@/api/user';
import * as userFollowService from '@/api/userFollow'; // Corrected import path
import type { User as UserEntity } from '@/models/entity/User';

// Import the UserListDialog component
import UserListDialog from '@/components/profile/UserListDialog.vue';


const route = useRoute();
const router = useRouter(); // Initialize useRouter
const userStore = useUserStore();

const userProfile = ref<UserEntity | null>(null);
const loading = ref(true);
const routeUserId = ref<number | null>(null); // To store the parsed user ID from the route

// Follow/Unfollow state
const isFollowingUser = ref(false);
const followLoading = ref(false);

// Follower/Following counts
const followingCount = ref(0);
const followersCount = ref(0);

// Dialog visibility for follow lists
const showFollowingDialog = ref(false);
const showFollowersDialog = ref(false);

// Function to format date and time
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

// Function to get display name for roles
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN': return '管理员';
    case 'ROLE_USER': return '普通用户';
    default: return role;
  }
};

// Fetch user profile data
const fetchUserProfile = async (userId: number) => {
  loading.value = true;
  try {
    const res = await userService.getUserById(userId);
    if (res.code === 200 && res.data) {
      userProfile.value = res.data;
      // Fetch follow status and counts only if logged in and not viewing own profile
      if (userStore.userInfo && userStore.userInfo.id !== userProfile.value.id) {
        checkFollowStatus(userProfile.value.id);
      }
      fetchFollowCounts(userProfile.value.id);
    } else {
      userProfile.value = null;
      ElMessage.error(res?.message || '获取用户资料失败！');
    }
  } catch (error: any) {
    console.error('获取用户资料失败:', error);
    userProfile.value = null;
    ElMessage.error('网络错误，无法获取用户资料！');
  } finally {
    loading.value = false;
  }
};

// Check if current user is following this profile's user
const checkFollowStatus = async (targetUserId: number) => {
  if (!userStore.userInfo || !userStore.token) {
    isFollowingUser.value = false;
    return;
  }
  try {
    const res = await userFollowService.isFollowing(targetUserId);
    if (res.code === 200) {
      isFollowingUser.value = res.data;
    } else {
      console.error('检查关注状态失败:', res.message);
      isFollowingUser.value = false;
    }
  } catch (error) {
    console.error('检查关注状态网络错误:', error);
    isFollowingUser.value = false;
  }
};

// Toggle follow/unfollow
const toggleFollow = async () => {
  if (!userStore.userInfo || !userStore.token) {
    ElMessage.warning('请先登录才能进行关注操作！');
    return;
  }
  if (!userProfile.value?.id) {
    ElMessage.error('无法获取目标用户ID。');
    return;
  }

  followLoading.value = true;
  try {
    let res;
    if (isFollowingUser.value) {
      res = await userFollowService.unfollowUser(userProfile.value.id);
    } else {
      res = await userFollowService.followUser(userProfile.value.id);
    }

    if (res.code === 200 && res.data) {
      isFollowingUser.value = !isFollowingUser.value; // Toggle status
      ElMessage.success(isFollowingUser.value ? '关注成功！' : '已取消关注！');
      fetchFollowCounts(userProfile.value.id); // Refresh counts
    } else {
      ElMessage.error(res.message || '操作失败！');
    }
  } catch (error) {
    console.error('关注/取消关注操作失败:', error);
    ElMessage.error('网络错误，操作失败！');
  } finally {
    followLoading.value = false;
  }
};

// Fetch following and followers counts for the displayed user
const fetchFollowCounts = async (userId: number) => {
  try {
    const followingRes = await userFollowService.getFollowingUsers(userId, 1, 1);
    if (followingRes.code === 200 && followingRes.data) {
      followingCount.value = followingRes.data.total;
    }

    const followersRes = await userFollowService.getFollowerUsers(userId, 1, 1);
    if (followersRes.code === 200 && followersRes.data) {
      followersCount.value = followersRes.data.total;
    }
  } catch (error) {
    console.error('获取关注/粉丝数量失败:', error);
  }
};

// Methods to open the user list dialogs
const handleShowFollowing = () => {
  if (!userProfile.value?.id) {
    ElMessage.warning('无法获取用户ID，请刷新页面。');
    return;
  }
  showFollowingDialog.value = true;
};

const handleShowFollowers = () => {
  if (!userProfile.value?.id) {
    ElMessage.warning('无法获取用户ID，请刷新页面。');
    return;
  }
  showFollowersDialog.value = true;
};

// New function to navigate back to current user's profile
const goToMyProfile = () => {
  router.push('/profile');
};


// Watch for route parameter changes (e.g., navigating from /user/1 to /user/2)
watch(() => route.params.id, (newId) => {
  if (newId) {
    routeUserId.value = Number(newId);
    fetchUserProfile(routeUserId.value);
  }
}, { immediate: true }); // immediate: true to fetch data on initial mount

onMounted(() => {
  // Initial fetch is handled by the watch with immediate: true
});
</script>

<style scoped>
.user-profile-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.user-profile-card {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.header-actions-right {
  display: flex;
  align-items: center;
  gap: 10px; /* Adjust spacing between buttons */
}

.profile-details {
  padding: 20px;
}

.cell-item {
  display: flex;
  align-items: center;
}

.cell-item .el-icon {
  margin-right: 5px;
}

.user-follow-stats {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #606266;
}

.stat-item {
  cursor: pointer;
  padding: 0 15px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
}

.stat-item:hover {
  color: #409eff; /* Element Plus primary color */
}

.stat-item .count {
  font-weight: bold;
  color: #303133;
}

.empty-state {
  text-align: center;
  padding: 50px;
  color: #909399;
}
</style>
