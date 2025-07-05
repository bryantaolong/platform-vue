<!-- src/components/user/EditUserDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="currentEditUser.id ? '编辑用户' : '新增用户'"
    width="500px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form :model="currentEditUser" :rules="editUserRules" ref="editUserFormRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="currentEditUser.username" :disabled="!!currentEditUser.id"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="currentEditUser.email"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(editUserFormRef)">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import * as userService from '@/api/user.ts';
import type { UserUpdateRequest } from '@/models/request/UserUpdateRequest.ts';
import type { User } from '@/models/entity/User.ts';

// 定义组件的 props
const props = defineProps<{
  visible: boolean;
  userData: User | null; // 传入当前编辑的用户数据
}>();

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'userUpdated']);

const dialogVisible = ref(props.visible);
const editUserFormRef = ref<FormInstance>();

// 表单数据，使用 reactive 确保响应式
const currentEditUser = reactive<UserUpdateRequest & { id?: number | null }>({
  id: null,
  username: '',
  email: '',
  // password: '' // 如果新增用户需要密码，在这里添加
});

// 表单验证规则
const editUserRules = reactive<FormRules<typeof currentEditUser>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '用户名长度在 3 到 15 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] }
  ],
  // password: [ // 如果新增用户需要密码
  //   { required: true, message: '请输入密码', trigger: 'blur' },
  //   { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  // ]
});

// 监听 props.visible 的变化来控制 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.userData) {
    // 当弹窗打开且有用户数据时，填充表单
    currentEditUser.id = props.userData.id;
    currentEditUser.username = props.userData.username;
    currentEditUser.email = props.userData.email;
    // 重置表单验证状态
    editUserFormRef.value?.clearValidate();
  } else if (newVal && !props.userData) {
    // 如果是新增用户模式，清空表单
    currentEditUser.id = null;
    currentEditUser.username = '';
    currentEditUser.email = '';
    // currentEditUser.password = ''; // 如果有密码字段
    editUserFormRef.value?.resetFields();
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
        if (currentEditUser.id) { // 更新用户
          const updateData: UserUpdateRequest = {
            username: currentEditUser.username,
            email: currentEditUser.email
          };
          const res = await userService.updateUser(currentEditUser.id, updateData);
          if (res.code === 200) {
            ElMessage.success('用户信息更新成功！');
            emit('userUpdated'); // 通知父组件用户已更新
            handleClose();
          } else {
            ElMessage.error(res.message || '更新失败！');
          }
        } else { // 新增用户 (此组件目前不包含新增，但可扩展)
          ElMessage.warning('当前模块不支持新增用户，请通过注册功能创建用户。');
          // const res = await userService.register(currentEditUser as RegisterRequest); // 假设有注册API
          // if (res.code === 200) {
          //   ElMessage.success('用户新增成功！');
          //   emit('userUpdated');
          //   handleClose();
          // } else {
          //   ElMessage.error(res.message || '新增失败！');
          // }
        }
      } catch (error: any) {
        console.error('更新/新增用户失败:', error);
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
