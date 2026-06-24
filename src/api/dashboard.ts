import request from '@/lib/axios'

/**
 * 仪表盘统计数据
 */
export interface DashboardData {
  userCount: number;
  postCount: number;
  partnerCount: number;
}

/**
 * 获取仪表盘统计数据
 * @returns 用户数、攻略数、搭子数
 */
export const getDashboardData = () =>
  request<DashboardData>({
    url: '/admin/dashboard',
    method: 'GET',
  });