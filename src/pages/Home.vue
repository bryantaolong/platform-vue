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
          <el-button type="info" @click="goToDashboard">前往仪表盘 (示例)</el-button>
          <el-button type="success" @click="goToSettings">前往设置 (示例)</el-button>
        </el-space>
      </div>

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const router = useRouter();

// 生命周期钩子：组件挂载后，尝试获取用户信息
onMounted(async () => {
  // 只有当 Pinia store 中没有用户信息时才去请求
  if (!userStore.userInfo && userStore.token) {
    try {
      await userStore.fetchUserInfo();
      if (!userStore.userInfo) {
        ElMessage.warning('未能获取到用户信息，请重新登录。');
        // 如果获取失败且有token，可能是token失效，考虑登出
        handleLogout();
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ElMessage.error('获取用户信息失败，请检查网络或重新登录。');
      // 捕获错误后，也尝试登出，防止用户停留在错误状态
      handleLogout();
    }
  } else if (!userStore.token) {
    // 如果连token都没有，直接跳转到登录页
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
    // 用户取消登出，或登出过程中出现其他错误
    if (error !== 'cancel') { // 排除用户点击取消的情况
      console.error('登出失败:', error);
      ElMessage.error('登出失败，请重试。');
    }
  }
};

// 格式化日期时间的辅助函数 (可选)
const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleString(); // 或使用更复杂的日期格式化库如 dayjs, momentjs
};

// 导航函数
const goToLogin = () => {
  router.push('/login');
};

const goToDashboard = () => {
  ElMessage.info('跳转到仪表盘页面 (此页面尚未创建)');
  // router.push('/dashboard'); // 实际跳转时取消注释
};

const goToSettings = () => {
  ElMessage.info('跳转到设置页面 (此页面尚未创建)');
  // router.push('/settings'); // 实际跳转时取消注释
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