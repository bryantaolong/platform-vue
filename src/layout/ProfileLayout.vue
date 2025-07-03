<template>
  <el-container class="layout-container">
    <el-header height="60px" class="layout-header">
      <profile-header/>
    </el-header>

    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeMenu" class="sidebar-menu" router>
          <el-menu-item index="/user">
            <span>主页</span>
          </el-menu-item>
          <el-menu-item index="/user/settings">
            <span>设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import ProfileHeader from "@/components/header/ProfileHeader.vue";
import {computed} from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();
const activeMenu = computed(() => route.path);
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  gap: 16px; /* ✅ 控制间距 */
}

.layout-main {
  padding: 24px;
  background-color: #f5f7fa;
}

.sidebar-menu {
  height: 100%;
}
</style>