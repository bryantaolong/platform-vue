<template>
  <div class="profile-container">
    <el-container direction="vertical" class="profile-inner">
      <el-header class="profile-header">
        <!-- ✅ 统一使用 UserInfoCard 组件，通过 show-edit-buttons 控制权限 -->
        <UserInfoCard
            v-if="displayUser"
            :user="displayUser"
            @update-profile="fetchUserInfo"
            @modify-password="handleModifyPassword"
            :show-edit-buttons="isOwnProfile"
        />
        <!-- 加载状态 -->
        <div v-else-if="loading">
          <el-card>
            <el-skeleton :rows="3" animated />
          </el-card>
        </div>
        <!-- 错误状态 -->
        <div v-else>
          <el-card>该用户信息不存在或无法访问</el-card>
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
            <el-menu-item :index="`/user/${userId}/publications`">发布</el-menu-item>
            <el-menu-item :index="`/user/${userId}/favorites`">收藏</el-menu-item>
            <el-menu-item :index="`/user/${userId}/following`">关注</el-menu-item>
            <el-menu-item :index="`/user/${userId}/followers`">粉丝</el-menu-item>
            <!-- ✅ 只有本人主页才显示设置菜单 -->
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
// 导入获取其他用户信息的API（需要您根据实际情况实现）
import { getUserById } from '@/api/user.ts';

const route = useRoute();
const userStore = useUserStore();

// 计算属性
const userId = computed(() => Number(route.params.id));
const isOwnProfile = computed(() => userStore.userInfo?.id === userId.value);

// 响应式数据
const targetUser = ref<User | null>(null); // 目标用户信息（访问他人主页时）
const loading = ref(false);
const showChangePasswordDialog = ref(false);
const currentOperateUser = ref<User | null>(null);

// 统一的用户信息显示逻辑
const displayUser = computed<User | null>(() => {
  if (isOwnProfile.value) {
    return userStore.userInfo; // 本人信息
  } else {
    return targetUser.value; // 他人信息
  }
});

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true;

  try {
    if (isOwnProfile.value) {
      // 如果是本人主页，获取当前用户信息
      await userStore.fetchUserInfo();
    } else {
      // 如果不是本人主页，获取其他用户的公开信息
      try {
        const response = await getUserById(userId.value);
        if (response.code === 200) {
          targetUser.value = response.data;
        } else {
          targetUser.value = null;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        targetUser.value = null;
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理修改密码
const handleModifyPassword = (user: User) => {
  currentOperateUser.value = { ...user };
  showChangePasswordDialog.value = true;
};

// 生命周期和监听器
onMounted(() => {
  fetchUserInfo();
});

// 当路由参数 id 变化时，重新拉取信息
watch(() => route.params.id, () => {
  // 重置目标用户信息
  targetUser.value = null;
  fetchUserInfo();
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