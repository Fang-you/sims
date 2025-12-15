<template>
  <div class="login-container">
    <div class="login-form">
      <h2>学生信息管理系统</h2>
      <p>请登录您的账户</p>

      <el-form :model="loginForm" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="loginForm.verificationCode"
            placeholder="请输入验证码"
            size="large"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
            <template #append>
              <el-button
                :disabled="countdown > 0"
                @click="sendVerificationCode"
                type="primary"
                size="large"
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 按钮区域 -->
        <el-form-item class="button-group">
          <div class="button-row">
            <el-button type="primary" size="large" class="login-btn" @click="handleLogin">
              登录
            </el-button>
            <el-button size="large" class="reset-btn" @click="handleReset">
              重置
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="info" size="large" class="register-link-btn" @click="goToRegister">
            还没有账户？去注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { loginApi } from '@/api/login'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loginForm = ref({
  username: '',
  password: '',
  verificationCode: ''
})

const countdown = ref(0)

// 登录
const handleLogin = async () => {
  try {
    const result = await loginApi(loginForm.value)
    if (result.code === 1) {
      ElMessage.success('登录成功')
      // 保存 token 到本地存储
      localStorage.setItem('token', result.data.token)
      localStorage.setItem('userInfo', JSON.stringify(result.data))
      // 直接跳转到 dashboard
      router.push('/dashboard')
    } else {
      ElMessage.error(result.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请检查网络连接')
  }
}

// 发送验证码（假的）
const sendVerificationCode = () => {
  if (!loginForm.value.username) {
    ElMessage.error('請先輸入用戶名')
    return
  }

  // 开始倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  // 模拟发送验证码
  ElMessage.success('驗證碼已發送，請查收')

  // 为调试，生成一个随机4位数字作为验证码显示在控制台
  const mockCode = Math.floor(Math.random() * 1000000).toString().padStart(6)
  console.log(`模拟登录验证码: ${mockCode}`)
}

// 重置
const handleReset = () => {
  loginForm.value.username = ''
  loginForm.value.password = ''
  loginForm.value.verificationCode = ''
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') center/cover no-repeat;
  position: relative;
}

.login-form {
  width: 450px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.login-form p {
  text-align: center;
  margin-bottom: 30px;
  color: #666;
}

/* 按钮组样式 */
.button-group {
  margin-bottom: 15px;
}

.button-row {
  display: flex;
  gap: 15px;
}

.login-btn {
  flex: 1;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.reset-btn {
  flex: 1;
  height: 40px;
  font-size: 16px;
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #595959;
}

.reset-btn:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #40a9ff;
}

.register-link-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  background-color: transparent;
  border: 1px dashed #91d5ff;
  color: #40a9ff;
}

.register-link-btn:hover {
  background-color: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

/* 验证码按钮样式优化 */
:deep(.el-input-group__append .el-button) {
  padding: 0 15px;
  border-radius: 0 6px 6px 0;
}
</style>
