<!-- src/components/user/EditUserProfileDialog.vue -->
<template>
  <el-dialog v-model="dialogVisible" :title="title" width="500px" @close="handleClose">
    <el-form :model="currentEditUser" :rules="editUserRules" ref="editUserFormRef" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="currentEditUser.username" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="currentEditUser.phone" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="currentEditUser.email" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="currentEditUser.realName" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="currentEditUser.gender" placeholder="请选择性别">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
          <el-option label="保密" :value="0" />
        </el-select>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker v-model="currentEditUser.birthday" />
        </el-form-item>
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-input v-model="currentEditUser.avatar" placeholder="头像 URL" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type {FormInstance} from 'element-plus';
import { updateUser } from '@/api/userProfile';
import type { UserProfileVO } from '@/models/vo/UserProfileVO';
import type { UserUpdateRequest } from '@/models/request/user/UserUpdateRequest.ts';

const props = defineProps<{
  visible: boolean;
  userData?: UserProfileVO;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'userUpdated'): void;
}>();

const title = '编辑用户信息';
const dialogVisible = ref(false);
const editUserFormRef = ref<FormInstance>();

// 编辑用户表单数据
const currentEditUser = reactive<UserUpdateRequest & { id?: number | null }>({
  userId: null,
  username: '',
  phone: '',
  email: '',
  realName: '',
  gender: 0,
  birthday: '',
  avatar: ''

});

// 校验规则
const editUserRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: false, message: '请输入邮箱', trigger: 'blur' }],
  phone: [{ pattern: /^[0-9]{5,20}$/, message: '请输入有效手机号', trigger: 'blur' }],
  realName:  [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  gender: [{ type: 'number', required: false, message: '请选择性别', trigger: 'change' }],
  birthday: [{ type: 'string', required: false, message: '请选择日期', trigger: 'blur' }],
  avatar: [{ type: 'string', required: false, message: '请输入头像地址', trigger: 'blur' }]
};

// 监听弹窗显示状态
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.userData) {
    Object.assign(currentEditUser, {
      userId: props.userData.userId,
      username: props.userData.username,
      phone: props.userData.phone,
      email: props.userData.email,
      realName: props.userData.realName,
      gender: props.userData.gender,
      birthday: props.userData.birthday,
      avatar: props.userData.avatar,
    });
    editUserFormRef.value?.clearValidate();
  } else if (newVal) {
    Object.assign(currentEditUser, {
      userId: null,
      username: '',
      phone: '',
      email: '',
      realName: '',
      gender: 0,
      birthday: '',
      avatar: ''
    });
    editUserFormRef.value?.resetFields();
  }
});

// 表单提交逻辑
const submitForm = async () => {
  if (!editUserFormRef.value) return;
  await editUserFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await updateUser(currentEditUser.id!, {
          username: currentEditUser.username,
          email: currentEditUser.email,
          phone: currentEditUser.phone,
          gender: currentEditUser.gender,
          birthday: currentEditUser.birthday,
          avatar: currentEditUser.avatar
        });
        ElMessage.success('用户信息更新成功');
        dialogVisible.value = false;
        emit('userUpdated');
      } catch (error) {
        ElMessage.error('更新失败，请稍后重试');
      }
    }
  });
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>


<style scoped>
/* Add component-specific styles here if needed */
</style>
