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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { ElMessage } from 'element-plus';
import { User, Message, Postcard, Calendar } from '@element-plus/icons-vue';

// 导入新创建的组件
import EditProfile from '@/components/profile/EditProfile.vue';
import ChangePassword from '@/components/profile/ChangePassword.vue';

const userStore = useUserStore();
const router = useRouter();

// 控制弹窗显示状态
const showEditProfileDialog = ref(false);
const showChangePasswordDialog = ref(false);

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

// 处理个人资料更新后的回调
const handleProfileUpdated = () => {
  // 资料更新后，可以重新加载用户信息，或者刷新当前页面数据
  // 由于 EditProfile 组件内部已经调用了 userStore.fetchUserInfo()，这里可以不做额外操作
  // 如果 Profile 页面有其他依赖 userInfo 的数据，可能需要手动刷新
  // ElMessage.success('个人资料已刷新！'); // 示例消息
};

onMounted(() => {
  if (!userStore.userInfo && userStore.token) {
    userStore.fetchUserInfo().then(res => {
      if (res.code !== 200 || !userStore.userInfo) {
        ElMessage.warning('未能获取到用户信息，请重新登录。');
        userStore.logout();
        router.push('/login');
      }
    }).catch(error => {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请检查网络或重新登录。');
      userStore.logout();
      router.push('/login');
    });
  } else if (!userStore.token) {
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
