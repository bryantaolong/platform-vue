<!-- src/layouts/AdminLayout.vue -->
<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px">
      <el-menu :default-active="activeMenu" class="sidebar-menu" router>
        <el-menu-item index="/admin">
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/">
          <span>退出后台</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
}
</style>