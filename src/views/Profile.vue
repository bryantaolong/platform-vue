<template>
  <div class="profile-container">
    <el-container direction="vertical" class="profile-inner">
      <el-header class="profile-header">
        <UserInfoCard
          v-if="user"
          :user="user"
          @update-profile="fetchUserInfo"
          @modify-password="handleModifyPassword"
        />
      </el-header>

      <el-main class="profile-main">
        <!-- 白色卡片背景包住菜单和内容 -->
        <div class="profile-content-card">
          <!-- 横向菜单 -->
          <el-menu
            mode="horizontal"
            :router="true"
            :default-active="$route.path"
            class="profile-menu"
          >
            <el-menu-item index="/user/publishes">我的发布</el-menu-item>
            <el-menu-item index="/user/favorites">我的收藏</el-menu-item>
            <el-menu-item index="/user/settings">设置</el-menu-item>
          </el-menu>

          <!-- 子内容展示区域 -->
          <div class="profile-page-view">
            <router-view />
          </div>
        </div>
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <ChangePasswordDialog
      :visible="showChangePasswordDialog"
      :user-data="currentOperateUser"
      @update:visible="showChangePasswordDialog = $event"
      @passwordChanged="fetchUserInfo"
    />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {useUserStore} from '@/stores/user.ts';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import ChangePasswordDialog from '@/components/user/operations/ChangePasswordDialog.vue';
import type {User} from '@/models/entity/User.ts';

const userStore = useUserStore();
const user = ref<User | null>(userStore.userInfo);
const showChangePasswordDialog = ref(false);
const currentOperateUser = ref<User | null>(null);

const fetchUserInfo = async () => {
  await userStore.fetchUserInfo();
  user.value = userStore.userInfo;
};

const handleModifyPassword = (user: User) => {
  currentOperateUser.value = {...user};
  showChangePasswordDialog.value = true;
};

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    window.location.href = '/login';
  } else if (!user.value) {
    await fetchUserInfo();
  }
});
</script>

<style scoped>
.profile-container {
  width: 100%;
  background-color: #f5f7fa;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.profile-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.profile-header {
  width: 100%;
  height: auto;
  padding: 0;
  margin-bottom: 20px;
}

.profile-main {
  width: 100%;
  padding: 0;
  overflow: visible;
}

.profile-content-card {
  width: 100%;
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  box-sizing: border-box;
}

.profile-menu {
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.profile-page-view {
  padding-top: 10px;
  overflow: visible;
}

/* 隐藏 Element Plus 组件的滚动条 */
:deep(.el-container) {
  overflow: visible;
}

:deep(.el-header) {
  overflow: visible;
  height: auto;
}

:deep(.el-main) {
  overflow: visible;
  padding: 0;
}

:deep(.el-aside) {
  overflow: visible;
}

/* 确保全局不出现横向滚动条 */
* {
  box-sizing: border-box;
}
</style>