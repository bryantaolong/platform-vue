<!-- src/components/header/AIChatDialog.vue -->
<template>
  <el-dialog v-model="visible" title="AI 聊天" width="600px">
    <div class="chat-box">
      <div class="chat-messages">
        <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="msg.role"
        >
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
      <el-button type="warning" plain @click="handleClearContext">清空上下文</el-button>
      <el-button type="primary" @click="sendMessage" :loading="loading">发送</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { marked } from 'marked';
import { ElMessage, ElMessageBox } from 'element-plus';
import { sendChatMessage, clearChatContext } from '@/api/aiChat';

const visible = ref(false);
const userMessage = ref('');
const messages = ref<{ role: string; content: string }[]>([]);
const loading = ref(false);

// 打开对话框的方法（供外部调用）
const open = () => {
  visible.value = true;
};

// 发送消息
const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  // 1. 添加用户消息
  messages.value.push({ role: 'user', content: userMessage.value });
  const input = userMessage.value;
  userMessage.value = '';
  loading.value = true;

  try {
    // 2. 发送消息到后端
    const res = await sendChatMessage(input);
    // 3. 显示 AI 回复
    messages.value.push({ role: 'ai', content: res.reply });
  } catch (err) {
    messages.value.push({ role: 'ai', content: '⚠️ 请求失败，请稍后重试。' });
  } finally {
    loading.value = false;
  }
};

// 清空上下文
const handleClearContext = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要清空 AI 的上下文记忆吗？这会重置对话上下文。',
        '清空上下文确认',
        {
          type: 'warning',
          confirmButtonText: '确认',
          cancelButtonText: '取消',
        }
    );

    const res = await clearChatContext();
    messages.value = [];
    ElMessage.success(res.data || '上下文已清空');
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('清空失败，请稍后重试');
    }
  }
};

// Markdown 渲染
const renderMarkdown = (text: string) => {
  return marked.parse(text || '');
};

// 让父组件可以调用 open()
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
