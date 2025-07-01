<!-- src/pages/Profile.vue -->
<template>
  <div class="profile-container">
    <el-card class="box-card profile-card">
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>

      <div v-if="userStore.userInfo" class="profile-details">
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
            {{ userStore.userInfo.username }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><message /></el-icon>
                邮箱
              </div>
            </template>
            {{ userStore.userInfo.email }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon><postcard /></el-icon>
                角色
              </div>
            </template>
            <el-tag
              v-for="role in userStore.userInfo.roles.split(',')"
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
            {{ formatDateTime(userStore.userInfo.createTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- Following and Followers counts -->
        <div class="user-follow-stats">
          <span class="stat-item" @click="handleShowFollowing">
            关注 <span class="count">{{ followingCount }}</span>
          </span>
          <el-divider direction="vertical"></el-divider>
          <span class="stat-item" @click="handleShowFollowers">
            粉丝 <span class="count">{{ followersCount }}</span>
          </span>
        </div>

        <div class="profile-actions">
          <el-button type="primary" @click="showEditProfileDialog = true">编辑资料</el-button>
          <el-button type="info" @click="showChangePasswordDialog = true">修改密码</el-button>
        </div>

      </div>
      <div v-else class="not-logged-in">
        <el-empty description="请登录以查看您的个人信息。"></el-empty>
        <el-button type="primary" @click="goToLogin">前往登录</el-button>
      </div>
    </el-card>

    <!-- 编辑个人资料弹窗 -->
    <EditProfile
      :visible="showEditProfileDialog"
      :initial-username="userStore.userInfo?.username || ''"
      :initial-email="userStore.userInfo?.email || ''"
      @update:visible="showEditProfileDialog = $event"
      @profileUpdated="handleProfileUpdated"
    />

    <!-- 修改密码弹窗 -->
    <ChangePassword
      :visible="showChangePasswordDialog"
      @update:visible="showChangePasswordDialog = $event"
    />

    <!-- 关注列表弹窗 -->
    <UserListDialog
      :visible="showFollowingDialog"
      :user-id="userStore.userInfo?.id"
      list-type="following"
      dialog-title="我的关注"
      @update:visible="showFollowingDialog = $event"
    />

    <!-- 粉丝列表弹窗 -->
    <UserListDialog
      :visible="showFollowersDialog"
      :user-id="userStore.userInfo?.id"
      list-type="followers"
      dialog-title="我的粉丝"
      @update:visible="showFollowersDialog = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import { User, Message, Postcard, Calendar } from '@element-plus/icons-vue';

// 导入现有组件
import EditProfile from '@/components/profile/EditProfile.vue';
import ChangePassword from '@/components/profile/ChangePassword.vue';
// 导入新创建的组件
import UserListDialog from '@/components/profile/UserListDialog.vue';

import * as userFollowService from '@/api/userFollow'; // 导入关注API

const userStore = useUserStore();
const router = useRouter();

// 控制弹窗显示状态
const showEditProfileDialog = ref(false);
const showChangePasswordDialog = ref(false);
const showFollowingDialog = ref(false); // New: Control following list dialog
const showFollowersDialog = ref(false); // New: Control followers list dialog

// New: For displaying counts (initially 0, could be fetched from backend if available)
const followingCount = ref(0);
const followersCount = ref(0);

const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString();
};

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'ROLE_ADMIN': return '管理员';
    case 'ROLE_USER': return '普通用户';
    default: return role;
  }
};

const goToLogin = () => {
  router.push('/login');
};

const handleProfileUpdated = () => {
  // Profile updated, re-fetch counts if they are dynamic
  fetchFollowCounts();
};

// New: Methods to open the user list dialogs
const handleShowFollowing = () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录以查看关注列表！');
    router.push('/login');
    return;
  }
  showFollowingDialog.value = true;
};

const handleShowFollowers = () => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录以查看粉丝列表！');
    router.push('/login');
    return;
  }
  showFollowersDialog.value = true;
};

// New: Function to fetch following and followers counts
const fetchFollowCounts = async () => {
  if (!userStore.userInfo?.id) {
    followingCount.value = 0;
    followersCount.value = 0;
    return;
  }
  try {
    // Fetch a small page (e.g., page 1, size 1) to get total count from backend's Page object
    const followingRes = await userFollowService.getFollowingUsers(userStore.userInfo.id, 1, 1);
    if (followingRes.code === 200 && followingRes.data) {
      followingCount.value = followingRes.data.total;
    }

    const followersRes = await userFollowService.getFollowerUsers(userStore.userInfo.id, 1, 1);
    if (followersRes.code === 200 && followersRes.data) {
      followersCount.value = followersRes.data.total;
    }
  } catch (error) {
    console.error('获取关注/粉丝数量失败:', error);
    // Handle error, maybe set counts to 0 or show a message
  }
};

onMounted(async () => {
  if (!userStore.userInfo && userStore.token) {
    try {
      const res = await userStore.fetchUserInfo();
      if (res.code !== 200 || !userStore.userInfo) {
        ElMessage.warning('未能获取到用户信息，请重新登录。');
        userStore.logout();
        router.push('/login');
      } else {
        // After user info is loaded, fetch follow counts
        fetchFollowCounts();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请检查网络或重新登录。');
      userStore.logout();
      router.push('/login');
    }
  } else if (userStore.userInfo) {
    // If user info is already available, just fetch follow counts
    fetchFollowCounts();
  } else {
    ElMessage.warning('您尚未登录，请先登录以查看个人中心。');
    router.push('/login');
  }
});
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.profile-card {
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
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

.profile-actions {
  margin-top: 30px;
  text-align: center;
}

.profile-actions .el-button {
  margin: 0 10px;
}

.not-logged-in {
  text-align: center;
  padding: 50px;
}
</style>
