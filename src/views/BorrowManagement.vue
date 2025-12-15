<template>
  <div class="borrow-management">
    <div class="page-header">
      <h2>借阅管理</h2>
    </div>
    <div class="table-container">
      <el-table
        :data="tableData"
        :loading="loading"
        border
        style="width: 100%">
        <el-table-column
          prop="id"
          label="ID"
          min-width="60">
        </el-table-column>
        <el-table-column
          prop="username"
          label="用户名"
          min-width="100"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="bookTitle"
          label="图书标题"
          min-width="180"
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="borrowDate"
          label="借阅日期"
          min-width="110">
        </el-table-column>
        <el-table-column
          prop="dueDate"
          label="应还日期"
          min-width="110">
        </el-table-column>
        <el-table-column
          prop="returnDate"
          label="归还日期"
          min-width="120">
          <template #default="scope">
            <span v-if="scope.row.returnDate">
              {{ scope.row.returnDate }}
            </span>
            <el-tag v-else type="warning" size="small">未归还</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="140">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'borrowed'"
              @click="handleReturn(scope.row)"
              type="success"
              size="small">
              归还
            </el-button>
            <el-button
              @click="handleView(scope.row)"
              type="primary"
              size="small">
              查看
            </el-button>
            <el-button
              @click="handleDelete(scope.row)"
              type="danger"
              size="small">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 获取借阅记录API
import { queryBorrowRecords, returnBook, deleteBorrowRecord } from '@/api/borrowRecord'
// 导入查询功能
import { getBook } from '@/api/book'
import { getUser } from '@/api/user'

const tableData = ref([])
const allBorrowRecordsData = ref([]) // 存储所有借阅记录数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 日期处理工具函数
const calculateDueDate = (borrowDate) => {
  if (!borrowDate) return null
  const date = new Date(borrowDate)
  if (isNaN(date.getTime())) return null

  const dueDate = new Date(date)
  dueDate.setDate(dueDate.getDate() + 30) // 借阅后30天
  return dueDate.toISOString().split('T')[0] // 返回 YYYY-MM-DD 格式
}

// 格式化日期显示
const formatDate = (dateStr) => {
  if (!dateStr) return '未设置'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  } catch {
    return dateStr
  }
}

