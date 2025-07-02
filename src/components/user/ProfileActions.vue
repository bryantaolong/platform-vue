<template>
  <div class="flex justify-end mt-8">
    <el-button
      type="danger"
      @click="handleLogout"
      :loading="loading"
      size="large"
      class="flex items-center px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
    >
      <el-icon class="mr-2"><SwitchButton /></el-icon>
      退出登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { SwitchButton } from '@element-plus/icons-vue';

const emit = defineEmits(['logout']);
const loading = ref(false);

const handleLogout = async () => {
  loading.value = true;
  try {
    emit('logout');
    ElMessage.success('已成功退出！');
  } catch (error) {
    ElMessage.error('退出失败，请重试！');
  } finally {
    loading.value = false;
  }
};
</script>