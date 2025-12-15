<template>
  <div class="table-container">
    <!-- 表格 -->
    <el-table
      :data="data"
      :loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :min-width="column.minWidth"
        :width="column.width"
        :fixed="column.fixed"
        :show-overflow-tooltip="column.showOverflowTooltip"
      >
        <!-- 自定义列内容 -->
        <template v-if="column.slot" #default="scope">
          <slot :name="column.slot" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        v-if="showActions"
        fixed="right"
        :label="actionLabel"
        :width="actionWidth"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index"></slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div v-if="showPagination" class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
// 定义组件名称
defineOptions({
  name: 'DataTable'
})

// 定义 props
defineProps({
  // 表格数据
  data: {
    type: Array,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 列配置
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  // 是否显示操作列
  showActions: {
    type: Boolean,
    default: true
  },
  // 操作列标签
  actionLabel: {
    type: String,
    default: '操作'
  },
  // 操作列宽度
  actionWidth: {
    type: [String, Number],
    default: '120'
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 10
  },
  // 总条数
  total: {
    type: Number,
    default: 0
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
})

// 定义 emits
const emit = defineEmits(['size-change', 'current-change'])

// 处理每页条数变化
const handleSizeChange = (val) => {
  emit('size-change', val)
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  emit('current-change', val)
}
</script>

<style scoped>
.table-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pagination-container {
  padding: 20px;
  text-align: right;
  background: #fff;
  border-top: 1px solid #ebeef5;
}

:deep(.el-table) {
  border-radius: 8px 8px 0 0;
}

:deep(.el-table__header) {
  background: #f8f9fa;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-pagination) {
  justify-content: flex-end;
}
</style>
