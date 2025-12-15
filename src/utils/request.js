// src/utils/request.js
import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',   // 通过 Vite 代理转发到后端
  timeout: 60000
})

// 请求拦截器 - 添加 token 到请求头
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      // 将 token 添加到请求头
      config.headers.token = token
    }
    return config
  },
  (error) => {
    console.error('API请求拦截器 - 错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 根据您的后端 ResponseEntity.ok(aiResponse)，直接返回响应内容
    console.log('API响应:', response) // 调试日志
    return response.data
  },
  (error) => {
    console.error('API响应拦截器 - 错误:', error)
    return Promise.reject(error)
  }
)

export default request
