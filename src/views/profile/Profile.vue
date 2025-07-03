<template>
  <div class="profile-container min-h-screen bg-gray-100 flex flex-col">
    <!-- Main Content Centered -->
    <main class="flex-grow flex items-start justify-center mt-6">
      <div class="w-full max-w-4xl px-4">
        <UserInfoCard
          v-if="user"
          :user="user"
          @update-profile="fetchUserInfo"
          @modify-password="handleModifyPassword"
        />

        <!-- 修改密码对话框 -->
        <ChangePasswordDialog
          :visible="showChangePasswordDialog"
          :user-data="currentOperateUser"
          @update:visible="showChangePasswordDialog = $event"
          @passwordChanged="fetchUserInfo"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.ts';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import ChangePasswordDialog from '@/components/user/ChangePasswordDialog.vue';
import type { User } from '@/models/entity/User.ts';

const userStore = useUserStore();
const user = ref<User | null>(userStore.userInfo);
const showChangePasswordDialog = ref(false);
const currentOperateUser = ref<User | null>(null);

const fetchUserInfo = async () => {
  await userStore.fetchUserInfo();
  user.value = userStore.userInfo;
};

const handleModifyPassword = (user: User) => {
  currentOperateUser.value = { ...user };
  showChangePasswordDialog.value = true;
};

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    window.location.href = '/login';
  } else if (!user.value) {
    await fetchUserInfo();
  }
});
</script>

<style scoped>
.profile-container {
  font-family: 'Segoe UI', sans-serif;
}

main {
  padding-bottom: 2rem;
}
</style>