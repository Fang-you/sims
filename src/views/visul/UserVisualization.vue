<template>
  <div class="user-visualization-container">
    <div class="page-header">
      <h2>用户行为可视化分析</h2>
      <p>深入分析用户借阅行为、活跃度和偏好特征</p>
    </div>

    <!-- 用户统计概览 -->
    <div class="stats-overview-section">
      <div class="section-header">
        <h3>用户统计概览</h3>
        <p>用户基本信息和借阅行为统计</p>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.totalUsers }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.activeUsers }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.totalBorrows }}</div>
              <div class="stat-label">总借阅次数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-value">{{ userStats.avgBorrowsPerUser }}</div>
              <div class="stat-label">人均借阅次数</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 用户借阅行为分析 -->
    <div class="user-behavior-section">
      <div class="section-header">
        <h3>用户借阅行为分析</h3>
        <p>分析用户借阅模式和行为特征</p>
      </div>

      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>用户借阅活跃度</span>
              </div>
            </template>
            <div ref="userActivityChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>借阅状态分布</span>
              </div>
            </template>
            <div ref="borrowStatusChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 活跃用户排行榜 -->
    <div class="active-users-section">
      <div class="section-header">
        <h3>活跃用户排行榜</h3>
        <p>借阅次数最多的用户排行</p>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>借阅排行榜</span>
              </div>
            </template>
            <div ref="activeUsersChartRef" class="chart-container-large"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>借阅统计概览</span>
              </div>
            </template>
            <div class="stats-overview">
              <div class="stat-item">
                <div class="stat-value">{{ borrowStats.totalBorrows }}</div>
                <div class="stat-label">总借阅次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ borrowStats.activeUsers }}</div>
                <div class="stat-label">活跃用户数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ borrowStats.avgBorrowsPerUser }}</div>
                <div class="stat-label">人均借阅次数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ borrowStats.returnRate }}%</div>
                <div class="stat-label">归还率</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { queryUsers } from '@/api/user'
import { queryBorrowRecords } from '@/api/borrowRecord'

// 图表引用
const userStatusChartRef = ref(null)
const userRoleChartRef = ref(null)
const userActivityChartRef = ref(null)
const borrowStatusChartRef = ref(null)
const borrowTrendChartRef = ref(null)
const userPreferenceChartRef = ref(null)
const activeUsersChartRef = ref(null)

// 图表实例
let userStatusChart = null
let userRoleChart = null
let userActivityChart = null
let borrowStatusChart = null
let borrowTrendChart = null
let userPreferenceChart = null
let activeUsersChart = null

// 数据
const usersData = ref([])
const borrowRecordsData = ref([])
const userStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalBorrows: 0,
  avgBorrowsPerUser: 0
})
const borrowStats = ref({
  totalBorrows: 0,
  activeUsers: 0,
  avgBorrowsPerUser: 0,
  returnRate: 0
})

// 样例数据
const sampleData = {
  userStatus: [
    { name: '正常', value: 45 },
    { name: '禁用', value: 5 }
  ],
  userRole: [
    { name: '学生', value: 35 },
    { name: '教师', value: 10 },
    { name: '管理员', value: 5 }
  ],
  userActivity: [
    { name: '高活跃度(>10次)', value: 8 },
    { name: '中活跃度(5-10次)', value: 15 },
    { name: '低活跃度(1-5次)', value: 20 },
    { name: '无借阅记录', value: 7 }
  ],
  borrowStatus: [
    { name: '已归还', value: 120 },
    { name: '借阅中', value: 30 },
    { name: '逾期', value: 5 }
  ],
  borrowTrend: [
    { name: '1月', value: 25 },
    { name: '2月', value: 30 },
    { name: '3月', value: 35 },
    { name: '4月', value: 28 },
    { name: '5月', value: 40 },
    { name: '6月', value: 45 }
  ],
  userPreference: [
    { name: '文学类', value: 35 },
    { name: '科技类', value: 25 },
    { name: '历史类', value: 20 },
    { name: '艺术类', value: 15 },
    { name: '其他', value: 5 }
  ],
  activeUsers: [
    { name: '张三', value: 15 },
    { name: '李四', value: 12 },
    { name: '王五', value: 10 },
    { name: '赵六', value: 8 },
    { name: '钱七', value: 6 }
  ]
}


