<template>
  <div class="book-visualization">
    <div class="page-header">
      <h2>图书可视化显示</h2>
      <p>以图表形式展示图书相关数据统计信息</p>
    </div>

    <div class="content-area">
      <!-- 图书分类统计饼状图 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>图书分类统计</span>
              </div>
            </template>
            <div ref="categoryChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
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
      </el-row>


      <!-- 热门图书排行榜 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>热门图书排行榜</span>
              </div>
            </template>
            <div ref="popularChartRef" class="chart-container-large"></div>
          </el-card>
        </el-col>
      </el-row>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getBooks } from '@/api/book'
import { queryBorrowRecords } from '@/api/borrowRecord'
import { queryUsers } from '@/api/user'

// 图表容器引用
const categoryChartRef = ref(null)
const stockChartRef = ref(null)
const trendChartRef = ref(null)
const popularChartRef = ref(null)
// 用户借阅相关图表引用
const userActivityChartRef = ref(null)
const borrowStatusChartRef = ref(null)
const borrowTrendChartRef = ref(null)
const userPreferenceChartRef = ref(null)
const activeUsersChartRef = ref(null)

// 图表实例
let categoryChart = null
let stockChart = null
let trendChart = null
let popularChart = null
// 用户借阅相关图表实例
let userActivityChart = null
let borrowStatusChart = null
let borrowTrendChart = null
let userPreferenceChart = null
let activeUsersChart = null

// 真实数据存储
const booksData = ref([])
const borrowRecordsData = ref([])
const stockStatusData = ref([])
const popularBooksData = ref([])
// 用户借阅相关数据
const usersData = ref([])
const userActivityData = ref([])
const borrowStatusData = ref([])

const activeUsersData = ref([])
const borrowStats = ref({
  totalBorrows: 0,
  activeUsers: 0,
  avgBorrowsPerUser: 0,
  returnRate: 0
})

// 模拟数据（用于展示）
const sampleData = {
  categories: [
    { name: '文学', value: 120 },
    { name: '科学技术', value: 89 },
    { name: '历史', value: 67 },
    { name: '艾术', value: 45 },
    { name: '哲学', value: 38 },
    { name: '其他', value: 52 }
  ],
  stockStatus: [
    { name: '库存充足(>10)', value: 156 },
    { name: '库存一般(5-10)', value: 89 },
    { name: '库存较少(1-5)', value: 45 },
    { name: '缺货(0)', value: 23 }
  ],
  monthlyTrend: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data: [12, 19, 15, 23, 18, 25, 31, 28, 24, 20, 17, 22]
  },
  popularBooks: [
    { name: '《三体》', value: 45 },
    { name: '《百年孤独》', value: 38 },
    { name: '《1984》', value: 32 },
    { name: '《红楼梦》', value: 28 },
    { name: '《人类简史》', value: 25 },
    { name: '《影响力》', value: 22 },
    { name: '《程序员修炼之道》', value: 20 },
    { name: '《设计模式》', value: 18 }
  ],
  // 用户借阅相关模拟数据
  userActivity: [
    { name: '高频用户(>10次)', value: 25 },
    { name: '中频用户(5-10次)', value: 68 },
    { name: '低频用户(1-5次)', value: 142 },
    { name: '新用户(0次)', value: 45 }
  ],
  borrowStatus: [
    { name: '已归还', value: 156 },
    { name: '借阅中', value: 89 },
    { name: '逾期未还', value: 12 },
    { name: '即将到期', value: 23 }
  ],
  borrowTrend: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    data: [45, 52, 48, 67, 73, 89, 95, 88, 76, 82, 78, 85]
  },
  userPreference: [
    { name: '文学类', value: 35 },
    { name: '科技类', value: 28 },
    { name: '历史类', value: 22 },
    { name: '艺术类', value: 18 },
    { name: '哲学类', value: 15 },
    { name: '其他', value: 12 }
  ],
  activeUsers: [
    { name: '张三', value: 23 },
    { name: '李四', value: 19 },
    { name: '王五', value: 17 },
    { name: '赵六', value: 15 },
    { name: '钱七', value: 13 },
    { name: '孙八', value: 11 },
    { name: '周九', value: 9 },
    { name: '吴十', value: 8 }
  ]
}

