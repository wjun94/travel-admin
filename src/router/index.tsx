// src/router/index.tsx 完整正确配置
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import AppLayout from '@/app/layout'
import Login from '@/app/login/page'
import Dashboard from '@/app/dashboard/page'
import AdminUsers from '@/app/admin-users/page'
import Roles from '@/app/roles/page'
import Users from '@/app/users/page'
import Posts from '@/app/posts/page'
import Partners from '@/app/partners/page'
import Recommendations from '@/app/recommendations/page'
import Complaints from '@/app/complaints/page'
import Messages from '@/app/messages/page'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <AuthGuard><AppLayout /></AuthGuard>,
    // ✅ 添加根路径重定向（非常重要！）
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/system/admin-users', element: <AdminUsers /> },
      { path: '/system/roles', element: <Roles /> },
      { path: '/users', element: <Users /> },
      { path: '/posts', element: <Posts /> },
      { path: '/partners', element: <Partners /> },
      { path: '/recommendations', element: <Recommendations /> },
      { path: '/complaints', element: <Complaints /> },
      { path: '/messages', element: <Messages /> },
    ]
  },
  // ✅ 添加404页面（捕获所有未匹配的路由）
  {
    path: '*',
    element: <div style={{ textAlign: 'center', padding: 100 }}>
      <h1>404 - 页面不存在</h1>
      <button onClick={() => window.location.href = '/admin/dashboard'}>返回首页</button>
    </div>
  }
], {
  // 部署在 /admin 路径下
  basename: '/admin',
})

export default function Router() {
  return <RouterProvider router={router} />
}