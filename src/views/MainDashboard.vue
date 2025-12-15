<template>
  <div class="dashboard">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>系统首页</h2>
      <p>欢迎使用学生信息管理系统，这里是您的工作台</p>
    </div>

    <!-- 统计卡片区域 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card books-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="32"><Reading /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statsData.totalBooks }}</div>
              <div class="stats-label">图书总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card users-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="32"><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statsData.totalUsers }}</div>
              <div class="stats-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card borrows-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="32"><DocumentCopy /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statsData.totalBorrows }}</div>
              <div class="stats-label">借阅记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card active-card">
          <div class="stats-content">
            <div class="stats-icon">
              <el-icon size="32"><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-number">{{ statsData.activeBorrows }}</div>
              <div class="stats-label">借阅中</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作区域 -->
    <el-row :gutter="20" class="quick-actions-row">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="navigateTo('/books')">
              <el-icon><Reading /></el-icon>
              图书管理
            </el-button>
            <el-button type="success" size="large" @click="navigateTo('/users')">
              <el-icon><User /></el-icon>
              用户管理
            </el-button>
            <el-button type="warning" size="large" @click="navigateTo('/borrow')">
              <el-icon><DocumentCopy /></el-icon>
              借阅管理
            </el-button>
            <el-button type="info" size="large" @click="navigateTo('/report/book-visual')">
              <el-icon><DataAnalysis /></el-icon>
              数据统计
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表和列表区域 -->
    <el-row :gutter="20" class="charts-row">
      <!-- 库存状态图表 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>图书库存状态</span>
            </div>
          </template>
          <div ref="stockChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <!-- 月度借阅趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>借阅趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新动态区域 -->
    <el-row :gutter="20" class="activities-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新借阅记录</span>
              <el-button type="text" size="small" @click="navigateTo('/borrows')">
                查看更多
              </el-button>
            </div>
          </template>
          <div class="activity-list">
            <div v-for="record in recentBorrows" :key="record.id" class="activity-item">
              <div class="activity-icon">
                <el-icon><DocumentCopy /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ record.bookTitle }}</div>
                <div class="activity-desc">{{ record.userName }} 借阅于 {{ formatDate(record.borrowDate) }}</div>
              </div>
            </div>
            <div v-if="!recentBorrows.length" class="empty-state">
              <el-empty description="暂无借阅记录" :image-size="80" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统通知</span>
            </div>
          </template>
          <div class="notification-list">
            <div class="notification-item">
              <div class="notification-icon warning">
                <el-icon><Warning /></el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">库存不足提醒</div>
                <div class="notification-desc">{{ lowStockCount }} 本图书库存不足，请及时补充</div>
              </div>
            </div>
            <div class="notification-item">
              <div class="notification-icon info">
                <el-icon><InfoFilled /></el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">系统状态</div>
                <div class="notification-desc">系统运行正常，所有功能可正常使用</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  Reading,
  User,
  DocumentCopy,
  Clock,
  DataAnalysis,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'
import { getBooks } from '@/api/book'
import { queryUsers } from '@/api/user'
import { queryBorrowRecords } from '@/api/borrowRecord'

const router = useRouter()

// 图表容器引用
const stockChartRef = ref(null)
const trendChartRef = ref(null)

// 图表实例
let stockChart = null
let trendChart = null

// 统计数据
const statsData = ref({
  totalBooks: 0,
  totalUsers: 0,
  totalBorrows: 0,
  activeBorrows: 0
})

// 最新借阅记录
const recentBorrows = ref([])

// 低库存图书数量
const lowStockCount = ref(0)

// 导航函数
const navigateTo = (path) => {
  router.push(path)
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 初始化库存状态图表
const initStockChart = () => {
  if (!stockChartRef.value) return

  stockChart = echarts.init(stockChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 本 ({d}%)'
    },
    series: [{
      name: '库存状态',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '50%'],
      data: [
        { name: '库存充足(>10)', value: 0, itemStyle: { color: '#67C23A' } },
        { name: '库存一般(5-10)', value: 0, itemStyle: { color: '#409EFF' } },
        { name: '库存较少(1-5)', value: 0, itemStyle: { color: '#E6A23C' } },
        { name: '缺货(0)', value: 0, itemStyle: { color: '#F56C6C' } }
      ],
      label: {
        show: true,
        position: 'outside'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  stockChart.setOption(option)
}

// 初始化借阅趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 次'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['一月', '二月', '三月', '四月', '五月', '六月'],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'line',
      data: [0, 0, 0, 0, 0, 0],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#409EFF'
      },
      lineStyle: {
        width: 3
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(64, 158, 255, 0.3)'
          }, {
            offset: 1, color: 'rgba(64, 158, 255, 0.1)'
          }]
        }
      }
    }]
  }
  trendChart.setOption(option)
}

