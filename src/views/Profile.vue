<template>
  <div class="profile-container min-h-screen bg-gray-100">
    <!--    主页头-->
    <ProfileHeader :username="user?.username || 'Guest'" />

    <div class="max-w-4xl mx-auto p-6">
      <UserInfoCard v-if="user" :user="user" @update-profile="fetchUserInfo" @modify-password="handleModifyPassword" />
      <ProfileActions v-if="user" @logout="handleLogout" />

      <!--      修改密码对话框-->
      <ChangePasswordDialog
        :visible="showChangePasswordDialog"
        :user-data="currentOperateUser"
        @update:visible="showChangePasswordDialog = $event"
        @passwordChanged="fetchUserInfo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import ProfileHeader from '@/components/user/ProfileHeader.vue';
import UserInfoCard from '@/components/user/UserInfoCard.vue';
import ProfileActions from '@/components/user/ProfileActions.vue';
import ChangePasswordDialog from '@/components/user/ChangePasswordDialog.vue'; // Import the dialog
import type { User } from '@/models/entity/User';

const userStore = useUserStore();
const user = ref<User | null>(userStore.userInfo);
const showChangePasswordDialog = ref(false);
const currentOperateUser = ref<User | null>(null);

const fetchUserInfo = async () => {
  await userStore.fetchUserInfo();
  user.value = userStore.userInfo;
};

const handleLogout = () => {
  userStore.logout();
  window.location.href = '/login';
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