// 初始化图书分类饼状图
const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)
  const option = {
    title: {
      text: '图书分类分布',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 本 ({d}%)'
    },
    series: [{
      name: '图书分类',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: sampleData.categories
    }]
  }
  categoryChart.setOption(option)
}

// 分析图书库存状态
const analyzeStockStatus = (books) => {
  const stockCounts = {
    abundant: 0,  // 库存充足 >10
    normal: 0,    // 库存一般 5-10
    low: 0,       // 库存较少 1-5
    empty: 0      // 缺货 0
  }

  books.forEach(book => {
    const quantity = book.quantity || 0
    if (quantity > 10) {
      stockCounts.abundant++
    } else if (quantity >= 5 && quantity <= 10) {
      stockCounts.normal++
    } else if (quantity >= 1 && quantity <= 5) {
      stockCounts.low++
    } else {
      stockCounts.empty++
    }
  })


  return [
    { name: '库存充足(>10)', value: stockCounts.abundant },
    { name: '库存一般(5-10)', value: stockCounts.normal },
    { name: '库存较少(1-5)', value: stockCounts.low },
    { name: '缺货(0)', value: stockCounts.empty }
  ]
}

// 初始化库存状态柱状图
const initStockChart = () => {
  if (!stockChartRef.value) return

  stockChart = echarts.init(stockChartRef.value)
  // 使用初始的样例数据
  updateStockChart(sampleData.stockStatus)
}

// 更新库存状态图表
const updateStockChart = (data) => {
  if (!stockChart) return

  const option = {
    title: {
      text: '库存状态统计',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 本'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '图书数量',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '图书数量',
      type: 'bar',
      data: data.map(item => ({
        value: item.value,
        itemStyle: {
          color: item.name.includes('充足') ? '#67C23A' :
                 item.name.includes('一般') ? '#409EFF' :
                 item.name.includes('较少') ? '#E6A23C' : '#F56C6C'
        }
      })),
      barWidth: '50%'
    }]
  }
  stockChart.setOption(option)
}

// 初始化月度趋势线状图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const option = {
    title: {
      text: '2024年月度新增图书趋势',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 本'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sampleData.monthlyTrend.months,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '新增数量',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '新增图书',
      type: 'line',
      data: sampleData.monthlyTrend.data,
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

// 分析借阅记录，统计图书借阅次数
const analyzePopularBooks = (books, borrowRecords) => {
  if (!books.length || !borrowRecords.length) {
    return sampleData.popularBooks
  }

  // 创建图书ID到名称的映射
  const bookMap = {}
  books.forEach(book => {
    bookMap[book.id] = book.title || book.name || `图书${book.id}`
  })

  // 统计每本图书的借阅次数
  const borrowCounts = {}
  borrowRecords.forEach(record => {
    const bookId = record.bookId || record.book_id
    if (bookId && bookMap[bookId]) {
      borrowCounts[bookId] = (borrowCounts[bookId] || 0) + 1
    }
  })

  // 转换为数组并按借阅次数排序
  const popularList = Object.entries(borrowCounts)
    .map(([bookId, count]) => ({
      name: bookMap[bookId],
      value: count,
      bookId: bookId
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // 取前8名

  return popularList
}

// 初始化热门图书排行榜
const initPopularChart = () => {
  if (!popularChartRef.value) return

  popularChart = echarts.init(popularChartRef.value)
  // 使用初始的样例数据
  updatePopularChart(sampleData.popularBooks)
}

// 更新热门图书排行榜
const updatePopularChart = (data) => {
  if (!popularChart) return

  const option = {
    title: {
      text: '热门图书借阅排行榜',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 次'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '借阅次数',
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name),
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'bar',
      data: data.map(item => item.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#ffecd2' },
          { offset: 1, color: '#fcb69f' }
        ])
      },
      barWidth: '60%'
    }]
  }
  popularChart.setOption(option)
}

