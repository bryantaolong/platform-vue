<template>
  <div class="profile-header w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-6">
    <div class="max-w-4xl mx-auto px-6">
      <h1 class="text-3xl font-bold">{{ username }} 的个人资料</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  username: string;
}>();
</script>

<style scoped>
.profile-header {
  @apply shadow-md;
}
</style>