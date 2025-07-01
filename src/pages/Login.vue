<template>
  <div class="login-page-container">
    <LoginForm />
    <div class="register-link-container">
      还没有账号？
      <el-button link type="primary" @click="goToRegister">注册新账号</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/auth/LoginForm.vue';
import { useRouter } from 'vue-router'; // 导入 useRouter

const router = useRouter(); // 获取路由实例

const goToRegister = () => {
  router.push('/register'); // 跳转到注册页面
};
</script>

<style scoped>
.login-page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.register-link-container {
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}
</style>