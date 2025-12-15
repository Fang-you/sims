<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <el-menu
        :default-active="$route.path"
        :unique-opened="true"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleMenuSelect"
      >
        <!-- 首页菜单 -->
        <el-menu-item index="/dashboard">
          <el-icon><Promotion /></el-icon> 首页
        </el-menu-item>

        <!-- 图书管理 -->
        <el-menu-item index="/dashboard/books">
          <el-icon><Reading /></el-icon> 图书管理
        </el-menu-item>

        <!-- 用户管理 -->
        <el-menu-item index="/dashboard/users">
          <el-icon><User /></el-icon> 用户管理
        </el-menu-item>

        <!-- 借阅管理 -->
        <el-menu-item index="/dashboard/borrow">
          <el-icon><DocumentCopy /></el-icon> 借阅管理
        </el-menu-item>

        <!-- 数据统计管理 -->
        <el-sub-menu index="/dashboard/report">
          <template #title>
            <el-icon><Histogram /></el-icon>数据统计管理
          </template>
          <el-menu-item index="/dashboard/report/user-visual">
            <el-icon><TrendCharts /></el-icon>用户可视化分析
          </el-menu-item>
          <el-menu-item index="/dashboard/report/book-visual">
            <el-icon><DataAnalysis /></el-icon>图书可视化显示
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 头部导航栏 -->
      <div class="header">

        <div class="header-title">
          <h2>图书管理系统</h2>
        </div>

        <div class="header-right">
          <el-button @click="goToProfile" type="text" style="margin-right: 10px;">
            <el-icon><User /></el-icon>
            个人信息
          </el-button>
          <el-button @click="logout">退出登录</el-button>
          <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" size="20px" style="margin-left: 20px;" />
        </div>
      </div>

      <!-- 页面内容区域 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

// 导入需要的图标
import {
  Promotion,
  Histogram,
  Reading,
  User,
  DocumentCopy,
  TrendCharts,
  DataAnalysis,
} from '@element-plus/icons-vue'

const router = useRouter()

// 处理菜单选择
const handleMenuSelect = (index) => {
  // 手动导航到选中的路由
  router.push(index).catch(err => {
    console.error('路由跳转失败:', err)
  })
}

// 跳转到个人信息页面
const goToProfile = () => {
  router.push('/dashboard/profile')
}

// 退出登录
const logout = async () => {
  try {
    // 顯示確認對話框
    await ElMessageBox.confirm(
      '你确认要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    )

    // 用戶確認後執行退出操作
    // 清除本地存储的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')

    // 顯示成功消息
    ElMessage.success('已成功退出登录')

    // 跳转到登录页
    router.push('/login')
  } catch {
    // 用戶取消退出，不做任何操作
    console.log('用户取消退出登录')
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #545c64;
  height: 100%;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-title h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 菜单样式调整 */
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-sub-menu .el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
}
.header-right {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.header-actions {
  margin-right: 10px;
}
</style>
