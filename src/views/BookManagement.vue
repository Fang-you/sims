<template>
    <div class="page-header">
      <h2>图书管理</h2>
    </div>

    <!-- 搜索表单 -->
    <SearchComponent
      :fields="searchFields"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #extra-buttons>
        <el-button type="success" @click="handleAddBook">
          <el-icon><Plus /></el-icon>
          添加图书
        </el-button>
      </template>
    </SearchComponent>
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
      prop="title"
      label="标题"
      min-width="200"
      show-overflow-tooltip>
    </el-table-column>
    <el-table-column
      prop="author"
      label="作者"
      min-width="120"
      show-overflow-tooltip>
    </el-table-column>
    <el-table-column
      prop="quantity"
      label="剩余数量"
      min-width="100">
      <template #default="scope">
        <el-tag
          :type="scope.row.quantity > 10 ? 'success' : scope.row.quantity > 0 ? 'warning' : 'danger'"
          size="small">
          {{ scope.row.quantity }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="150">
      <template v-slot="scope">
        <el-button @click="handleView(scope.row)" type="primary" size="small">查看</el-button>
        <el-button @click="handleEdit(scope.row)" type="warning" size="small">编辑</el-button>
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

  <!-- 查看图书对话框 -->
  <el-dialog
    v-model="viewBookDialogVisible"
    title="图书详情"
    width="600px"
    :before-close="handleCloseViewDialog"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="图书ID">{{ viewBook.id }}</el-descriptions-item>
      <el-descriptions-item label="图书标题">{{ viewBook.title }}</el-descriptions-item>
      <el-descriptions-item label="作者">{{ viewBook.author }}</el-descriptions-item>
      <el-descriptions-item label="ISBN">{{ viewBook.isbn }}</el-descriptions-item>
      <el-descriptions-item label="出版社">{{ viewBook.publisher }}</el-descriptions-item>
      <el-descriptions-item label="出版日期">{{ viewBook.publishDate }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{ viewBook.category }}</el-descriptions-item>
      <el-descriptions-item label="库存数量">
        <el-tag :type="viewBook.quantity > 10 ? 'success' : viewBook.quantity > 0 ? 'warning' : 'danger'">
          {{ viewBook.quantity }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="价格">¥{{ viewBook.price }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ viewBook.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ viewBook.updatedAt }}</el-descriptions-item>
      <el-descriptions-item label="图书描述" :span="2">
        <div style="max-height: 100px; overflow-y: auto;">
          {{ viewBook.description || '暂无描述' }}
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!-- 编辑图书对话框 -->
  <el-dialog
    v-model="editBookDialogVisible"
    title="编辑图书"
    width="600px"
    :before-close="handleCloseEditDialog"
  >
    <el-form
      ref="editBookFormRef"
      :model="editBookForm"
      :rules="editBookRules"
      label-width="100px"
    >
      <el-form-item label="图书标题" prop="title">
        <el-input
          v-model="editBookForm.title"
          placeholder="请输入图书标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input
          v-model="editBookForm.author"
          placeholder="请输入作者姓名"
          clearable
        />
      </el-form-item>
      <el-form-item label="ISBN" prop="isbn">
        <el-input
          v-model="editBookForm.isbn"
          placeholder="请输入ISBN号码"
          clearable
        />
      </el-form-item>
      <el-form-item label="出版社" prop="publisher">
        <el-input
          v-model="editBookForm.publisher"
          placeholder="请输入出版社"
          clearable
        />
      </el-form-item>
      <el-form-item label="出版日期" prop="publishDate">
        <el-date-picker
          v-model="editBookForm.publishDate"
          type="date"
          placeholder="请选择出版日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input
          v-model="editBookForm.category"
          placeholder="请输入图书分类"
          clearable
        />
      </el-form-item>
      <el-form-item label="库存数量" prop="quantity">
        <el-input-number
          v-model="editBookForm.quantity"
          :min="0"
          :max="9999"
          placeholder="请输入库存数量"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="editBookForm.price"
          :min="0"
          :precision="2"
          placeholder="请输入价格"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="图书描述" prop="description">
        <el-input
          v-model="editBookForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入图书描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCloseEditDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmitEditBook" :loading="editBookLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 添加图书对话框 -->
  <el-dialog
    v-model="addBookDialogVisible"
    title="添加图书"
    width="600px"
    :before-close="handleCloseDialog"
  >
    <el-form
      ref="addBookFormRef"
      :model="addBookForm"
      :rules="addBookRules"
      label-width="100px"
    >
      <el-form-item label="图书标题" prop="title">
        <el-input
          v-model="addBookForm.title"
          placeholder="请输入图书标题"
          clearable
        />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input
          v-model="addBookForm.author"
          placeholder="请输入作者姓名"
          clearable
        />
      </el-form-item>
      <el-form-item label="ISBN" prop="isbn">
        <el-input
          v-model="addBookForm.isbn"
          placeholder="请输入ISBN号码"
          clearable
        />
      </el-form-item>
      <el-form-item label="出版社" prop="publisher">
        <el-input
          v-model="addBookForm.publisher"
          placeholder="请输入出版社"
          clearable
        />
      </el-form-item>
      <el-form-item label="出版日期" prop="publishDate">
        <el-date-picker
          v-model="addBookForm.publishDate"
          type="date"
          placeholder="请选择出版日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-input
          v-model="addBookForm.category"
          placeholder="请输入图书分类"
          clearable
        />
      </el-form-item>
      <el-form-item label="库存数量" prop="quantity">
        <el-input-number
          v-model="addBookForm.quantity"
          :min="0"
          :max="9999"
          placeholder="请输入库存数量"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="价格" prop="price">
        <el-input-number
          v-model="addBookForm.price"
          :min="0"
          :precision="2"
          placeholder="请输入价格"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="图书描述" prop="description">
        <el-input
          v-model="addBookForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入图书描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmitAddBook" :loading="addBookLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SearchComponent from '@/views/components/search.vue'
//获取图书列表并打印
import { getBooks, createBook, updateBook } from '@/api/book'

const tableData = ref([])
const allBooksData = ref([]) // 存储所有图书数据
const filteredBooksData = ref([]) // 存储过滤后的图书数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 搜索字段配置
const searchFields = ref([
  {
    key: 'title',
    label: '图书标题',
    type: 'input',
    placeholder: '请输入图书标题',
    width: '200px'
  },
  {
    key: 'author',
    label: '作者',
    type: 'input',
    placeholder: '请输入作者',
    width: '200px'
  },
  {
    key: 'stockStatus',
    label: '库存状态',
    type: 'select',
    placeholder: '请选择库存状态',
    width: '150px',
    options: [
      { label: '库存充足', value: 'abundant' },
      { label: '库存一般', value: 'normal' },
      { label: '库存较少', value: 'low' },
      { label: '缺货', value: 'empty' }
    ]
  }
])

// 搜索表单数据
const searchForm = ref({
  title: '',
  author: '',
  stockStatus: ''
})

// 添加图书相关状态
const addBookDialogVisible = ref(false)
const addBookLoading = ref(false)
const addBookFormRef = ref(null)

// 查看图书相关状态
const viewBookDialogVisible = ref(false)
const viewBook = ref({})

// 编辑图书相关状态
const editBookDialogVisible = ref(false)
const editBookLoading = ref(false)
const editBookFormRef = ref(null)
const currentEditBook = ref(null)

// 添加图书表单数据
const addBookForm = ref({
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishDate: '',
  category: '',
  quantity: 0,
  price: 0,
  description: ''
})

// 编辑图书表单数据
const editBookForm = ref({
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  publishDate: '',
  category: '',
  quantity: 0,
  price: 0,
  description: ''
})

// 添加图书表单验证规则
const addBookRules = ref({
  title: [
    { required: true, message: '请输入图书标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '作者姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  isbn: [
    { required: true, message: '请输入ISBN号码', trigger: 'blur' },
    { pattern: /^[0-9]{13}$/, message: 'ISBN必须是13位数字', trigger: 'blur' }
  ],
  publisher: [
    { required: true, message: '请输入出版社', trigger: 'blur' },
    { min: 1, max: 100, message: '出版社名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  publishDate: [
    { required: true, message: '请选择出版日期', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请输入图书分类', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存数量不能小于0', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ]
})

// 编辑图书表单验证规则
const editBookRules = ref({
  title: [
    { required: true, message: '请输入图书标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '作者姓名长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  isbn: [
    { required: true, message: '请输入ISBN号码', trigger: 'blur' },
    { pattern: /^[0-9]{13}$/, message: 'ISBN必须是13位数字', trigger: 'blur' }
  ],
  publisher: [
    { required: true, message: '请输入出版社', trigger: 'blur' },
    { min: 1, max: 100, message: '出版社名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  publishDate: [
    { required: true, message: '请选择出版日期', trigger: 'change' }
  ],
  category: [
    { required: true, message: '请输入图书分类', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  quantity: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存数量不能小于0', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ]
})

// 获取图书列表数据
const fetchBooks = async (forceRefresh = false) => {
  loading.value = true
  try {

    // 如果后端支持分页，直接请求分页数据
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getBooks(params)

    // 检查后端是否支持分页（返回格式为 { data: [], total: number }）
    if (res && res.data && typeof res.total === 'number') {
      // 后端支持分页
      tableData.value = res.data
      total.value = res.total
    } else {
      // 后端不支持分页，进行前端分页
      if (allBooksData.value.length === 0 || forceRefresh) {
        // 第一次加载或强制刷新时，获取所有数据
        const allRes = await getBooks() // 不传参数，获取所有数据
        allBooksData.value = allRes || []
      }

      // 应用搜索过滤
      applySearchFilter()

      // 计算分页数据
      const startIndex = (currentPage.value - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      tableData.value = filteredBooksData.value.slice(startIndex, endIndex)
      total.value = filteredBooksData.value.length
    }

  } catch (error) {
    console.error('获取图书列表失败:', error)
    console.error('错误详情:', error.response)
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
  if (allBooksData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredBooksData.value.length
  } else {
    fetchBooks()
  }
}

// 当前页改变事件
const handleCurrentChange = (val) => {
  currentPage.value = val

  // 如果后端不支持分页，直接更新显示数据
  if (allBooksData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredBooksData.value.length
  } else {
    fetchBooks()
  }
}

// 更新分页显示数据（用于前端分页）
const updatePaginationData = () => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  tableData.value = filteredBooksData.value.slice(startIndex, endIndex)
}

// 应用搜索过滤
const applySearchFilter = () => {
  let filtered = [...allBooksData.value]

  // 按标题搜索
  if (searchForm.value.title) {
    filtered = filtered.filter(book =>
      book.title && book.title.toLowerCase().includes(searchForm.value.title.toLowerCase())
    )
  }

  // 按作者搜索
  if (searchForm.value.author) {
    filtered = filtered.filter(book =>
      book.author && book.author.toLowerCase().includes(searchForm.value.author.toLowerCase())
    )
  }

  // 按库存状态搜索
  if (searchForm.value.stockStatus) {
    filtered = filtered.filter(book => {
      const quantity = book.quantity || 0
      switch (searchForm.value.stockStatus) {
        case 'abundant':
          return quantity > 10
        case 'normal':
          return quantity >= 5 && quantity <= 10
        case 'low':
          return quantity >= 1 && quantity <= 5
        case 'empty':
          return quantity === 0
        default:
          return true
      }
    })
  }

  filteredBooksData.value = filtered
}

// 搜索处理函数
const handleSearch = (searchData) => {
  searchForm.value = { ...searchData }
  currentPage.value = 1 // 重置到第一页
  if (allBooksData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredBooksData.value.length
  } else {
    fetchBooks()
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    title: '',
    author: '',
    stockStatus: ''
  }
  currentPage.value = 1
  if (allBooksData.value.length > 0) {
    applySearchFilter()
    updatePaginationData()
    total.value = filteredBooksData.value.length
  } else {
    fetchBooks()
  }
}

// 在组件挂载后获取数据
onMounted(() => {
  fetchBooks()
})

// ========== 查看和编辑相关函数 ==========

// 处理查看操作
const handleView = (book) => {
  viewBook.value = { ...book }
  viewBookDialogVisible.value = true
}

// 关闭查看对话框
const handleCloseViewDialog = () => {
  viewBookDialogVisible.value = false
  viewBook.value = {}
}

// 处理编辑操作
const handleEdit = (book) => {
  currentEditBook.value = book
  // 回显图书数据到编辑表单
  editBookForm.value = {
    title: book.title || '',
    author: book.author || '',
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    publishDate: book.publishDate || '',
    category: book.category || '',
    quantity: book.quantity || 0,
    price: book.price || 0,
    description: book.description || ''
  }
  editBookDialogVisible.value = true
}

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  editBookDialogVisible.value = false
  currentEditBook.value = null
  resetEditBookForm()
}

// 重置编辑图书表单
const resetEditBookForm = () => {
  editBookForm.value = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishDate: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  }
  // 清除表单验证
  if (editBookFormRef.value) {
    editBookFormRef.value.clearValidate()
  }
}

// 提交编辑图书
const handleSubmitEditBook = async () => {
  try {
    // 表单验证
    const valid = await editBookFormRef.value.validate()
    if (!valid) {
      return
    }

    editBookLoading.value = true

    // 准备提交数据
    const submitData = {
      title: editBookForm.value.title,
      author: editBookForm.value.author,
      isbn: editBookForm.value.isbn,
      publisher: editBookForm.value.publisher,
      publishDate: editBookForm.value.publishDate,
      category: editBookForm.value.category,
      quantity: editBookForm.value.quantity,
      price: editBookForm.value.price,
      description: editBookForm.value.description || ''
    }

    // 调用API更新图书
    await updateBook(currentEditBook.value.id, submitData)

    ElMessage.success('图书信息更新成功！')

    // 关闭对话框
    handleCloseEditDialog()

    // 刷新图书列表
    await fetchBooks(true)

  } catch (error) {
    console.error('更新图书失败:', error)

    // 根据错误类型显示不同的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(`更新失败: ${error.response.data.message}`)
    } else if (error.message) {
      ElMessage.error(`更新失败: ${error.message}`)
    } else {
      ElMessage.error('更新图书失败，请重试')
    }
  } finally {
    editBookLoading.value = false
  }
}

// ========== 添加图书相关函数 ==========

// 打开添加图书对话框
const handleAddBook = () => {
  addBookDialogVisible.value = true
  resetAddBookForm()
}

// 关闭添加图书对话框
const handleCloseDialog = () => {
  addBookDialogVisible.value = false
  resetAddBookForm()
}

// 重置添加图书表单
const resetAddBookForm = () => {
  addBookForm.value = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publishDate: '',
    category: '',
    quantity: 0,
    price: 0,
    description: ''
  }
  // 清除表单验证
  if (addBookFormRef.value) {
    addBookFormRef.value.clearValidate()
  }
}

// 提交添加图书
const handleSubmitAddBook = async () => {
  try {
    // 表单验证
    const valid = await addBookFormRef.value.validate()
    if (!valid) {
      return
    }

    addBookLoading.value = true

    // 准备提交数据
    const submitData = {
      title: addBookForm.value.title,
      author: addBookForm.value.author,
      isbn: addBookForm.value.isbn,
      publisher: addBookForm.value.publisher,
      publishDate: addBookForm.value.publishDate,
      category: addBookForm.value.category,
      quantity: addBookForm.value.quantity,
      price: addBookForm.value.price,
      description: addBookForm.value.description || ''
    }


    // 调用API创建图书
    await createBook(submitData)

    ElMessage.success('图书添加成功！')

    // 关闭对话框
    handleCloseDialog()

    // 刷新图书列表
    await fetchBooks(true)

  } catch (error) {
    console.error('添加图书失败:', error)

    // 根据错误类型显示不同的错误信息
    if (error.response && error.response.data && error.response.data.message) {
      ElMessage.error(`添加失败: ${error.response.data.message}`)
    } else if (error.message) {
      ElMessage.error(`添加失败: ${error.message}`)
    } else {
      ElMessage.error('添加图书失败，请重试')
    }
  } finally {
    addBookLoading.value = false
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

  .search-container {
    padding: 15px;
  }

  .search-container .el-form-item {
    margin-right: 10px;
  }
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 对话框样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button + .el-button {
  margin-left: 10px;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-editor) {
  width: 100%;
}
</style>
