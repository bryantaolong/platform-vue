<!-- src/components/AIChatBox.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI 聊天助手"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
    class="ai-chat-dialog"
  >
    <div class="chat-messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.role === 'user' ? 'user-message' : 'bot-message']"
      >
        <div v-html="sanitizedMarkdown(msg.content)"></div>
      </div>
      <div v-if="loadingResponse" class="message bot-message loading-message">
        AI 正在思考...
      </div>
    </div>

    <div class="chat-input">
      <el-input
        v-model="input"
        placeholder="输入你的问题..."
        @keyup.enter="sendMessage"
        clearable
      ></el-input>
      <el-button
        type="primary"
        @click="sendMessage"
        :disabled="!input.trim() || loadingResponse"
      >
        发送
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { marked } from 'marked'; // For Markdown parsing
import DOMPurify from 'dompurify'; // For HTML sanitization

// Define component props
const props = defineProps<{
  visible: boolean;
}>();

// Define component emits
const emit = defineEmits(['update:visible']);

const dialogVisible = ref(props.visible);
const input = ref('');
const messages = ref<{ role: 'user' | 'bot'; content: string }[]>([]);
const loadingResponse = ref(false); // New state for loading indicator

// Watch for changes in the 'visible' prop to control the dialog
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // Optionally clear messages when dialog opens, or keep history
    messages.value = [];
    input.value = '';
  }
});

// Handle dialog close
const handleClose = () => {
  emit('update:visible', false); // Notify parent component to close the dialog
};

// Sanitize and render Markdown content
const sanitizedMarkdown = (content: string) => {
  const html = marked.parse(content);
  return DOMPurify.sanitize(html);
};

// Send message to AI backend
const sendMessage = async () => {
  if (!input.value.trim() || loadingResponse.value) return;

  const userMsg = { role: 'user', content: input.value };
  messages.value.push(userMsg);
  input.value = ''; // Clear input immediately

  loadingResponse.value = true; // Start loading

  try {
    // CORRECTED URL: Changed from '/api/chat' to '/api/ai/chat'
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg.content }),
    });

    if (!response.ok) { // Check if the response status is 2xx
      let errorMessage = `请求失败，状态码: ${response.status}.`;
      try {
        // Attempt to parse error message from response body if it's JSON
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (response.status === 403) {
          errorMessage = '权限不足，请确认您已登录并有权访问AI服务。';
        } else if (response.status === 401) {
          errorMessage = '未认证，请登录。';
        }
      } catch (jsonError) {
        // If response is not JSON (e.g., HTML error page or empty), use status text
        errorMessage = `请求失败，状态码: ${response.status} ${response.statusText || ''}。`;
        if (response.status === 403) {
          errorMessage = '权限不足，请确认您已登录并有权访问AI服务。';
        } else if (response.status === 401) {
          errorMessage = '未认证，请登录。';
        }
      }
      ElMessage.error(errorMessage);
      messages.value.push({ role: 'bot', content: `抱歉，AI 聊天助手出错了: ${errorMessage}` });
      return; // Stop execution if response is not OK
    }

    const data = await response.json(); // This will only run if response.ok is true
    const botMsg = { role: 'bot', content: data.reply || '没有收到回复。' };
    messages.value.push(botMsg);
  } catch (error) {
    console.error('Error fetching AI response:', error);
    ElMessage.error('网络错误，无法连接到AI服务。');
    messages.value.push({ role: 'bot', content: '抱歉，网络错误，请稍后再试。' });
  } finally {
    loadingResponse.value = false; // End loading
  }
};
</script>

<style scoped>
/* Scoped styles for the chat box */
.ai-chat-dialog :deep(.el-dialog__body) {
  padding-top: 0;
  padding-bottom: 15px;
}

.chat-messages {
  height: 400px; /* Adjusted height for better fit within dialog */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
}

.message {
  padding: 12px 16px;
  border-radius: 6px;
  line-height: 1.5;
  white-space: pre-wrap; /* Preserve whitespace and line breaks */
  word-wrap: break-word; /* Break long words */
  font-size: 14px;
}

.user-message {
  align-self: flex-end;
  background-color: #d1e7dd; /* Light green */
  color: #155724; /* Dark green */
  max-width: 80%;
}

.bot-message {
  align-self: flex-start;
  background-color: #e2e3e5; /* Light grey */
  color: #383d41; /* Dark grey */
  max-width: 80%;
}

.loading-message {
  font-style: italic;
  color: #909399; /* Grey text for loading */
}

.chat-input {
  display: flex;
  gap: 10px;
}
</style>
