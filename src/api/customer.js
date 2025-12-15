// src/api/customer.js
import request from '@/utils/request'

// 发送消息给AI客服
export const sendChatMessage = (data) => request.post('/api/ai/chat', data)