// 分析库存状态
const analyzeStockStatus = (books) => {
  const stockCounts = {
    abundant: 0,  // >10
    normal: 0,    // 5-10
    low: 0,       // 1-5
    empty: 0      // 0
  }

  books.forEach(book => {
    const quantity = book.quantity || 0
    if (quantity > 10) {
      stockCounts.abundant++
    } else if (quantity >= 5) {
      stockCounts.normal++
    } else if (quantity >= 1) {
      stockCounts.low++
    } else {
      stockCounts.empty++
    }
  })

  // 更新库存图表
  if (stockChart) {
    stockChart.setOption({
      series: [{
        data: [
          { name: '库存充足(>10)', value: stockCounts.abundant, itemStyle: { color: '#67C23A' } },
          { name: '库存一般(5-10)', value: stockCounts.normal, itemStyle: { color: '#409EFF' } },
          { name: '库存较少(1-5)', value: stockCounts.low, itemStyle: { color: '#E6A23C' } },
          { name: '缺货(0)', value: stockCounts.empty, itemStyle: { color: '#F56C6C' } }
        ]
      }]
    })
  }

  // 计算低库存数量
  lowStockCount.value = stockCounts.low + stockCounts.empty
}

// 分析借阅趋势
const analyzeBorrowTrend = (borrowRecords) => {
  const currentDate = new Date()
  const monthlyData = [0, 0, 0, 0, 0, 0] // 最近6个月

  borrowRecords.forEach(record => {
    if (record.borrowDate) {
      const borrowDate = new Date(record.borrowDate)
      const monthDiff = (currentDate.getFullYear() - borrowDate.getFullYear()) * 12 +
                       (currentDate.getMonth() - borrowDate.getMonth())

      if (monthDiff >= 0 && monthDiff < 6) {
        monthlyData[5 - monthDiff]++
      }
    }
  })

  // 更新趋势图表
  if (trendChart) {
    trendChart.setOption({
      series: [{
        data: monthlyData
      }]
    })
  }
}

// 获取最新借阅记录
const getRecentBorrows = (borrowRecords, books, users) => {
  // 创建图书和用户映射
  const bookMap = {}
  const userMap = {}

  books.forEach(book => {
    bookMap[book.id] = book.title || book.name || `图书${book.id}`
  })

  users.forEach(user => {
    userMap[user.id] = user.username || user.name || `用户${user.id}`
  })

  // 获取最新的5条记录
  const recent = borrowRecords
    .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
    .slice(0, 5)
    .map(record => ({
      id: record.id,
      bookTitle: bookMap[record.bookId] || '未知图书',
      userName: userMap[record.userId] || '未知用户',
      borrowDate: record.borrowDate
    }))

  recentBorrows.value = recent
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const [booksResponse, usersResponse, borrowsResponse] = await Promise.all([
      getBooks(),
      queryUsers(),
      queryBorrowRecords()
    ])

    const books = booksResponse.data || booksResponse || []
    const users = usersResponse.data || usersResponse || []
    const borrows = borrowsResponse.data || borrowsResponse || []


    // 更新统计数据
    statsData.value = {
      totalBooks: books.length,
      totalUsers: users.length,
      totalBorrows: borrows.length,
      activeBorrows: borrows.filter(b => !b.returnDate).length
    }

    // 分析数据并更新图表
    analyzeStockStatus(books)
    analyzeBorrowTrend(borrows)
    getRecentBorrows(borrows, books, users)

  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 窗口大小变化处理
const handleResize = () => {
  stockChart?.resize()
  trendChart?.resize()
}

// 组件挂载
onMounted(async () => {
  await nextTick()

  // 初始化图表
  initStockChart()
  initTrendChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 获取数据
  await fetchStats()
})

// 组件卸载
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  stockChart?.dispose()
  trendChart?.dispose()
  stockChart = null
  trendChart = null
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

/* 页面标题 */
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
}

.books-card .stats-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.users-card .stats-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.borrows-card .stats-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.active-card .stats-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  line-height: 1;
  margin-bottom: 4px;
}

.stats-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 快捷操作 */
.quick-actions-row {
  margin-bottom: 20px;
}

.quick-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  min-width: 120px;
  height: 50px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
}

/* 活动区域 */
.activities-row {
  margin-bottom: 20px;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e7f4ff;
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  margin-top: 2px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 通知区域 */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  margin-top: 2px;
}

.notification-icon.warning {
  background-color: #fef0e6;
  color: #e6a23c;
}

.notification-icon.info {
  background-color: #e7f4ff;
  color: #409eff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 0;
}

/* 卡片标题 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

/* Element Plus 卡片样式优化 */
:deep(.el-card) {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  border: none;
}

:deep(.el-card__header) {
  background-color: #fafbfc;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    margin-bottom: 20px;
  }

  .quick-actions .el-button {
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .stats-content {
    flex-direction: column;
    text-align: center;
  }

  .stats-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .el-button {
    flex: none;
    width: 100%;
  }

  .chart-container {
    height: 250px;
    min-height: 250px;
  }

  .page-header h2 {
    font-size: 20px;
  }
}

/* 滚动条美化 */
.activity-list::-webkit-scrollbar,
.notification-list::-webkit-scrollbar {
  width: 4px;
}

.activity-list::-webkit-scrollbar-track,
.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.activity-list::-webkit-scrollbar-thumb,
.notification-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.activity-list::-webkit-scrollbar-thumb:hover,
.notification-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
