import request from '@/lib/axios'

/**
 * 推荐内容
 */
export interface Recommendation {
  id: string;
  title: string;
  cover: string;
  city: string;
  type: string;       // house / activity
  link: string;
  startTime: string;
  endTime: string;
}

/**
 * 获取所有推荐内容
 * @returns 推荐列表
 */
export const getRecommendations = () =>
  request<Recommendation[]>({
    url: '/admin/recommendations',
    method: 'GET',
  });

/**
 * 保存一条推荐内容（新建）
 * @param data 推荐详情（不含id）
 * @returns void
 */
export const saveRecommendation = (data: Omit<Recommendation, 'id'>) =>
  request({
    url: '/admin/recommendation',
    method: 'POST',
    data,
  });