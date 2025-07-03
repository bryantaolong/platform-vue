<template>
  <el-card
      style="max-width: 800px"
      class="user-info-card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 mb-6 transform transition-all hover:scale-105"
  >
    <el-container>
      <el-aside>
        <el-avatar
            src="https://i.pravatar.cc/40"
            shape="square"
            :size="150"
        />
      </el-aside>

      <el-main>
        <div class="left">
          <div>
            <h2>{{ user.username }}</h2>
          </div>

          <!-- 关注与粉丝统计 -->
          <p>
            <span @click="handleViewFollowing">关注 {{ followingCount }}</span>
            <span @click="handleViewFollowers">粉丝 {{ followerCount }}</span>
          </p>
        </div>

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
      </el-main>
    </el-container>
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
  router.push(`/user/following`);
};

// 跳转到粉丝列表页
const handleViewFollowers = () => {
  router.push(`/user/followers`);
};
</script>

<style scoped>
.user-info-card {
  @apply border-0;
}
</style>