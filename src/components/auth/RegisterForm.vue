<template>
  <el-card class="register-card">
    <template #header>
      <div class="card-header">
        <span>用户注册</span>
      </div>
    </template>
    <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="80px"
             class="register-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input type="password" v-model="registerForm.confirmPassword" placeholder="请再次输入密码"
                  show-password></el-input>
      </el-form-item>
      <el-form-item label="电话号码" prop="phone">
        <el-input v-model="registerForm.phone" placeholder="请输入电话号码"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm" :loading="loading">注册</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button link type="primary" @click="goToLogin">已有账号？去登录</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {ElMessage} from 'element-plus';
import type {FormInstance} from 'element-plus';
import {useRouter} from 'vue-router';
import {useUserStore} from '@/stores/user'; // 导入 Pinia store

// 导入 RegisterRequest 接口
import type {RegisterRequest} from '@/models/request/auth/RegisterRequest.ts';

const userStore = useUserStore();
const router = useRouter();
const loading = ref(false);

// 表单数据，使用 RegisterRequest 接口定义类型 (这里需要额外一个 confirmPassword 字段)
interface RegisterFormModel extends RegisterRequest {
  confirmPassword?: string; // 确认密码，只在前端用于校验
}

const registerForm: RegisterFormModel = reactive({
  username: '',
  password: '',
  phone: '',
  email: '',
  confirmPassword: '' // 初始化确认密码字段
});

// 自定义密码确认验证规则
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致!'));
  } else {
    callback();
  }
};

// 表单验证规则
const registerRules = reactive({
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 15, message: '用户名长度在 3 到 15 个字符', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur'}
  ],
  confirmPassword: [
    {required: true, validator: validateConfirmPassword, trigger: 'blur'}
  ],
  phone: [
    {required: false, message: '请输入电话号码', trigger: 'blur'},
    {type: 'phone', message: '请输入正确的电话号码格式', trigger: ['blur', 'change']}
  ],
  email: [
    {required: false, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change']}
  ]
});

const registerFormRef = ref<FormInstance>();

const submitForm = async () => {
  if (!registerFormRef.value) return;

  loading.value = true;

  try {
    const valid = await registerFormRef.value.validate();
    if (valid) {
      // 提交前，只发送 RegisterRequest 接口需要的字段
      const submitData: RegisterRequest = {
        username: registerForm.username,
        password: registerForm.password,
        phone: registerForm.phone,
        email: registerForm.email
      };

      const res = await userStore.register(submitData); // 调用 Pinia store 的注册方法

      if (res && res.code === 200) {
        ElMessage.success('注册成功！');
        await router.push('/login'); // 注册成功后跳转到登录页
      } else {
        ElMessage.error(res?.message || '注册失败，请稍后重试！');
      }
    } else {
      ElMessage.error('请检查表单输入！');
    }
  } catch (error: any) {
    console.error('注册请求失败:', error);
    ElMessage.error(error.message || '网络错误，请稍后重试！');
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (!registerFormRef.value) return;
  registerFormRef.value.resetFields();
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-card {
  width: 400px;
  margin: 50px auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.register-form {
  padding: 20px;
}
</style>