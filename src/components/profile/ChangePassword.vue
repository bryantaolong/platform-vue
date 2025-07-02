<!-- src/components/profile/ChangePassword.vue -->
<template>
  <el-dialog
      v-model="dialogVisible"
      title="修改密码"
      width="500px"
      :before-close="handleClose"
      destroy-on-close
  >
    <el-form :model="form" :rules="rules" ref="changePasswordFormRef" label-width="100px">
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input type="password" v-model="form.oldPassword" show-password placeholder="请输入旧密码"></el-input>
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input type="password" v-model="form.newPassword" show-password placeholder="请输入新密码"></el-input>
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input type="password" v-model="form.confirmPassword" show-password
                  placeholder="请再次输入新密码"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(changePasswordFormRef)">
          确认修改
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue';
import {
  ElMessage,
  FormRules,
  FormInstance,
} from 'element-plus';
import {useUserStore} from '@/stores/user';
import * as userService from '@/api/user';
import type {ChangePasswordRequest} from '@/models/request/ChangePasswordRequest';

// 定义组件的 props，用于控制弹窗的显示
const props = defineProps<{
  visible: boolean;
}>();

// 定义组件的 emits，用于通知父组件弹窗关闭
const emit = defineEmits(['update:visible']);

const userStore = useUserStore();
const dialogVisible = ref(props.visible);
const changePasswordFormRef = ref<FormInstance>();

// 表单数据
const form = reactive<ChangePasswordRequest & { confirmPassword: string }>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

// 自定义验证规则：确认新密码
const validateConfirmPassword = (rule: any,
                                 value: string,
                                 callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'));
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = reactive<FormRules<typeof form>>({
  oldPassword: [
    {required: true, message: '请输入旧密码', trigger: 'blur'},
    {min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur'},
  ],
  newPassword: [
    {required: true, message: '请输入新密码', trigger: 'blur'},
    {min: 6, max: 20, message: '新密码长度在 6 到 20 个字符', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value === form.oldPassword) {
          callback(new Error('新密码不能与旧密码相同!'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {required: true, message: '请确认新密码', trigger: 'blur'},
    {validator: validateConfirmPassword, trigger: 'blur'},
  ],
});

// 监听 props.visible 的变化来控制 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 弹窗打开时重置表单
    form.oldPassword = '';
    form.newPassword = '';
    form.confirmPassword = '';
    changePasswordFormRef.value?.resetFields();
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
      if (!userStore.userInfo?.id) {
        ElMessage.error('无法获取用户ID，请重新登录。');
        return;
      }

      try {
        const res = await userService.changePassword(userStore.userInfo.id, {
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        });

        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录！');
          userStore.logout(); // 密码修改成功后强制用户重新登录
          router.push('/login'); // 假设 router 实例在父组件中传递或在全局可用
          handleClose();
        } else {
          ElMessage.error(res.message || '密码修改失败！');
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        ElMessage.error('网络错误，修改密码失败！');
      }
    } else {
      console.log('表单验证失败!');
      return false;
    }
  });
};

// 为了在 submitForm 中使用 router.push，需要引入 useRouter
import {useRouter} from 'vue-router';

const router = useRouter();
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
