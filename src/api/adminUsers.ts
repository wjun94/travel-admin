import request from '@/lib/axios'
import { PaginatedData } from '@/types';

export interface AdminUser {
  id: number;
  username: string;
  roleId: number;
  role: { id: number; name: string; permissions: string };
  status: number;
  createdAt: string;
}

export const getAdminUsers = (params: any) =>
  request<PaginatedData<AdminUser>>({
    url: '/admin/admin/users',
    method: 'GET',
    params,
  });

export const createAdminUser = (data: { username: string; password: string; roleId: number }) =>
  request({
    url: '/admin/user',
    method: 'POST',
    data,
  });

export const updateAdminUser = (id: number, data: { roleId?: number; status?: number; password?: string }) =>
  request({
    url: `/admin/user/${id}`,
    method: 'PUT',
    data,
  });

export const deleteAdminUser = (id: number) =>
  request({
    url: `/admin/user/${id}`,
    method: 'DELETE',
  });