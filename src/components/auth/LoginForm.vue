<template>
  <el-card class="login-card">
    <template #header>
      <div class="card-header">
        <span>用户登录</span>
      </div>
    </template>
    <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px" class="login-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">登录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {ElMessage} from 'element-plus';
import type {FormInstance} from 'element-plus';
import {useUserStore} from '@/stores/user';
import router from "@/router";

// 导入 LoginRequest 接口
import type {LoginRequest} from '@/models/request/LoginRequest';

const userStore = useUserStore();
const loading = ref(false);

// 表单数据，使用 LoginRequest 接口定义类型
const loginForm: LoginRequest = reactive({
  username: '',
  password: ''
});

// 表单验证规则
const loginRules = reactive({
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 15, message: '用户名长度在 3 到 15 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur'}
  ]
});

const loginFormRef = ref<FormInstance>();

const submitForm = async () => {
  if (!loginFormRef.value) return;

  loading.value = true;

  try {
    const valid = await loginFormRef.value.validate();
    if (valid) {
      // loginForm 已经是 LoginRequest 类型，可以直接传入
      const res = await userStore.login(loginForm);

      if (res && res.code === 200) {
        ElMessage.success('登录成功！');
        await router.push('/');
      } else {
        ElMessage.error(res?.message || '登录失败，请检查用户名或密码！');
      }
    } else {
      ElMessage.error('请检查表单输入！');
    }
  } catch (error: any) {
    console.error('登录请求失败:', error);
    ElMessage.error(error.message || '网络错误，请稍后重试！');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.resetFields();
};
</script>

<style scoped>
.login-card {
  width: 400px;
  margin: 50px auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.login-form {
  padding: 20px;
}
</style>