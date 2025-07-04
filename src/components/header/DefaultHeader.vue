<template>
  <div class="logo">📚 Platform</div>
  <el-menu class="nav-menu" mode="horizontal">
    <el-menu-item index="/follow" @click="handleClickFollow">关注</el-menu-item>
    <el-menu-item index="/" @click="handleClickHome">首页</el-menu-item>
    <el-menu-item index="/hot" @click="handleClickHot">热榜</el-menu-item>
  </el-menu>

  <SearchBox/>

  <user-avatar/>
</template>

<script setup lang="ts">
import SearchBox from '@/components/header/SearchBox.vue'
import UserAvatar from "@/components/header/UserAvatar.vue";
import router from "@/router";

const handleClickHome = () => {
  router.push('/')
}

const handleClickFollow = () => {
  router.push('/follow')
}

const handleClickHot = () => {
  router.push('/hot')
}
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
