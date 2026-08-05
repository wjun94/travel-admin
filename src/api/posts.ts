import request from '@/lib/axios'

/**
 * 攻略（与后端 model.Guide 对齐）
 */
export interface Post {
  id: string;
  userId: string;
  title: string;
  coverImage: string;
  destination: string;
  summary: string;
  viewCount: number;
  likeCount: number;
  status: number;   // 0草稿 1已发布 2下架
  createdAt: string;
}

/**
 * 分页获取攻略列表（含审核状态，支持状态筛选）
 * @param params 分页及查询参数（page/pageSize/status）
 * @returns 攻略列表及总数
 */
export const getPosts = (params: { page: number; pageSize: number; status?: number; [key: string]: any }) =>
  request<{ list: Post[]; total: number }>({
    url: '/admin/guides',
    method: 'GET',
    params
  });

/**
 * 更新攻略审核状态
 * @param id 攻略ID
 * @param status 状态值（1已发布 2下架）
 * @returns void
 */
export const updatePostStatus = (id: string, status: number) =>
  request({
    url: `/admin/guide/${id}/status`,
    method: 'PUT',
    data: { status },
  });