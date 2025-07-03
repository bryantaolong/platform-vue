<template>
  <div class="user-info">
    <!-- ✅ 登录后：展示下拉头像 -->
    <el-dropdown v-if="userStore.isLoggedIn" @command="handleCommand">
      <el-avatar
        src="https://i.pravatar.cc/40"
        size="default"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="settings">设置</el-dropdown-item>
          <el-dropdown-item command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- ❌ 未登录：展示点击跳转 -->
    <span v-else class="login-text" @click="goLogin">未登录</span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.ts'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

function handleCommand(command: string) {
  if (command === 'settings') {
    router.push('/user/settings')
  } else if (command === 'logout') {
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.login-text {
  font-size: 14px;
  color: #409EFF;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.login-text:hover {
  background-color: #ecf5ff;
}
</style>