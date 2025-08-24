<!-- src/components/user/ChangePasswordDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="更改用户密码"
    width="450px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form :model="changePasswordForm" :rules="changePasswordRules" ref="changePasswordFormRef" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="currentUser.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="changePasswordForm.newPassword" show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmNewPassword">
        <el-input type="password" v-model="changePasswordForm.confirmNewPassword" show-password></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(changePasswordFormRef)">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import * as userService from '@/api/user.ts';
import type { User } from '@/models/entity/User.ts';
import type { ChangePasswordRequest } from '@/models/request/user/ChangePasswordRequest.ts';

// 定义组件的 props
const props = defineProps<{
  visible: boolean;
  userData: User | null; // 传入当前编辑的用户数据
}>();

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'passwordChanged']);

const dialogVisible = ref(props.visible);
const changePasswordFormRef = ref<FormInstance>();

// 当前操作的用户信息
const currentUser = reactive<{ id: number | null; username: string }>({
  id: null,
  username: '',
});

// 表单数据
const changePasswordForm = reactive({
  newPassword: '',
  confirmNewPassword: ''
});

// 表单验证规则
const changePasswordRules = reactive<FormRules<typeof changePasswordForm>>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmNewPassword: [
    {
      required: true,
      validator: (_rule: any, value: string, callback: any) => {
        if (value === '') {
          callback(new Error('请再次输入新密码'));
        } else if (value !== changePasswordForm.newPassword) {
          callback(new Error('两次输入的密码不一致!'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 监听 props.visible 的变化来控制 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.userData) {
    // 当弹窗打开且有用户数据时，填充用户ID和用户名
    currentUser.id = props.userData.id;
    currentUser.username = props.userData.username;
    // 清空密码表单
    changePasswordForm.newPassword = '';
    changePasswordForm.confirmNewPassword = '';
    // 重置表单验证状态
    changePasswordFormRef.value?.clearValidate();
  }
});

// 处理弹窗关闭
const handleClose = () => {
  emit('update:visible', false); // 通知父组件关闭弹窗
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        if (currentUser.id) {
          const changePasswordData: ChangePasswordRequest = {
            oldPassword: '', // 管理员操作时，旧密码通常为空或不发送
            newPassword: changePasswordForm.newPassword
          };
          // 调用 userService.changePassword，后端会根据权限判断是否需要旧密码
          const res = await userService.changePassword(currentUser.id, changePasswordData);
          if (res.code === 200) {
            ElMessage.success('用户密码重置成功！');
            emit('passwordChanged'); // 通知父组件密码已更改
            handleClose();
          } else {
            ElMessage.error(res.message || '重置密码失败！');
          }
        }
      } catch (error: any) {
        console.error('重置密码失败:', error);
        ElMessage.error('网络错误或请求失败！');
      }
    } else {
      ElMessage.error('请检查表单输入！');
      return false;
    }
  });
};
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>
