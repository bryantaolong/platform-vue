<template>
  <el-container class="layout-container">
    <el-header height="60px" class="layout-header">
      <default-header/>
    </el-header>

    <el-main class="layout-main">
      <router-view/>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import DefaultHeader from "@/components/header/DefaultHeader.vue";
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
</style>