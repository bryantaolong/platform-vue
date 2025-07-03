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

  <user-avatar/>
</template>

<script setup lang="ts">
import UserAvatar from "@/components/header/profile/UserAvatar.vue";
</script>

<style scoped>
.user-center {
  flex-grow: 1; /* ✅ 占据中间空间 */
  border-bottom: none;
}
</style>