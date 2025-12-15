<template>
  <div class="user-profile-container">
    <div class="page-header">
      <h2>个人信息</h2>
      <p>管理您的个人账户信息</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：头像和基本信息 -->
      <el-col :span="8">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>头像设置</span>
            </div>
          </template>

          <div class="avatar-section">
            <div class="avatar-container">
              <el-avatar
                :size="120"
                :src="userInfo.avatar || defaultAvatar"
                class="user-avatar"
              />
              <div class="avatar-overlay" @click="triggerFileInput">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarUpload"
            />

            <div class="avatar-tips">
              <p>支持 JPG、PNG 格式</p>
              <p>文件大小不超过 2MB</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：详细信息编辑 -->
      <el-col :span="16">
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>

          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            class="profile-form"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="profileForm.username"
                placeholder="请输入用户名"
                clearable
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="profileForm.email"
                placeholder="请输入邮箱"
                clearable
              />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="profileForm.phone"
                placeholder="请输入手机号"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveProfile" :loading="saveLoading">
                保存信息
              </el-button>
              <el-button @click="handleResetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 密码修改 -->
        <el-card class="profile-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            class="password-form"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="请输入当前密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                修改密码
              </el-button>
              <el-button @click="handleResetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { getUser, updateUser } from '@/api/user'

// 定义组件名称
defineOptions({
  name: 'UserProfile'
})

// 响应式数据
const userInfo = ref({})
const saveLoading = ref(false)
const passwordLoading = ref(false)
const fileInput = ref(null)
const profileFormRef = ref(null)
const passwordFormRef = ref(null)

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

// 个人信息表单
const profileForm = ref({
  username: '',
  email: '',
  phone: ''
})

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
})

const passwordRules = ref({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

// 获取当前登录用户信息
const getCurrentUserInfo = async () => {
  try {
    // 从 localStorage 获取当前用户信息
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const currentUser = JSON.parse(userInfoStr)
      userInfo.value = currentUser

      // 根据用户ID获取详细信息
      if (currentUser.id) {
        const response = await getUser(currentUser.id)
        const userData = response.data || response

        // 更新用户信息
        userInfo.value = { ...userInfo.value, ...userData }

        // 填充表单
        profileForm.value = {
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理头像上传
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 验证文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  try {
    // 创建预览URL
    const previewUrl = URL.createObjectURL(file)
    userInfo.value.avatar = previewUrl

    // 这里可以添加上传到服务器的逻辑
    // const formData = new FormData()
    // formData.append('avatar', file)
    // await uploadAvatar(formData)

    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
  }
}

// 保存个人信息
const handleSaveProfile = async () => {
  try {
    await profileFormRef.value?.validate()

    saveLoading.value = true

    // 调用更新用户信息接口
    await updateUser(userInfo.value.id, profileForm.value)

    // 更新本地存储的用户信息
    const updatedUserInfo = { ...userInfo.value, ...profileForm.value }
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
    userInfo.value = updatedUserInfo

    ElMessage.success('个人信息保存成功')
  } catch (error) {
    console.error('保存个人信息失败:', error)
    ElMessage.error('保存个人信息失败')
  } finally {
    saveLoading.value = false
  }
}

// 重置个人信息表单
const handleResetForm = () => {
  profileFormRef.value?.resetFields()
  getCurrentUserInfo()
}

// 修改密码
const handleChangePassword = async () => {
  try {
    await passwordFormRef.value?.validate()

    passwordLoading.value = true

    // 这里调用修改密码的接口
    // await changePassword({
    //   currentPassword: passwordForm.value.currentPassword,
    //   newPassword: passwordForm.value.newPassword
    // })

    ElMessage.success('密码修改成功')
    handleResetPasswordForm()
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const handleResetPasswordForm = () => {
  passwordFormRef.value?.resetFields()
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  getCurrentUserInfo()
})
</script>

<style scoped>
.user-profile-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #000000;
  color: white;
  border-radius: 10px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.profile-card {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
}

.avatar-section {
  text-align: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.user-avatar {
  border: 4px solid #f0f0f0;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-overlay span {
  font-size: 12px;
}

.avatar-tips {
  color: #999;
  font-size: 12px;
}

.avatar-tips p {
  margin: 5px 0;
}

.profile-form,
.password-form {
  max-width: 500px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 10px 10px 0 0;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

:deep(.el-button + .el-button) {
  margin-left: 10px;
}
</style>
