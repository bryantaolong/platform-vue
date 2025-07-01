<!-- src/components/profile/EditProfile.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑个人资料"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form :model="form" :rules="rules" ref="editProfileFormRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(editProfileFormRef)">
          保存
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import {
  ElMessage,
  FormInstance,
  FormRules
} from 'element-plus';
import { useUserStore } from '@/stores/user';
import * as userService from '@/api/user';
import type { UserUpdateRequest } from '@/models/request/UserUpdateRequest';

// 定义组件的 props，用于控制弹窗的显示和接收初始数据
const props = defineProps<{
  visible: boolean;
  initialUsername: string;
  initialEmail: string;
}>();

// 定义组件的 emits，用于通知父组件弹窗关闭和数据更新
const emit = defineEmits(['update:visible', 'profileUpdated']);

const userStore = useUserStore();
const dialogVisible = ref(props.visible);
const editProfileFormRef = ref<FormInstance>();

// 表单数据，使用 reactive 确保响应式
const form = reactive<UserUpdateRequest>({
  username: props.initialUsername,
  email: props.initialEmail,
});

// 表单验证规则
const rules = reactive<FormRules<typeof form>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
});

// 监听 props.visible 的变化来控制 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 当弹窗打开时，重置表单数据为初始值
    form.username = props.initialUsername;
    form.email = props.initialEmail;
    // 重置表单验证状态
    editProfileFormRef.value?.resetFields();
  }
});

// 处理弹窗关闭
const handleClose = () => {
  emit('update:visible', false); // 通知父组件关闭弹窗
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      // 检查是否有实际修改
      if (form.username === props.initialUsername && form.email === props.initialEmail) {
        ElMessage.info('没有检测到资料修改。');
        handleClose();
        return;
      }

      if (!userStore.userInfo?.id) {
        ElMessage.error('无法获取用户ID，请重新登录。');
        return;
      }

      try {
        const res = await userService.updateUser(userStore.userInfo.id, {
          username: form.username,
          email: form.email,
        });

        if (res.code === 200) {
          ElMessage.success('个人资料更新成功！');
          // 重新获取用户信息以更新 store
          await userStore.fetchUserInfo();
          emit('profileUpdated'); // 通知父组件资料已更新
          handleClose();
        } else {
          ElMessage.error(res.message || '个人资料更新失败！');
        }
      } catch (error) {
        console.error('更新个人资料失败:', error);
        ElMessage.error('网络错误，个人资料更新失败！');
      }
    } else {
      console.log('表单验证失败!');
      return false;
    }
  });
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
