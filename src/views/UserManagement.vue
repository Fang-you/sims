<template>
  <div class="page-header">
    <h2>用户管理</h2>
  </div>

  <!-- 搜索表单 -->
  <SearchComponent
    :fields="searchFields"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
  <el-table
    :data="tableData"
    :loading="loading"
    border
    style="width: 100%">
    <el-table-column
      prop="id"
      label="ID"
      min-width="80">
    </el-table-column>
    <el-table-column
      prop="username"
      label="用户名"
      min-width="120"
      show-overflow-tooltip>
    </el-table-column>
    <el-table-column
      prop="email"
      label="邮箱"
      min-width="180"
      show-overflow-tooltip>
    </el-table-column>
    <el-table-column
      prop="role"
      label="角色"
      min-width="100">
      <template #default="scope">
        <el-tag
          :type="getRoleTagType(scope.row.role)"
          size="small">
          {{ scope.row.role }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="status"
      label="状态"
      min-width="100">
      <template #default="scope">
        <el-tag
          :type="scope.row.status === 0 ? 'success' : 'danger'"
          size="small">
          {{ scope.row.status === 0 ? '正常' : '禁用' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="createdAt"
      label="创建时间"
      min-width="160">
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="150">
      <template #default="scope">
        <el-button
          @click="handleToggleStatus(scope.row)"
          :type="scope.row.status === 0 ? 'warning' : 'success'"
          size="small">
          {{ scope.row.status === 0 ? '禁用' : '启用' }}
        </el-button>
        <el-button @click="handleDelete(scope.row)" type="danger" size="small">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchComponent from '@/views/components/search.vue'
// 获取用户列表API
import { queryUsers, deleteUser } from '@/api/user'
import { updateUserStatus } from '@/api/user'

const tableData = ref([])
const allUsersData = ref([]) // 存储所有用户数据
const filteredUsersData = ref([]) // 存储过滤后的用户数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 搜索字段配置
const searchFields = ref([
  {
    key: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    width: '200px'
  },
  {
    key: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    width: '200px'
  },
  {
    key: 'role',
    label: '角色',
    type: 'select',
    placeholder: '请选择角色',
    width: '150px',
    options: [
      { label: '普通用户', value: 'user' },
      { label: '管理员', value: 'admin' },
      { label: '超级管理员', value: 'super_admin' }
    ]
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    width: '120px',
    options: [
      { label: '正常', value: 0 },
      { label: '禁用', value: 1 }
    ]
  }
])

// 搜索表单数据
const searchForm = ref({
  username: '',
  email: '',
  role: '',
  status: ''
})

// 获取用户列表数据
const fetchUsers = async (forceRefresh = false) => {
  loading.value = true
  try {

    // 如果后端支持分页，直接请求分页数据
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await queryUsers(params)

    // 检查后端是否支持分页（返回格式为 { data: [], total: number }）
    if (res && res.data && typeof res.total === 'number') {
      // 后端支持分页
      tableData.value = res.data
      total.value = res.total
    } else {
      // 后端不支持分页，进行前端分页
      if (allUsersData.value.length === 0 || forceRefresh) {
        // 第一次加载或强制刷新时，获取所有数据
        const allRes = await queryUsers() // 不传参数，获取所有数据
        allUsersData.value = allRes || []
      }

      // 应用搜索过滤
      applySearchFilter()

      // 计算分页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      tableData.value = filteredUsersData.value.slice(startIndex, endIndex)
      total.value = filteredUsersData.value.length
    }

  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
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
  if (allUsersData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredUsersData.value.length
  } else {
    fetchUsers()
  }
}

// 当前页改变事件
const handleCurrentChange = (val) => {
  currentPage.value = val

  // 如果后端不支持分页，直接更新显示数据
  if (allUsersData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredUsersData.value.length
  } else {
    fetchUsers()
  }
}

// 更新分页显示数据（用于前端分页）
const updatePaginationData = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  tableData.value = filteredUsersData.value.slice(startIndex, endIndex)
}

// 应用搜索过滤
const applySearchFilter = () => {
  let filtered = [...allUsersData.value]

  // 按用户名搜索
  if (searchForm.value.username) {
    filtered = filtered.filter(user =>
      user.username && user.username.toLowerCase().includes(searchForm.value.username.toLowerCase())
    )
  }

  // 按邮箱搜索
  if (searchForm.value.email) {
    filtered = filtered.filter(user =>
      user.email && user.email.toLowerCase().includes(searchForm.value.email.toLowerCase())
    )
  }

  // 按角色搜索
  if (searchForm.value.role) {
    filtered = filtered.filter(user => {
      const userRole = user.role
      if (typeof userRole === 'string') {
        return userRole.toLowerCase() === searchForm.value.role.toLowerCase()
      } else if (typeof userRole === 'number') {
        // 兼容数字类型的角色
        const roleMap = {
          1: 'user',
          2: 'admin',
          3: 'super_admin'
        }
        return roleMap[userRole] === searchForm.value.role
      }
      return false
    })
  }

  // 按状态搜索
  if (searchForm.value.status !== '' && searchForm.value.status !== null) {
    filtered = filtered.filter(user => user.status === searchForm.value.status)
  }

  filteredUsersData.value = filtered
}

// 搜索处理函数
const handleSearch = (searchData) => {
  searchForm.value = { ...searchData }
  currentPage.value = 1 // 重置到第一页
  if (allUsersData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredUsersData.value.length
  } else {
    fetchUsers()
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    username: '',
    email: '',
    role: '',
    status: ''
  }
  currentPage.value = 1
  if (allUsersData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredUsersData.value.length
  } else {
    fetchUsers()
  }
}

// 在组件挂载后获取数据
onMounted(() => {
  fetchUsers()
})

// 获取角色标签类型
const getRoleTagType = (role) => {
  // 根据角色字符串返回不同类型
  if (typeof role === 'string') {
    const lowerRole = role.toLowerCase()
    if (lowerRole.includes('admin') || lowerRole.includes('管理')) {
      return lowerRole.includes('super') ? 'danger' : 'warning'
    }
    return 'success'
  }
  // 兼容数字类型
  const roleMap = {
    3: 'danger',    // super_admin
    2: 'warning',   // admin
    1: 'success'    // user
  }
  return roleMap[role] || 'info'
}

// 切换用户状态(禁用/启用)
const handleToggleStatus = async (row) => {
  const action = row.status === 0 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 更新本地状态: 0=正常, 1=禁用
    row.status = row.status === 0 ? 1 : 0

    // TODO: 调用后端API更新用户状态
    await updateUserStatus(row.id, row.status)


    ElMessage.success(`${action}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error(`${action}用户失败:`, error)
      ElMessage.error(`${action}失败`)
    }
  }
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 调用删除API
    await deleteUser(row.id)

    // 从数据中移除该用户
    if (allUsersData.value.length > 0) {
      // 前端分页模式：从缓存数据中删除
      const allIndex = allUsersData.value.findIndex(item => item.id === row.id)
      if (allIndex > -1) {
        allUsersData.value.splice(allIndex, 1)
        applySearchFilter()
        updatePaginationData()
        total.value = filteredUsersData.value.length
      }
    } else {
      // 后端分页模式：重新获取数据
      await fetchUsers(true)
    }

    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 20px;
}

/* 搜索容器样式 */
.search-container {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.search-container .el-form {
  margin-bottom: 0;
}

.search-container .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.search-container .el-form-item:last-child {
  margin-right: 0;
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

  .search-container {
    padding: 15px;
  }

  .search-container .el-form-item {
    margin-right: 10px;
  }
}

/* 操作按钮间距优化 */
.el-table .el-button + .el-button {
  margin-left: 5px;
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
