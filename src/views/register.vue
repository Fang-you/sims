<template>
  <div class="register-page-container">
    <div class="register-form">
      <h2>学生信息管理系统</h2>
      <p>创建新账户</p>

      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="请输入邮箱"
            size="large"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            size="large"
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="verificationCode">
          <el-input
            v-model="registerForm.verificationCode"
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
              >
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button size="large" style="width: 100%" @click="goToLogin">
            返回登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Message, Phone, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const registerFormRef = ref()

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  verificationCode: ''
})

const countdown = ref(0)

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 发送验证码（假的）
const sendVerificationCode = () => {
  if (!registerForm.value.phone) {
    ElMessage.error('請先輸入手機號')
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
  ElMessage.success('驗證碼已發送至您的手機號：' + registerForm.value.phone)
  
  // 为调试，生成一个随机4位数字作为验证码显示在控制台
  const mockCode = Math.floor(Math.random() * 1000000).toString().padStart(6)

  console.log(`模拟验证码: ${mockCode}`)
}

// 注册
const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    
    // 这里不写具体的注册业务逻辑，只模拟成功
    ElMessage.success('註冊成功！即將跳轉到登錄頁面')
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
    
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 返回登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
              url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80') center/cover no-repeat;
  position: relative;
}

.register-form {
  width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.register-form h2 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.register-form p {
  text-align: center;
  margin-bottom: 30px;
  color: #666;
}

/* 自定义滚动条样式 */
.register-form::-webkit-scrollbar {
  width: 6px;
}

.register-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.register-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.register-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
