//scr/api/user.js
import request from '@/utils/request'


// 获取用户列表
export const queryUsers = (params) => request.get('/api/users', { params })

// 获取单个用户详情
export const getUser = (id) => request.get(`/api/users/${id}`)

// 创建新用户
export const createUser = (data) => request.post('/api/users', data)

// 更新用户信息
export const updateUser = (id, data) => request.put(`/api/users/${id}`, data)

// 删除用户
export const deleteUser = (id) => request.delete(`/api/users/${id}`)

// 根据角色获取用户
export const getUsersByRole = (role) => request.get(`/api/users/role/${role}`)

// 根据状态查询用户
export const getUsersByStatus = (status) => request.get(`/api/users/status/${status}`)

// 检查用户是否存在
export const checkUserExists = (username) =>
  request.get(`/api/users/check-username?username=${encodeURIComponent(username)}`)

// 修改用户状态
export const updateUserStatus = (id) => request.put(`/api/users/status/${id}`)