// ========== 用户借阅相关图表初始化函数 ==========

// 初始化用户借阅活跃度图表
const initUserActivityChart = () => {
  if (!userActivityChartRef.value) return

  userActivityChart = echarts.init(userActivityChartRef.value)
  const option = {
    title: {
      text: '用户借阅活跃度分布',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 人 ({d}%)'
    },
    series: [{
      name: '用户活跃度',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: sampleData.userActivity.map(item => ({
        ...item,
        itemStyle: {
          color: item.name.includes('高频') ? '#67C23A' :
                 item.name.includes('中频') ? '#409EFF' :
                 item.name.includes('低频') ? '#E6A23C' : '#909399'
        }
      }))
    }]
  }
  userActivityChart.setOption(option)
}

// 初始化借阅状态分布图表
const initBorrowStatusChart = () => {
  if (!borrowStatusChartRef.value) return

  borrowStatusChart = echarts.init(borrowStatusChartRef.value)
  const option = {
    title: {
      text: '借阅状态分布',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 本 ({d}%)'
    },
    series: [{
      name: '借阅状态',
      type: 'doughnut',
      radius: ['40%', '70%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'outside'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: true
      },
      data: sampleData.borrowStatus.map(item => ({
        ...item,
        itemStyle: {
          color: item.name.includes('已归还') ? '#67C23A' :
                 item.name.includes('借阅中') ? '#409EFF' :
                 item.name.includes('逾期') ? '#F56C6C' : '#E6A23C'
        }
      }))
    }]
  }
  borrowStatusChart.setOption(option)
}

// 初始化借阅趋势图表
const initBorrowTrendChart = () => {
  if (!borrowTrendChartRef.value) return

  borrowTrendChart = echarts.init(borrowTrendChartRef.value)
  const option = {
    title: {
      text: '2024年月度借阅趋势',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 次'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sampleData.borrowTrend.months,
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: '借阅次数',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'line',
      data: sampleData.borrowTrend.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#67C23A'
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
            offset: 0, color: 'rgba(103, 194, 58, 0.3)'
          }, {
            offset: 1, color: 'rgba(103, 194, 58, 0.1)'
          }]
        }
      }
    }]
  }
  borrowTrendChart.setOption(option)
}

// 初始化用户借阅偏好图表
const initUserPreferenceChart = () => {
  if (!userPreferenceChartRef.value) return

  userPreferenceChart = echarts.init(userPreferenceChartRef.value)
  const option = {
    title: {
      text: '用户借阅偏好分析',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 次'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sampleData.userPreference.map(item => item.name),
      axisLabel: {
        fontSize: 12,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '借阅次数',
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'bar',
      data: sampleData.userPreference.map(item => ({
        value: item.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ffecd2' },
            { offset: 1, color: '#fcb69f' }
          ])
        }
      })),
      barWidth: '50%'
    }]
  }
  userPreferenceChart.setOption(option)
}

// 初始化活跃用户排行榜图表
const initActiveUsersChart = () => {
  if (!activeUsersChartRef.value) return

  activeUsersChart = echarts.init(activeUsersChartRef.value)
  const option = {
    title: {
      text: '活跃用户借阅排行榜',
      left: 'center',
      textStyle: {
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c} 次'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '借阅次数',
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'category',
      data: sampleData.activeUsers.map(item => item.name),
      axisLabel: {
        fontSize: 12
      }
    },
    series: [{
      name: '借阅次数',
      type: 'bar',
      data: sampleData.activeUsers.map(item => item.value),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      barWidth: '60%'
    }]
  }
  activeUsersChart.setOption(option)
}

// 窗口大小变化处理
const handleResize = () => {
  categoryChart?.resize()
  stockChart?.resize()
  trendChart?.resize()
  popularChart?.resize()
  // 用户借阅相关图表
  userActivityChart?.resize()
  borrowStatusChart?.resize()
  borrowTrendChart?.resize()
  userPreferenceChart?.resize()
  activeUsersChart?.resize()
}

