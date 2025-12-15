//scr/api/borrowRecord.js
import request from '@/utils/request'

//借阅图书,请求体为json
export const borrowBook = (data) => request.post('/api/borrow-records', data)

// 归还图书
export const returnBook = (id) => request.post(`/api/borrow-records/${id}/return`)

// 根据id获取借阅记录
export const getBorrowRecord = (id) => request.get(`/api/borrow-records/${id}`)

// 获取所有借阅记录
export const queryBorrowRecords = (params) => request.get('/api/borrow-records', { params })

// 获取某个用户的借阅记录
export const getUserBorrowRecords = (userId, params) =>
  request.get(`/api/borrow-records/user/${userId}`, { params })

// 获取某本书的借阅记录
export const getBookBorrowRecords = (bookId, params) =>
  request.get(`/api/borrow-records/book/${bookId}`, { params })

// 获取用户当前借阅的图书
export const getUserCurrentBorrowedBooks = (userId) =>
  request.get(`/api/borrow-records/user/${userId}/borrowing-count`)

// 删除借阅记录
export const deleteBorrowRecord = (id) => request.delete(`/api/borrow-records/${id}`)

// 批量归还图书
export const batchReturnBooks = (data) => request.post('/api/borrow-records/batch-return', data)