// 分析用户借阅活跃度
const analyzeUserActivity = (users, borrowRecords) => {
  if (!users.length || !borrowRecords.length) return sampleData.userActivity

  const userBorrowCounts = {}
  borrowRecords.forEach(record => {
    const userId = record.userId
    userBorrowCounts[userId] = (userBorrowCounts[userId] || 0) + 1
  })

  const activityCounts = { high: 0, medium: 0, low: 0, none: 0 }
  users.forEach(user => {
    const borrowCount = userBorrowCounts[user.id] || 0
    if (borrowCount > 10) {
      activityCounts.high++
    } else if (borrowCount >= 5) {
      activityCounts.medium++
    } else if (borrowCount > 0) {
      activityCounts.low++
    } else {
      activityCounts.none++
    }
  })

  return [
    { name: '高活跃度(>10次)', value: activityCounts.high },
    { name: '中活跃度(5-10次)', value: activityCounts.medium },
    { name: '低活跃度(1-5次)', value: activityCounts.low },
    { name: '无借阅记录', value: activityCounts.none }
  ]
}

// 分析借阅状态分布
const analyzeBorrowStatus = (borrowRecords) => {
  if (!borrowRecords.length) return sampleData.borrowStatus

  const statusCounts = { returned: 0, borrowing: 0, overdue: 0 }
  borrowRecords.forEach(record => {
    if (record.status === 'returned') {
      statusCounts.returned++
    } else if (record.status === 'borrowing') {
      statusCounts.borrowing++
    } else {
      statusCounts.overdue++
    }
  })

  return [
    { name: '已归还', value: statusCounts.returned },
    { name: '借阅中', value: statusCounts.borrowing },
    { name: '逾期', value: statusCounts.overdue }
  ]
}

// 分析月度借阅趋势
const analyzeBorrowTrend = (borrowRecords) => {
  if (!borrowRecords.length) return sampleData.borrowTrend

  const monthlyCounts = {}
  borrowRecords.forEach(record => {
    const month = new Date(record.borrowDate).getMonth() + 1
    monthlyCounts[month] = (monthlyCounts[month] || 0) + 1
  })

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  return months.map((month, index) => ({
    name: month,
    value: monthlyCounts[index + 1] || 0
  }))
}

