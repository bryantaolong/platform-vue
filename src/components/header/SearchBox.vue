<!-- components/SearchBox.vue -->
<template>
  <el-input
    v-model="search"
    placeholder="搜索文章、作者、关键词..."
    prefix-icon="el-icon-search"
    clearable
    class="search-box"
    @keyup.enter="onSearch"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

function onSearch() {
  // emit 事件或路由跳转等逻辑
  console.log('搜索关键字：', search.value)
}
</script>

<style scoped>
.search-box {
  width: 240px;
  margin: 0 16px;
}
</style>
