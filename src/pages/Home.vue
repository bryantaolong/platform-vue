<template>
  <div class="home-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>欢迎来到主页！</span>
          <el-button type="danger" @click="handleLogout">登出</el-button>
        </div>
      </template>

      <div v-if="userStore.userInfo" class="user-info">
        <p><strong>用户名:</strong> {{ userStore.userInfo.username }}</p>
        <p><strong>邮箱:</strong> {{ userStore.userInfo.email }}</p>
        <p><strong>用户ID:</strong> {{ userStore.userInfo.id }}</p>
        <p><strong>角色:</strong> {{ userStore.userInfo.roles }}</p>
        <p><strong>注册时间:</strong> {{ formatDateTime(userStore.userInfo.createTime) }}</p>
      </div>
      <div v-else>
        <p>用户信息加载中或未登录...</p>
        <el-button type="primary" @click="goToLogin">前往登录</el-button>
      </div>

      <el-divider></el-divider>

      <div class="navigation-links">
        <h3>快速导航</h3>
        <el-space wrap>
          <el-button
            v-if="isAdmin"
            type="info"
            @click="goToDashboard"
          >
            前往仪表盘 (管理员)
          </el-button>
          <el-button type="success" @click="goToSettings">前往设置 (示例)</el-button>
        </el-space>
      </div>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'; // 导入 computed
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();

// 计算属性：判断用户是否为管理员
// userStore.userInfo.roles 是一个逗号分隔的字符串，例如 "ROLE_USER,ROLE_ADMIN"
const isAdmin = computed(() => {
  if (userStore.userInfo && userStore.userInfo.roles) {
    // 将角色字符串按逗号分割成数组，并检查是否包含 "ROLE_ADMIN"
    return userStore.userInfo.roles.split(',').includes('ROLE_ADMIN');
  }
  return false; // 如果 userInfo 不存在或 roles 为空，则不是管理员
});


// 生命周期钩子：组件挂载后，尝试获取用户信息
onMounted(async () => {
  if (!userStore.userInfo && userStore.token) {
    try {
      const res = await userStore.fetchUserInfo(); // fetchUserInfo 返回 ApiResponse<User>
      if (res.code !== 200 || !userStore.userInfo) { // 根据后端返回的code判断，或者userStore.userInfo是否被设置
        ElMessage.warning('未能获取到用户信息或认证失败，请重新登录。');
        handleLogout();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请检查网络或重新登录。');
      handleLogout();
    }
  } else if (!userStore.token) {
    ElMessage.info('您尚未登录，请先登录。');
    goToLogin();
  }
});

// 处理登出逻辑
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    userStore.logout(); // 调用 Pinia store 的登出方法
    ElMessage.success('已成功退出登录！');
    router.push('/login'); // 登出后跳转到登录页
  } catch (error) {
    if (error !== 'cancel') {
      console.error('登出失败:', error);
      ElMessage.error('登出失败，请重试。');
    }
  }
};

// 格式化日期时间的辅助函数
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  // 可根据需要使用 Intl.DateTimeFormat 或第三方库进行更复杂的格式化
  return date.toLocaleString();
};

// 导航函数
const goToLogin = () => {
  router.push('/login');
};

const goToDashboard = () => {
  // 在这里进行跳转前再次检查权限，虽然v-if已经控制了，但这是额外的保障
  if (isAdmin.value) {
    ElMessage.info('正在前往仪表盘页面...');
    router.push('/dashboard'); // 跳转到仪表盘页面
  } else {
    ElMessage.warning('您没有权限访问仪表盘。');
    // 也可以选择跳转到其他无权限提示页面
    // router.push('/no-permission');
  }
};

const goToSettings = () => {
  ElMessage.info('跳转到设置页面 (此页面尚未创建)');
  // router.push('/settings');
};
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 调整为 flex-start 让卡片在顶部 */
  min-height: calc(100vh - 60px); /* 假设头部高度，让内容撑开页面 */
  padding: 20px;
  background-color: #f0f2f5;
}

.box-card {
  width: 600px;
  max-width: 90%;
  margin-top: 50px; /* 顶部留一些空间 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.user-info p {
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 1.5;
}

.navigation-links {
  margin-top: 20px;
}

.navigation-links h3 {
  margin-bottom: 15px;
  color: #303133;
}
</style>