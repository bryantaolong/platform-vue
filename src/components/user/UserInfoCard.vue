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

    <!-- 关注与粉丝统计 -->
    <div class="mt-6 pt-4 border-t border-gray-200 flex justify-center space-x-8">
      <div class="text-center">
        <p class="text-sm text-gray-500">关注 {{ followingCount }}</p>
      </div>
      <div class="text-center">
        <p class="text-sm text-gray-500">粉丝 {{ followerCount }}</p>
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
import {ref, onMounted} from 'vue';
import {ElMessage} from 'element-plus';
import type {User} from '@/models/entity/User';
import router from '@/router'; // 确保你已经引入了路由实例
import {
  getFollowingUsers,
  getFollowerUsers,
} from '@/api/userFollow';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits(['update-profile', 'modify-password']);

const loading = ref(false);
const followingCount = ref(0);
const followerCount = ref(0);

// 获取关注和粉丝数量
onMounted(async () => {
  try {
    const [followingRes, followerRes] = await Promise.all([
      getFollowingUsers(props.user.id),
      getFollowerUsers(props.user.id),
    ]);

    if (followingRes.code === 200) {
      followingCount.value = followingRes.data.total;
    }

    if (followerRes.code === 200) {
      followerCount.value = followerRes.data.total;
    }
  } catch (error) {
    ElMessage.error('加载关注/粉丝数量失败');
  }
});

// 模拟更新资料
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

// 触发修改密码事件
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

// 跳转到关注列表页
const handleViewFollowing = () => {
  router.push(`/user/following/${props.user.id}`);
};

// 跳转到粉丝列表页
const handleViewFollowers = () => {
  router.push(`/user/followers/${props.user.id}`);
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