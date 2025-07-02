<template>
  <!-- Back Button -->
  <el-button
      @click="$router.push('/')"
      type="primary"
      plain
      circle
      class="bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
  >
    <i class="el-icon-arrow-left"></i>
  </el-button>

  <!-- Title or other content if needed -->
  <h2 class="user-center">个人中心</h2>

  <LogoutButton v-if="user" @logout="handleLogout"/>
</template>

<script setup lang="ts">
import LogoutButton from "@/components/user/LogoutButton.vue";
import {useUserStore} from "@/stores/user.ts";
import {ref} from "vue";
import type {User} from "@/models/entity/User.ts";

const userStore = useUserStore();
const user = ref<User | null>(userStore.userInfo);

const handleLogout = () => {
  userStore.logout();
  window.location.href = '/login';
};
</script>

<style scoped>
.user-center {
  flex-grow: 1; /* ✅ 占据中间空间 */
  border-bottom: none;
}
</style>