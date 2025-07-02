<template>
  <el-card
      class="user-info-card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6 transform transition-all hover:scale-102">
    <el-form :model="user" label-width="120px" class="space-y-6">

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <el-form-item label="用户名" class="mb-0">
          <el-input v-model="user.username" disabled class="rounded-lg border-gray-300 focus:border-blue-500"/>
        </el-form-item>
        <el-form-item label="邮箱" class="mb-0">
          <el-input v-model="user.email" disabled class="rounded-lg border-gray-300 focus:border-blue-500"/>
        </el-form-item>
      </div>
      <el-form-item label="角色" class="mb-0">
        <div class="flex flex-wrap gap-2">
          <el-tag
              v-for="role in user.roles.split(',')"
              :key="role"
              size="small"
              type="info"
              class="text-xs font-semibold bg-blue-100 text-blue-800 rounded-full px-3 py-1"
          >
            {{ role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item class="mb-0">
        <div class="flex space-x-4">
          <el-button
              type="primary"
              @click="handleUpdate"
              :loading="loading"
              class="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-6 py-2 transition-all"
          >
            更新资料
          </el-button>
          <el-button
              type="info"
              @click="handleModifyPassword"
              :loading="loading"
              class="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 rounded-lg px-6 py-2 transition-all"
          >
            修改密码
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {ElMessage} from 'element-plus';
import type {User} from '@/models/entity/User';

const props = defineProps<{
  user: User;
}>();
const emit = defineEmits(['update-profile', 'modify-password']);
const loading = ref(false);
const handleUpdate = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    emit('update-profile');
    ElMessage.success('资料更新成功！');
  } catch (error) {
    ElMessage.error('资料更新失败，请重试！');
  } finally {
    loading.value = false;
  }
};

const handleModifyPassword = async () => {
  loading.value = true;
  try {
    emit('modify-password', props.user);
    ElMessage.success('请在弹窗中修改密码！');
  } catch (error) {
    ElMessage.error('修改密码请求失败，请重试！');
  } finally {
    loading.value = false;
  }
};
</script>


<style scoped>
.user-info-card {
  @apply border-0;
}

.el-form-item__label {
  @apply text-gray-700 font-medium text-base;
}

.el-input__inner {
  @apply text-gray-900;
}

.el-tag {
  @apply shadow-md;
}
</style>