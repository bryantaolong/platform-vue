<!-- src/components/user/ChangeRoleDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="更改用户角色"
    width="400px"
    :before-close="handleClose"
    destroy-on-close
  >
    <el-form :model="currentChangeRoleUser" ref="changeRoleFormRef" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="currentChangeRoleUser.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="新角色" prop="newRoles">
        <el-input v-model="currentChangeRoleUser.newRoles" placeholder="多个角色用逗号分隔，如ROLE_USER,ROLE_ADMIN"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm(changeRoleFormRef)">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import * as userService from '@/api/user';
import type { User } from '@/models/entity/User';

// 定义组件的 props
const props = defineProps<{
  visible: boolean;
  userData: User | null; // 传入当前编辑的用户数据
}>();

// 定义组件的 emits
const emit = defineEmits(['update:visible', 'roleChanged']);

const dialogVisible = ref(props.visible);
const changeRoleFormRef = ref<FormInstance>();

// 表单数据
const currentChangeRoleUser = reactive<{ id: number | null; username: string; newRoles: string }>({
  id: null,
  username: '',
  newRoles: ''
});

// 监听 props.visible 的变化来控制 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal && props.userData) {
    // 当弹窗打开且有用户数据时，填充表单
    currentChangeRoleUser.id = props.userData.id;
    currentChangeRoleUser.username = props.userData.username;
    currentChangeRoleUser.newRoles = props.userData.roles; // 默认显示当前角色
    // 重置表单验证状态
    changeRoleFormRef.value?.clearValidate();
  }
});

// 处理弹窗关闭
const handleClose = () => {
  emit('update:visible', false); // 通知父组件关闭弹窗
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  // 这里没有复杂的校验，直接提交
  try {
    if (currentChangeRoleUser.id) {
      const res = await userService.changeRole(currentChangeRoleUser.id, currentChangeRoleUser.newRoles);
      if (res.code === 200) {
        ElMessage.success('用户角色更新成功！');
        emit('roleChanged'); // 通知父组件角色已更新
        handleClose();
      } else {
        ElMessage.error(res.message || '更新角色失败！');
      }
    }
  } catch (error: any) {
    console.error('更新角色失败:', error);
    ElMessage.error('网络错误或请求失败！');
  }
};
</script>

<style scoped>
/* Add component-specific styles here if needed */
</style>
