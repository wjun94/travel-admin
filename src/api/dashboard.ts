import request from '@/lib/axios'

/**
 * 单个统计维度的数据（总数 + 今日/本周/本月新增）
 */
export interface DimensionCounts {
  total: number;
  today: number;
  week: number;
  month: number;
}

/**
 * 仪表盘统计数据（9 个维度）
 */
export interface DashboardData {
  user: DimensionCounts;
  guide: DimensionCounts;
  partner: DimensionCounts;
  trip: DimensionCounts;
  comment: DimensionCounts;
  favorite: DimensionCounts;
  application: DimensionCounts;
  complaint: DimensionCounts;
  aiGenerate: DimensionCounts;
}

/**
 * 获取仪表盘统计数据
 * @returns 用户/攻略/搭子/行程/评论/收藏/搭子申请/投诉/AI生成的总数与今日、本周、本月新增
 */
export const getDashboardData = () =>
  request<DashboardData>({
    url: '/admin/dashboard',
    method: 'GET',
  });
