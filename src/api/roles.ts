import request from '@/lib/axios'

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string;
}

export const getRoles = () =>
  request<Role[]>({
    url: '/admin/roles',
    method: 'GET',
  });

export const createRole = (data: { name: string; description: string; permissions: string }) =>
  request({
    url: '/admin/role',
    method: 'POST',
    data,
  });

export const updateRole = (id: number, data: { name?: string; description?: string; permissions?: string }) =>
  request({
    url: `/admin/role/${id}`,
    method: 'PUT',
    data,
  });

export const deleteRole = (id: number) =>
  request({
    url: `/admin/role/${id}`,
    method: 'DELETE',
  });