<!-- src/components/header/AIChatDialog.vue -->
<template>
  <el-dialog v-model="visible" title="AI 聊天" width="600px">
    <div class="chat-box">
      <div class="chat-messages">
        <div v-for="(msg, index) in messages" :key="index" :class="msg.role">
          <span v-html="renderMarkdown(msg.content)"></span>
        </div>
      </div>
      <el-input
          v-model="userMessage"
          type="textarea"
          placeholder="请输入消息..."
          @keyup.enter.native="sendMessage"
          rows="3"
          :disabled="loading"
      />
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="sendMessage" :loading="loading">发送</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import request from '@/utils/request';
import { marked } from 'marked';

const visible = ref(false);
const userMessage = ref('');
const messages = ref<{ role: string; content: string }[]>([]);
const loading = ref(false);

const open = () => {
  visible.value = true;
};

const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  // 1. 添加用户消息
  messages.value.push({ role: 'user', content: userMessage.value });
  const input = userMessage.value;
  userMessage.value = '';
  loading.value = true;

  try {
    // 2. 请求 AI 响应
    const res: { reply: string } = await request.post('/api/ai/chat', { message: input });
    // 3. 添加 AI 回复
    messages.value.push({ role: 'ai', content: res.reply });

  } catch (err) {
    messages.value.push({ role: 'ai', content: '⚠️ 请求失败，请稍后重试。' });
  } finally {
    loading.value = false;
  }
};

const renderMarkdown = (text: string) => {
  return marked.parse(text || '');
};

defineExpose({ open });
</script>

<style scoped>
.chat-box {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.chat-messages {
  margin-bottom: 10px;
}
.user {
  text-align: right;
  margin: 5px 0;
  font-weight: bold;
}
.ai {
  text-align: left;
  margin: 5px 0;
  background: #f4f4f4;
  padding: 6px 10px;
  border-radius: 4px;
}
</style>