// 获取并处理图书数据
const fetchBooksData = async () => {
  try {
    const [booksResponse, borrowRecordsResponse] = await Promise.all([
      getBooks(),
      queryBorrowRecords()
    ])

    // 处理API响应数据
    booksData.value = booksResponse.data || booksResponse || []
    borrowRecordsData.value = borrowRecordsResponse.data || borrowRecordsResponse || []


    if (booksData.value.length > 0) {
      // 分析库存状态
      stockStatusData.value = analyzeStockStatus(booksData.value)

      // 更新库存状态图表
      updateStockChart(stockStatusData.value)
    } else {
      updateStockChart(sampleData.stockStatus)
    }

    // 分析热门图书排行榜
    popularBooksData.value = analyzePopularBooks(booksData.value, borrowRecordsData.value)
    updatePopularChart(popularBooksData.value)

  } catch (error) {
    console.error('获取数据失败:', error)
    updateStockChart(sampleData.stockStatus)
    updatePopularChart(sampleData.popularBooks)
  }
}

// ========== 用户借阅数据分析函数 ==========

// 分析用户借阅活跃度
const analyzeUserActivity = (users, borrowRecords) => {
  if (!users.length || !borrowRecords.length) {
    return sampleData.userActivity
  }

  // 统计每个用户的借阅次数
  const userBorrowCounts = {}
  borrowRecords.forEach(record => {
    const userId = record.userId || record.user_id
    if (userId) {
      userBorrowCounts[userId] = (userBorrowCounts[userId] || 0) + 1
    }
  })

  // 按借阅次数分类用户
  const activityCounts = {
    high: 0,    // >10次
    medium: 0,   // 5-10次
    low: 0,      // 1-5次
    new: 0       // 0次
  }

  users.forEach(user => {
    const borrowCount = userBorrowCounts[user.id] || 0
    if (borrowCount > 10) {
      activityCounts.high++
    } else if (borrowCount >= 5) {
      activityCounts.medium++
    } else if (borrowCount >= 1) {
      activityCounts.low++
    } else {
      activityCounts.new++
    }
  })

  return [
    { name: '高频用户(>10次)', value: activityCounts.high },
    { name: '中频用户(5-10次)', value: activityCounts.medium },
    { name: '低频用户(1-5次)', value: activityCounts.low },
    { name: '新用户(0次)', value: activityCounts.new }
  ]
}

// 分析借阅状态分布
const analyzeBorrowStatus = (borrowRecords) => {
  if (!borrowRecords.length) {
    return sampleData.borrowStatus
  }

  const statusCounts = {
    returned: 0,
    borrowing: 0,
    overdue: 0,
    dueSoon: 0
  }

  const now = new Date()
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  borrowRecords.forEach(record => {
    const returnDate = record.returnDate || record.return_date
    const dueDate = record.dueDate || record.due_date

    if (returnDate) {
      statusCounts.returned++
    } else {
      statusCounts.borrowing++

      // 检查是否逾期或即将到期
      if (dueDate) {
        const due = new Date(dueDate)
        if (due < now) {
          statusCounts.overdue++
        } else if (due <= threeDaysLater) {
          statusCounts.dueSoon++
        }
      }
    }
  })

  return [
    { name: '已归还', value: statusCounts.returned },
    { name: '借阅中', value: statusCounts.borrowing },
    { name: '逾期未还', value: statusCounts.overdue },
    { name: '即将到期', value: statusCounts.dueSoon }
  ]
}

