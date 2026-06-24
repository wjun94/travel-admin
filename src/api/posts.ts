import request from '@/lib/axios'

/**
 * 攻略
 */
export interface Post {
  id: number;
  content: string;
  city: string;
  status: number;   // 0待审核 1已发布 2下架
  createdAt: string;
}

/**
 * 分页获取攻略列表（含审核状态）
 * @param params 分页及查询参数
 * @returns 攻略列表及总数
 */
export const getPosts = (params: { page: number; size: number;[key: string]: any }) =>
  request<{ list: Post[]; total: number }>({
    url: '/admin/posts',
    method: 'GET',
    params
  });

/**
 * 更新攻略审核状态
 * @param id 攻略ID
 * @param status 状态值（1已发布 2下架）
 * @returns void
 */
export const updatePostStatus = (id: number, status: number) =>
  request({
    url: `/admin/post/${id}/status`,
    method: 'PUT',
    data: { status },
  });