// 分析用户借阅偏好
const analyzeUserPreference = (borrowRecords) => {
  if (!borrowRecords.length) return sampleData.userPreference

  const categoryCounts = {}
  borrowRecords.forEach(record => {
    const category = record.bookCategory || '其他'
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  return Object.entries(categoryCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

// 分析活跃用户排行榜
const analyzeActiveUsers = (users, borrowRecords) => {
  if (!users.length || !borrowRecords.length) return sampleData.activeUsers

  const userBorrowCounts = {}
  borrowRecords.forEach(record => {
    const userId = record.userId
    userBorrowCounts[userId] = (userBorrowCounts[userId] || 0) + 1
  })

  const userMap = {}
  users.forEach(user => {
    userMap[user.id] = user.username
  })

  return Object.entries(userBorrowCounts)
    .map(([userId, count]) => ({
      name: userMap[userId] || `用户${userId}`,
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

// 计算统计数据
const calculateStats = (users, borrowRecords) => {
  const totalUsers = users.length
  const totalBorrows = borrowRecords.length

  // 计算活跃用户数（有借阅记录的用户）
  const activeUserIds = new Set(borrowRecords.map(record => record.userId))
  const activeUsers = activeUserIds.size

  // 计算人均借阅次数
  const avgBorrowsPerUser = activeUsers > 0 ? (totalBorrows / activeUsers).toFixed(1) : 0

  // 计算归还率
  const returnedCount = borrowRecords.filter(record => record.status === 'returned').length
  const returnRate = totalBorrows > 0 ? ((returnedCount / totalBorrows) * 100).toFixed(1) : 0

  return {
    totalUsers,
    activeUsers,
    totalBorrows,
    avgBorrowsPerUser,
    returnRate
  }
}

// 初始化用户状态分布图表
const initUserStatusChart = () => {
  if (!userStatusChartRef.value) return

  userStatusChart = echarts.init(userStatusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户状态',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  userStatusChart.setOption(option)
}

// 初始化用户角色分布图表
const initUserRoleChart = () => {
  if (!userRoleChartRef.value) return

  userRoleChart = echarts.init(userRoleChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户角色',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  userRoleChart.setOption(option)
}

// 初始化用户活跃度图表
const initUserActivityChart = () => {
  if (!userActivityChartRef.value) return

  userActivityChart = echarts.init(userActivityChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户活跃度',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  userActivityChart.setOption(option)
}

// 初始化借阅状态分布图表
const initBorrowStatusChart = () => {
  if (!borrowStatusChartRef.value) return

  borrowStatusChart = echarts.init(borrowStatusChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '借阅状态',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  borrowStatusChart.setOption(option)
}

// 初始化借阅趋势图表
const initBorrowTrendChart = () => {
  if (!borrowTrendChartRef.value) return

  borrowTrendChart = echarts.init(borrowTrendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '借阅次数',
        type: 'line',
        data: [],
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  borrowTrendChart.setOption(option)
}

// 初始化用户偏好图表
const initUserPreferenceChart = () => {
  if (!userPreferenceChartRef.value) return

  userPreferenceChart = echarts.init(userPreferenceChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '借阅偏好',
        type: 'pie',
        radius: '50%',
        data: [],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  userPreferenceChart.setOption(option)
}

// 初始化活跃用户排行榜图表
const initActiveUsersChart = () => {
  if (!activeUsersChartRef.value) return

  activeUsersChart = echarts.init(activeUsersChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: []
    },
    series: [
      {
        name: '借阅次数',
        type: 'bar',
        data: [],
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
  activeUsersChart.setOption(option)
}

// 更新用户状态分布图表
const updateUserStatusChart = (data) => {
  if (userStatusChart) {
    userStatusChart.setOption({
      series: [{
        data: data
      }]
    })
  }
}

// 更新用户角色分布图表
const updateUserRoleChart = (data) => {
  if (userRoleChart) {
    userRoleChart.setOption({
      series: [{
        data: data
      }]
    })
  }
}

// 更新用户活跃度图表
const updateUserActivityChart = (data) => {
  if (userActivityChart) {
    userActivityChart.setOption({
      series: [{
        data: data
      }]
    })
  }
}

// 更新借阅状态分布图表
const updateBorrowStatusChart = (data) => {
  if (borrowStatusChart) {
    borrowStatusChart.setOption({
      series: [{
        data: data
      }]
    })
  }
}

// 更新借阅趋势图表
const updateBorrowTrendChart = (data) => {
  if (borrowTrendChart) {
    const names = data.map(item => item.name)
    const values = data.map(item => item.value)
    borrowTrendChart.setOption({
      xAxis: {
        data: names
      },
      series: [{
        data: values
      }]
    })
  }
}

// 更新用户偏好图表
const updateUserPreferenceChart = (data) => {
  if (userPreferenceChart) {
    userPreferenceChart.setOption({
      series: [{
        data: data
      }]
    })
  }
}

// 更新活跃用户排行榜图表
const updateActiveUsersChart = (data) => {
  if (activeUsersChart) {
    const names = data.map(item => item.name)
    const values = data.map(item => item.value)
    activeUsersChart.setOption({
      yAxis: {
        data: names
      },
      series: [{
        data: values
      }]
    })
  }
}

// 获取并处理用户数据
const fetchUserData = async () => {
  try {
    const [usersResponse, borrowRecordsResponse] = await Promise.all([
      queryUsers(),
      queryBorrowRecords()
    ])

    usersData.value = usersResponse.data || usersResponse || []
    borrowRecordsData.value = borrowRecordsResponse.data || borrowRecordsResponse || []

    if (usersData.value.length > 0) {

      // 分析用户借阅活跃度
      const userActivityData = analyzeUserActivity(usersData.value, borrowRecordsData.value)
      updateUserActivityChart(userActivityData)

      // 分析借阅状态分布
      const borrowStatusData = analyzeBorrowStatus(borrowRecordsData.value)
      updateBorrowStatusChart(borrowStatusData)

      // 分析月度借阅趋势
      const borrowTrendData = analyzeBorrowTrend(borrowRecordsData.value)
      updateBorrowTrendChart(borrowTrendData)

      // 分析用户借阅偏好
      const userPreferenceData = analyzeUserPreference(borrowRecordsData.value)
      updateUserPreferenceChart(userPreferenceData)

      // 分析活跃用户排行榜
      const activeUsersData = analyzeActiveUsers(usersData.value, borrowRecordsData.value)
      updateActiveUsersChart(activeUsersData)

      // 计算统计数据
      const stats = calculateStats(usersData.value, borrowRecordsData.value)
      userStats.value = stats
      borrowStats.value = stats
    } else {
      // 使用样例数据
      updateUserStatusChart(sampleData.userStatus)
      updateUserRoleChart(sampleData.userRole)
      updateUserActivityChart(sampleData.userActivity)
      updateBorrowStatusChart(sampleData.borrowStatus)
      updateBorrowTrendChart(sampleData.borrowTrend)
      updateUserPreferenceChart(sampleData.userPreference)
      updateActiveUsersChart(sampleData.activeUsers)

      // 设置样例统计数据
      userStats.value = {
        totalUsers: 50,
        activeUsers: 43,
        totalBorrows: 155,
        avgBorrowsPerUser: 3.6
      }
      borrowStats.value = {
        totalBorrows: 155,
        activeUsers: 43,
        avgBorrowsPerUser: 3.6,
        returnRate: 87.1
      }
    }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    // 使用样例数据
    updateUserStatusChart(sampleData.userStatus)
    updateUserRoleChart(sampleData.userRole)
    updateUserActivityChart(sampleData.userActivity)
    updateBorrowStatusChart(sampleData.borrowStatus)
    updateBorrowTrendChart(sampleData.borrowTrend)
    updateUserPreferenceChart(sampleData.userPreference)
    updateActiveUsersChart(sampleData.activeUsers)

    // 设置样例统计数据
    userStats.value = {
      totalUsers: 50,
      activeUsers: 43,
      totalBorrows: 155,
      avgBorrowsPerUser: 3.6
    }
    borrowStats.value = {
      totalBorrows: 155,
      activeUsers: 43,
      avgBorrowsPerUser: 3.6,
      returnRate: 87.1
    }
  }
}

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()

  // 初始化所有图表
  initUserStatusChart()
  initUserRoleChart()
  initUserActivityChart()
  initBorrowStatusChart()
  initBorrowTrendChart()
  initUserPreferenceChart()
  initActiveUsersChart()

  // 获取数据
  await fetchUserData()
})
</script>

<style scoped>
.user-visualization-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.section-header {
  margin-bottom: 20px;
  text-align: center;
}

.section-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stats-overview-section {
  margin-bottom: 30px;
}

.stat-card {
  text-align: center;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.chart-container-large {
  height: 400px;
  width: 100%;
}

.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #67C23A;
  margin-bottom: 5px;
}

.stat-item .stat-label {
  font-size: 12px;
  color: #666;
}

.user-distribution-section,
.user-behavior-section,
.active-users-section {
  margin-bottom: 30px;
}

:deep(.el-card) {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 10px 10px 0 0;
}
</style>
