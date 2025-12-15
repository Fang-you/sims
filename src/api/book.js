//scr/api/book.js
import request from '@/utils/request'

// 获取所有图书列表
export const getBooks = (params) => request.get('/api/books', { params })


// 获取单个图书详情
export const getBook = (id) => request.get(`/api/books/${id}`)

// 创建新图书
export const createBook = (data) => request.post('/api/books', data)

// 更新图书信息
export const updateBook = (id, data) => request.put(`/api/books/${id}`, data)

// 删除图书
export const deleteBook = (id) => request.delete(`/api/books/${id}`)

// 增加图书库存
export const addBookStock = (id, quantity) =>
  request.post(`/api/books/${id}/increase-quantity`, { quantity })
