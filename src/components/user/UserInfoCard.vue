<template>
  <el-card
    style="max-width: 480px"
    class="user-info-card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6 transform transition-all hover:scale-105"
  >
    <template #header>
      <div class="card-header flex justify-between items-center">
        <span class="text-lg font-bold text-gray-800">{{ user.username }}</span>
      </div>
    </template>

    <!-- 用户信息展示 -->
    <div class="space-y-4">
      <div class="flex items-center space-x-3">
        <i class="el-icon-user text-blue-500"></i>
        <span class="font-medium text-gray-700">用户名：</span>
        <span class="text-gray-900">{{ user.username }}</span>
      </div>

      <div class="flex items-center space-x-3">
        <i class="el-icon-message text-red-500"></i>
        <span class="font-medium text-gray-700">邮箱：</span>
        <span class="text-gray-900">{{ user.email }}</span>
      </div>

      <div class="flex items-center space-x-3">
        <i class="el-icon-s-custom text-green-500"></i>
        <span class="font-medium text-gray-700">角色：</span>
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
      </div>
    </div>

    <!-- 按钮放在 footer -->
    <template #footer>
      <div class="flex justify-end space-x-3 mt-2">
        <el-button
          type="primary"
          @click="handleUpdate"
          :loading="loading"
          class="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg px-5 py-2 transition-all"
        >
          更新资料
        </el-button>
        <el-button
          type="info"
          @click="handleModifyPassword"
          :loading="loading"
          class="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 rounded-lg px-5 py-2 transition-all"
        >
          修改密码
        </el-button>
      </div>
    </template>
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