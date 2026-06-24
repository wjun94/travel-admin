import request from '@/lib/axios'

// 仪表盘数据
export interface DashboardData {
  userCount: number;
  postCount: number;
  partnerCount: number;
}

// 获取仪表盘数据
export function getDashboard() {
  return request.get<DashboardData>('/admin/dashboard')
}
