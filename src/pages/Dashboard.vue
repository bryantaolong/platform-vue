<template>
  <el-container class="dashboard-layout-container">
    <el-container class="dashboard-content-container">
      <el-aside width="200px" class="dashboard-aside">
        <el-menu
          router
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          @select="handleMenuSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/dashboard/overview">
            <el-icon><Monitor /></el-icon>
            <span>仪表盘概览</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/user-management">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>返回主页</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="dashboard-main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
// 导入 Element Plus 图标
import { Monitor, User, HomeFilled, Goods } from '@element-plus/icons-vue';

const userStore = useUserStore();
const router = useRouter();
const route = useRoute(); // 获取当前路由信息

// 根据当前路由路径设置默认激活的菜单项
const activeMenu = ref(route.path);

// 监听路由变化，更新激活菜单
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  }
);

const handleMenuSelect = (index: string) => {
  // 当菜单项的 index 和路由路径一致时，router="true" 会自动导航
  // 如果需要额外逻辑，可以在这里添加
  console.log('Selected menu item:', index);
};

// 可以在这里添加全局的登出按钮（如果头部存在的话）
// const handleLogout = async () => {
//   try {
//     await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
//       confirmButtonText: '确定',
//       cancelButtonText: '取消',
//       type: 'warning',
//     });
//     userStore.logout();
//     ElMessage.success('已成功退出登录！');
//     router.push('/login');
//   } catch (error) {
//     if (error !== 'cancel') {
//       console.error('登出失败:', error);
//       ElMessage.error('登出失败，请重试。');
//     }
//   }
// };

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.dashboard-layout-container {
  height: 100vh; /* 使容器占满整个视口高度 */
  background-color: #f0f2f5;
}

/* 如果需要头部 */
/* .dashboard-header {
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
} */

.dashboard-content-container {
  flex: 1; /* 让内容容器填充剩余空间 */
}

.dashboard-aside {
  background-color: #545c64; /* 侧边栏背景色 */
  color: #fff;
  overflow-x: hidden; /* 防止菜单项文字过长溢出 */
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.dashboard-main {
  padding: 20px;
  background-color: #fff; /* 主内容区背景色 */
  overflow-y: auto; /* 允许内容区域滚动 */
}
</style>