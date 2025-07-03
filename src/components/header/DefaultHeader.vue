<template>
  <div class="logo">📚 Platform</div>
  <el-menu class="nav-menu" mode="horizontal">
    <el-menu-item index="/">首页</el-menu-item>
    <el-menu-item index="/articles">博文</el-menu-item>
    <el-menu-item index="/about">关于</el-menu-item>
  </el-menu>

  <SearchBox/>

  <user-avatar/>
</template>

<script setup lang="ts">
import SearchBox from '@/components/header/SearchBox.vue'
import UserAvatar from "@/components/header/UserAvatar.vue";
</script>

<style scoped>
.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 24px;
}

.nav-menu {
  flex-grow: 1; /* ✅ 占据中间空间 */
  border-bottom: none;
}
</style>
