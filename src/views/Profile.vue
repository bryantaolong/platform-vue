<template>
  <div class="profile-container">
    <el-container direction="vertical" class="profile-inner">
      <el-header class="profile-header">
        <!-- ✅ 仅当为本人主页时展示完整卡片 -->
        <UserInfoCard
            v-if="user"
            :user="user"
            @update-profile="fetchUserInfo"
            @modify-password="handleModifyPassword"
            :show-edit-buttons="isOwnProfile"
        />
        <!-- ❌ 如果不是本人主页，不展示资料 -->
        <div v-else>
          <el-card>该用户信息不可查看</el-card>
        </div>
      </el-header>

      <el-main class="profile-main">
        <div class="profile-content-card">
          <!-- ✅ 横向菜单 -->
          <el-menu
              mode="horizontal"
              :router="true"
              :default-active="$route.path"
              class="profile-menu"
          >
            <el-menu-item :index="`/user/${userId}/publishes`">发布</el-menu-item>
            <el-menu-item :index="`/user/${userId}/favorites`">收藏</el-menu-item>
            <el-menu-item :index="`/user/${userId}/following`">关注</el-menu-item>
            <el-menu-item :index="`/user/${userId}/followers`">粉丝</el-menu-item>
            <el-menu-item
                v-if="isOwnProfile"
                :index="`/user/${userId}/settings`"
            >
              设置
            </el-menu-item>
          </el-menu>

          <div class="profile-page-view">
            <router-view />
          </div>
        </div>
      </el-main>
    </el-container>

    <!-- 修改密码弹窗 -->
    <ChangePasswordDialog
        :visible="showChangePasswordDialog"
        :user-data="currentOperateUser"
        @update:visible="showChangePasswordDialog = $event"
        @passwordChanged="fetchUserInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user.ts';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import ChangePasswordDialog from '@/components/user/operations/ChangePasswordDialog.vue';
import type { User } from '@/models/entity/User.ts';

const route = useRoute();
const userStore = useUserStore();

const userId = computed(() => Number(route.params.id)); // 当前路径中 :id 参数
const isOwnProfile = computed(() => userStore.userInfo?.id === userId.value);

const user = computed<User | null>(() => {
  return isOwnProfile.value ? userStore.userInfo : null;
});

const showChangePasswordDialog = ref(false);
const currentOperateUser = ref<User | null>(null);

const fetchUserInfo = async () => {
  if (isOwnProfile.value) {
    await userStore.fetchUserInfo();
  }
};

const handleModifyPassword = (user: User) => {
  currentOperateUser.value = { ...user };
  showChangePasswordDialog.value = true;
};

onMounted(() => {
  fetchUserInfo();
});

// 当路由参数 id 变化时，重新拉取信息（仅自己）
watch(() => route.params.id, fetchUserInfo);
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

:deep(.el-container),
:deep(.el-header),
:deep(.el-main),
:deep(.el-aside) {
  overflow: visible;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
