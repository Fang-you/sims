import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: () => import('@/views/LoginPage.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'RegisterPage',
    component: () => import('@/views/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/dashboard',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'MainDashboard',
        component: () => import('@/views/MainDashboard.vue'),
        meta: { title: '数据概览' }
      },
      {
        path: 'books',
        name: 'BookManagement',
        component: () => import('@/views/BookManagement.vue'),
        meta: { title: '图书管理' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'borrow',
        name: 'BorrowManagement',
        component: () => import('@/views/BorrowManagement.vue'),
        meta: { title: '借阅管理' }
      },
      {
        path: 'report/book-visual',
        name: 'BookVisualization',
        component: () => import('@/views/visul/BookVisualization.vue'),
        meta: { title: '图书可视化显示' }
      },
      {
        path: 'report/user-visual',
        name: 'UserVisualization',
        component: () => import('@/views/visul/UserVisualization.vue'),
        meta: { title: '用户可视化分析' }
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue'),
        meta: { title: '个人信息' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 如果访问登录或注册页面，直接放行
  if (to.path === '/login' || to.path === '/register') {
    next()
    return
  }

  // 如果没有token，重定向到登录页
  if (!token) {
    next('/login')
    return
  }

  // 如果访问根路径且有token，重定向到dashboard
  if (to.path === '/' && token) {
    next('/dashboard')
    return
  }

  // 有token，放行
  next()
})

export default router
