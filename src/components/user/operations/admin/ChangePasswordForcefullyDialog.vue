<template>
  <el-dialog
      v-model="dialogVisible"
      title="管理员强制重置密码"
      width="450px"
      :before-close="handleClose"
      destroy-on-close
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="用户名">
        <el-input v-model="user.username" disabled />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="form.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmNewPassword">
        <el-input v-model="form.confirmNewPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm">确认重置</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { changePasswordForcefully } from '@/api/user';
import type { User } from '@/models/entity/User';

const props = defineProps<{
  visible: boolean;
  userData: User | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'passwordReset'): void;
}>();

const dialogVisible = ref(false);
const formRef = ref<FormInstance>();

// 当前用户信息
const user = reactive<{ id: number | null; username: string }>({
  id: null,
  username: ''
});

// 表单数据
const form = reactive({
  newPassword: '',
  confirmNewPassword: ''
});

// 校验规则
const rules = reactive<FormRules<typeof form>>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为 6-20 位', trigger: 'blur' }
  ],
  confirmNewPassword: [
    {
      required: true,
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入新密码'));
        } else if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
});

// 弹窗状态监听
watch(() => props.visible, (val) => {
  dialogVisible.value = val;
  if (val && props.userData) {
    user.id = props.userData.id;
    user.username = props.userData.username;
    form.newPassword = '';
    form.confirmNewPassword = '';
    formRef.value?.clearValidate();
  }
});

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false);
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid || !user.id) return;

    try {
      const res = await changePasswordForcefully(user.id, form.newPassword);
      if (res.code === 200) {
        ElMessage.success('密码已成功重置');
        emit('passwordReset');
        handleClose();
      } else {
        ElMessage.error(res.message || '密码重置失败');
      }
    } catch (err) {
      console.error('重置异常:', err);
      ElMessage.error('请求失败，请稍后重试');
    }
  });
};
</script>


<style scoped>
/* 可按需自定义 */
</style>