// 获取借阅记录列表数据
const fetchBorrowRecords = async (forceRefresh = false) => {
  loading.value = true
  try {
    console.log('开始获取借阅记录列表...')

    // 如果后端支持分页，直接请求分页数据
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await queryBorrowRecords(params)
    console.log('获取借阅记录列表成功:', res)

    let recordsToProcess = []

    // 检查后端是否支持分页（返回格式为 { data: [], total: number }）
    if (res && res.data && typeof res.total === 'number') {
      // 后端支持分页
      recordsToProcess = res.data
      total.value = res.total
    } else {
      // 后端不支持分页，进行前端分页
      if (allBorrowRecordsData.value.length === 0 || forceRefresh) {
        // 第一次加载或强制刷新时，获取所有数据
        const allRes = await queryBorrowRecords() // 不传参数，获取所有数据
        allBorrowRecordsData.value = allRes || []
      }

      total.value = allBorrowRecordsData.value.length

      // 计算分页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      recordsToProcess = allBorrowRecordsData.value.slice(startIndex, endIndex)
    }

    // 为每条记录查询书名和用户名
    const enrichedData = await Promise.all(
      recordsToProcess.map(async (record) => {
        try {
          // 并行查询用户和图书信息
          const [userRes, bookRes] = await Promise.all([
            getUser(record.userId || record.user_id),
            getBook(record.bookId || record.book_id)
          ])

          // 计算应还日期（借阅日期后30天）
          let dueDate = record.dueDate || record.due_date
          if (!dueDate && (record.borrowDate || record.borrow_date)) {
            dueDate = calculateDueDate(record.borrowDate || record.borrow_date)
          }

          return {
            ...record,
            username: userRes?.username || userRes?.name || '未知用户',
            bookTitle: bookRes?.title || '未知图书',
            dueDate: dueDate || '未设置',
            borrowDate: formatDate(record.borrowDate || record.borrow_date),
            returnDate: record.returnDate || record.return_date
          }
        } catch (error) {
          console.error(`查询记录 ${record.id} 的详细信息失败:`, error)
          return {
            ...record,
            username: '查询失败',
            bookTitle: '查询失败',
            dueDate: '计算失败'
          }
        }
      })
    )

    tableData.value = enrichedData
  } catch (error) {
    console.error('获取借阅记录列表失败:', error)
    ElMessage.error('获取借阅记录列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 分页大小改变事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 重置到第一页

  // 如果后端不支持分页，直接更新显示数据
  if (allBorrowRecordsData.value.length > 0) {
    updatePaginationData()
  } else {
    fetchBorrowRecords()
  }
}

// 当前页改变事件
const handleCurrentChange = (val) => {
  currentPage.value = val

  // 如果后端不支持分页，直接更新显示数据
  if (allBorrowRecordsData.value.length > 0) {
    updatePaginationData()
  } else {
    fetchBorrowRecords()
  }
}

// 更新分页显示数据（用于前端分页）
const updatePaginationData = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  const recordsToProcess = allBorrowRecordsData.value.slice(startIndex, endIndex)

  // 重新处理数据（包括查询用户名和书名）
  Promise.all(
    recordsToProcess.map(async (record) => {
      try {
        const [userRes, bookRes] = await Promise.all([
          getUser(record.userId || record.user_id),
          getBook(record.bookId || record.book_id)
        ])

        let dueDate = record.dueDate || record.due_date
        if (!dueDate && (record.borrowDate || record.borrow_date)) {
          dueDate = calculateDueDate(record.borrowDate || record.borrow_date)
        }

        return {
          ...record,
          username: userRes?.username || userRes?.name || '未知用户',
          bookTitle: bookRes?.title || '未知图书',
          dueDate: dueDate || '未设置',
          borrowDate: formatDate(record.borrowDate || record.borrow_date),
          returnDate: record.returnDate || record.return_date
        }
      } catch (error) {
        console.error(`查询记录 ${record.id} 的详细信息失败:`, error)
        return {
          ...record,
          username: '查询失败',
          bookTitle: '查询失败',
          dueDate: '计算失败'
        }
      }
    })
  ).then(enrichedData => {
    tableData.value = enrichedData
  })
}

// 在组件挂载后获取数据
onMounted(() => {
  fetchBorrowRecords()
})

// 归还图书
const handleReturn = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要归还图书 "${row.bookTitle}" 吗？`,
      '确认归还',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用归还API
    await returnBook(row.id)

    // 更新本地状态
    row.status = 'returned'
    row.returnDate = new Date().toISOString().split('T')[0] // 设置归还日期

    ElMessage.success('归还成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('归还图书失败:', error)
      ElMessage.error('归还失败')
    }
  }
}

// 查看借阅记录详情
const handleView = (row) => {
  ElMessage.info(`查看借阅记录: ${row.bookTitle}`)
  // TODO: 跳转到详情页面或弹窗显示
}

// 删除借阅记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条借阅记录吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用删除API
    await deleteBorrowRecord(row.id)

    // 从表格中移除该记录
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除借阅记录失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

/* 优化表格布局 */
.el-table {
  width: 100%;
}

/* 确保表格在小屏幕上也能正常显示 */
@media (max-width: 768px) {
  .el-table {
    font-size: 14px;
  }

  /* 移动端操作按钮优化 */
  .el-button {
    margin: 2px;
    font-size: 12px;
  }
}

/* 操作按钮间距优化 */
.el-table .el-button + .el-button {
  margin-left: 5px;
}

/* 逾期高亮显示 */
.el-table .el-table__row .el-tag--danger {
  font-weight: bold;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
