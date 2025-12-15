<template>
  <div class="search-container">
    <el-form :model="searchForm" inline>
      <el-form-item
        v-for="field in searchFields"
        :key="field.key"
        :label="field.label"
      >
        <!-- 输入框 -->
        <el-input
          v-if="field.type === 'input'"
          v-model="searchForm[field.key]"
          :placeholder="field.placeholder"
          clearable
          :style="{ width: field.width || '200px' }"
          @keyup.enter="handleSearch"
        />

        <!-- 选择框 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="searchForm[field.key]"
          :placeholder="field.placeholder"
          clearable
          :style="{ width: field.width || '150px' }"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :loading="loading">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <slot name="extra-buttons"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

// 定义组件名称
defineOptions({
  name: 'SearchForm'
})

// 定义 props
const props = defineProps({
  // 搜索字段配置
  fields: {
    type: Array,
    required: true,
    default: () => []
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

// 定义 emits
const emit = defineEmits(['search', 'reset'])

// 搜索字段配置
const searchFields = ref(props.fields)

// 搜索表单数据
const searchForm = ref({})

// 初始化搜索表单
const initSearchForm = () => {
  const form = {}
  searchFields.value.forEach(field => {
    form[field.key] = field.defaultValue || ''
  })
  searchForm.value = form
}

// 处理搜索
const handleSearch = () => {
  emit('search', { ...searchForm.value })
}

// 处理重置
const handleReset = () => {
  initSearchForm()
  emit('reset')
}

// 监听字段配置变化
watch(() => props.fields, (newFields) => {
  searchFields.value = newFields
  initSearchForm()
}, { immediate: true, deep: true })

// 暴露方法给父组件
defineExpose({
  getSearchForm: () => ({ ...searchForm.value }),
  setSearchForm: (form) => {
    searchForm.value = { ...form }
  },
  resetForm: handleReset
})
</script>

<style scoped>
.search-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}
</style>
