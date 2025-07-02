<template>
  <div class="friend-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>我的聊天</span>
        </div>
      </template>
      <div v-loading="loading">
        <el-empty v-if="sessions.length === 0 && !loading" description="暂无聊天会话"></el-empty>
        <el-list v-else>
          <el-list-item v-for="session in sessions" :key="session.id" class="session-item" @click="goToChat(session)">
            <div class="session-avatar-placeholder">
              {{ session.otherUserName ? session.otherUserName.charAt(0).toUpperCase() : '?' }}
            </div>
            <div class="session-info">
              <div class="session-header">
                <span class="session-name">{{ session.otherUserName || `用户 ${session.otherUserId}` }}</span>
                <span class="session-time">{{ formatTime(session.lastMessageTime) }}</span>
              </div>
              <div class="session-content">
                <span class="last-message">{{ session.lastMessage }}</span>
                <el-badge v-if="session.unreadCount && session.unreadCount > 0" :value="session.unreadCount" class="unread-badge" />
              </div>
            </div>
          </el-list-item>
        </el-list>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getChatSessions } from '@/api/chat';
import type { ChatSessionVO } from '@/models/vo/ChatSessionVO';
// import defaultAvatar from '@/assets/default-avatar.png'; // 不再需要

const router = useRouter();
const userStore = useUserStore();
const sessions = ref<ChatSessionVO[]>([]);
const loading = ref(true);

const fetchSessions = async () => {
  if (!userStore.userInfo?.id) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await getChatSessions(userStore.userInfo.id);
    if (res.code === 200 && res.data) {
      sessions.value = res.data.map(session => ({
        ...session,
        otherUserName: session.otherUserName || `用户 ${session.otherUserId}`,
        // otherUserAvatar: session.otherUserAvatar // 不再设置或使用
      }));
    } else {
      sessions.value = [];
    }
  } catch (error) {
    console.error('获取会话列表失败:', error);
    sessions.value = [];
  } finally {
    loading.value = false;
  }
};

const goToChat = (session: ChatSessionVO) => {
  router.push({
    name: 'ChatView',
    params: { otherUserId: session.otherUserId },
    query: { otherUserName: session.otherUserName }
  });
};

const formatTime = (time: Date | string | undefined): string => {
  if (!time) return '';
  const date = new Date(time);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString();
  }
};

onMounted(() => {
  fetchSessions();
});
</script>

<style scoped>
.friend-list-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.box-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #ebeef5;
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background-color: #f5f7fa;
}

/* 新增的头像占位符样式 */
.session-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409eff; /* Element Plus primary color */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.session-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.session-name {
  font-weight: bold;
  font-size: 16px;
}

.session-time {
  font-size: 12px;
  color: #909399;
}

.session-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.last-message {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 30px);
}

.unread-badge {
  margin-left: 10px;
}
</style>