// 分析活跃用户排行榜
const analyzeActiveUsers = (users, borrowRecords) => {
  if (!users.length || !borrowRecords.length) {
    return sampleData.activeUsers
  }

  // 创建用户ID到用户名的映射
  const userMap = {}
  users.forEach(user => {
    userMap[user.id] = user.username || user.name || `用户${user.id}`
  })

  // 统计每个用户的借阅次数
  const userBorrowCounts = {}
  borrowRecords.forEach(record => {
    const userId = record.userId || record.user_id
    if (userId && userMap[userId]) {
      userBorrowCounts[userId] = (userBorrowCounts[userId] || 0) + 1
    }
  })

  // 转换为数组并按借阅次数排序
  const activeUsersList = Object.entries(userBorrowCounts)
    .map(([userId, count]) => ({
      name: userMap[userId],
      value: count,
      userId: userId
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // 取前8名

  return activeUsersList
}

// 计算借阅统计概览
const calculateBorrowStats = (users, borrowRecords) => {
  const totalBorrows = borrowRecords.length
  const activeUsers = new Set(borrowRecords.map(record => record.userId || record.user_id)).size
  const avgBorrowsPerUser = activeUsers > 0 ? Math.round(totalBorrows / activeUsers * 10) / 10 : 0

  const returnedCount = borrowRecords.filter(record => record.returnDate || record.return_date).length
  const returnRate = totalBorrows > 0 ? Math.round(returnedCount / totalBorrows * 100) : 0

  return {
    totalBorrows,
    activeUsers,
    avgBorrowsPerUser,
    returnRate
  }
}

// 获取并处理用户借阅数据
const fetchUserBorrowData = async () => {
  try {

    // 获取用户数据
    const usersResponse = await queryUsers()
    usersData.value = usersResponse.data || usersResponse || []

    // 分析用户借阅数据
    userActivityData.value = analyzeUserActivity(usersData.value, borrowRecordsData.value)
    borrowStatusData.value = analyzeBorrowStatus(borrowRecordsData.value)
    activeUsersData.value = analyzeActiveUsers(usersData.value, borrowRecordsData.value)
    borrowStats.value = calculateBorrowStats(usersData.value, borrowRecordsData.value)


  } catch (error) {
    console.error('获取用户借阅数据失败:', error)
  }
}

// 组件挂载后初始化所有图表
onMounted(async () => {
  await nextTick()

  // 初始化所有图表
  initCategoryChart()
  initStockChart()
  initTrendChart()
  initPopularChart()
  // 初始化用户借阅相关图表
  initUserActivityChart()
  initBorrowStatusChart()
  initBorrowTrendChart()
  initUserPreferenceChart()
  initActiveUsersChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 获取真实数据并更新图表
  await fetchBooksData()
  await fetchUserBorrowData()
})

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize)

  // 销毁图表实例
  categoryChart?.dispose()
  stockChart?.dispose()
  trendChart?.dispose()
  popularChart?.dispose()
  // 销毁用户借阅相关图表实例
  userActivityChart?.dispose()
  borrowStatusChart?.dispose()
  borrowTrendChart?.dispose()
  userPreferenceChart?.dispose()
  activeUsersChart?.dispose()

  categoryChart = null
  stockChart = null
  trendChart = null
  popularChart = null
  // 用户借阅相关图表实例
  userActivityChart = null
  borrowStatusChart = null
  borrowTrendChart = null
  userPreferenceChart = null
  activeUsersChart = null
})
</script>

<style scoped>
.book-visualization {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
}

.page-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-area {
  background: #fff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

/* 图表容器样式 */
.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
}

.chart-container-large {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
    min-height: 250px;
  }

  .chart-container-large {
    height: 300px;
    min-height: 300px;
  }

  .page-header h2 {
    font-size: 20px;
  }

  .page-header p {
    font-size: 13px;
  }
}

/* Element Plus 卡片样式优化 */
:deep(.el-card) {
  margin-bottom: 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* 栅格间距优化 */
:deep(.el-row) {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

:deep(.el-col) {
  padding-left: 10px !important;
  padding-right: 10px !important;
}

/* 用户借阅可视化样式 */
.user-borrow-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #f0f0f0;
}

.section-header {
  margin-bottom: 25px;
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

/* 统计概览样式 */
.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

/* 响应式设计优化 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .stat-item {
    padding: 15px;
  }

  .stat-value {
    font-size: 24px;
  }

  .section-header h3 {
    font-size: 18px;
  }
}
</style>
