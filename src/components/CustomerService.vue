<template>
  <div class="customer-service">
    <!-- 客服按钮 -->
    <div
      v-if="!isOpen"
      class="service-btn"
      @click="openChat"
    >
      <el-icon><ChatDotRound /></el-icon>
      <span>客服</span>
    </div>

    <!-- 对话窗口 -->
    <div
      v-if="isOpen"
      class="chat-window"
      :style="{
        position: 'fixed',
        right: position.right + 'px',
        bottom: position.bottom + 'px',
        zIndex: 9999
      }"
    >
      <!-- 标题栏 -->
      <div
        class="chat-header"
        @mousedown="startDrag"
      >
        <span>智能客服</span>
        <div class="header-buttons">
          <el-button type="text" size="small" @click="minimizeChat">
            <el-icon><Minus /></el-icon>
          </el-button>
          <el-button type="text" size="small" @click="closeChat">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="chat-content">
        <div class="messages" ref="messagesContainer">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="['message', message.type]"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <el-input
          v-model="inputMessage"
          placeholder="请输入您的问题..."
          @keyup.enter="sendMessage"
          class="input-field"
        >
          <template #append>
            <el-button type="primary" @click="sendMessage">
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ChatDotRound, Minus, Close } from '@element-plus/icons-vue'

// 响应式数据
const isOpen = ref(false)
const inputMessage = ref('')
const messagesContainer = ref(null)

// 位置状态
const position = reactive({
  right: 20,
  bottom: 20
})

// 拖动状态
const dragState = reactive({
  isDragging: false,
  startX: 0,
  startY: 0,
  startRight: 0,
  startBottom: 0
})

// 消息列表
const messages = ref([
  {
    type: 'bot',
    content: '您好！我是智能客服，有什么可以帮助您的吗？'
  }
])

// 打开对话
const openChat = () => {
  isOpen.value = true
}

// 关闭对话
const closeChat = () => {
  isOpen.value = false
}

// 最小化对话
const minimizeChat = () => {
  isOpen.value = false
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: inputMessage.value.trim()
  })

  const userMessage = inputMessage.value.trim()
  inputMessage.value = ''

  // 模拟AI回复
  setTimeout(() => {
    const botResponse = getBotResponse(userMessage)
    messages.value.push({
      type: 'bot',
      content: botResponse
    })

    nextTick(() => {
      scrollToBottom()
    })
  }, 1000)

  nextTick(() => {
    scrollToBottom()
  })
}

// 获取机器人回复
const getBotResponse = (userMessage) => {
  const responses = [
    '我理解您的问题，让我为您详细解答。',
    '这是一个很好的问题，根据我的了解...',
    '感谢您的提问，我来帮您解决这个问题。',
    '我明白您的需求，建议您可以尝试以下方法：',
    '关于这个问题，我可以为您提供以下建议：'
  ]

  // 根据关键词返回特定回复
  if (userMessage.includes('登录') || userMessage.includes('登入')) {
    return '关于登录问题，请检查您的用户名和密码是否正确，如果忘记密码可以点击"忘记密码"进行重置。'
  } else if (userMessage.includes('借书') || userMessage.includes('借阅')) {
    return '借书流程很简单：1. 搜索您要借的图书 2. 点击借阅按钮 3. 确认借阅信息。每本书的借阅期限为30天。'
  } else if (userMessage.includes('还书') || userMessage.includes('归还')) {
    return '还书时请携带图书到图书馆，或使用自助还书机。逾期还书会产生罚款，请及时归还。'
  } else {
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 拖动功能
const startDrag = (e) => {
  dragState.isDragging = true
  dragState.startX = e.clientX
  dragState.startY = e.clientY
  dragState.startRight = position.right
  dragState.startBottom = position.bottom

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)

  e.preventDefault()
}

const handleDrag = (e) => {
  if (!dragState.isDragging) return

  const deltaX = dragState.startX - e.clientX
  const deltaY = e.clientY - dragState.startY

  let newRight = dragState.startRight + deltaX
  let newBottom = dragState.startBottom - deltaY

  // 限制拖动范围
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const chatWidth = 350
  const chatHeight = 400

  newRight = Math.max(0, Math.min(newRight, windowWidth - chatWidth))
  newBottom = Math.max(0, Math.min(newBottom, windowHeight - chatHeight))

  position.right = newRight
  position.bottom = newBottom
}

const stopDrag = () => {
  dragState.isDragging = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}
</script>

<style scoped>
.customer-service {
  position: relative;
}

/* 客服按钮 */
.service-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  color: white;
}

.service-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.6);
}

.service-btn .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
}

.service-btn span {
  font-size: 10px;
  font-weight: 500;
}

/* 对话窗口 */
.chat-window {
  width: 350px;
  height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

/* 标题栏 */
.chat-header {
  background: #409eff;
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: move;
  user-select: none;
}

.chat-header span {
  font-weight: 600;
  font-size: 14px;
}

.header-buttons {
  display: flex;
  gap: 4px;
}

.header-buttons .el-button {
  color: white !important;
  padding: 4px !important;
  min-height: auto !important;
}

.header-buttons .el-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* 消息区域 */
.chat-content {
  flex: 1;
  overflow: hidden;
}

.messages {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 消息样式 */
.message {
  display: flex;
  max-width: 100%;
}

.message.user {
  justify-content: flex-end;
}

.message-content {
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.4;
}

.message.user .message-content {
  background: #409eff;
  color: white;
}

/* 输入区域 */
.chat-input {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.input-field {
  width: 100%;
}

/* 滚动条美化 */
.messages::-webkit-scrollbar {
  width: 4px;
}

.messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-window {
    width: 300px;
    height: 350px;
  }

  .service-btn {
    width: 50px;
    height: 50px;
    right: 15px;
    bottom: 15px;
  }

  .service-btn .el-icon {
    font-size: 16px;
  }

  .service-btn span {
    font-size: 9px;
  }
}
</style>
