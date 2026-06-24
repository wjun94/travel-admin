import request from '@/lib/axios'

export interface WxUser {
  id: number;
  nickname: string;
  avatarUrl: string;
  role: number;
  createdAt: string;
}

export const getWxUsers = (params: { page: number; size: number;[key: string]: any }) => {
  return request<{ list: WxUser[]; total: number }>({
    url: '/admin/users',
    method: 'GET',
    params,
  });
};

export const updateWxUserRole = (id: number, role: number) => {
  return request({
    url: `/admin/user/${id}/role`,
    method: 'PUT',
    data: { role },
  });
};