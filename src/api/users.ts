//  (小程序用户管理)
import request from '@/lib/axios'

/**
 * 小程序用户
 */
export interface WxUser {
  id: number;
  nickname: string;
  avatarUrl: string;
  role: number;   // 0普通 1领队 2管理员
  createdAt: string;
}

/**
 * 分页获取小程序用户列表
 * @param params 分页及查询参数
 * @returns 用户列表及总数
 */
export const getWxUsers = (params: { page: number; size: number;[key: string]: any }) =>
  request<{ list: WxUser[]; total: number }>({
    url: '/admin/users',
    method: 'GET',
    params
  });

/**
 * 更新小程序用户的角色
 * @param id 用户ID
 * @param role 新角色（0普通 1领队 2管理员）
 * @returns void
 */
export const updateWxUserRole = (id: number, role: number) =>
  request({
    url: `/admin/user/${id}/role`,
    method: 'PUT',
    data: { role },
  });