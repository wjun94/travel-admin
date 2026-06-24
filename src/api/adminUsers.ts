import request from '@/lib/axios'
import type { Role } from './roles';

/**
 * 后台管理员用户
 */
export interface AdminUser {
  id: number;
  username: string;
  roleId: number;
  role: Role;
  status: number;
  createdAt: string;
}

/**
 * 分页获取后台管理员用户列表
 * @param params 分页及查询参数
 * @returns 管理员用户列表及总数
 */
export const getAdminUsers = (params: { page: number; size: number;[key: string]: any }) =>
  request<{ list: AdminUser[]; total: number }>({
    url: '/admin/admin/users',
    method: 'GET',
    params,
  });

/**
 * 创建后台管理员用户
 * @param data 包含用户名、密码、角色ID
 * @returns void
 */
export const createAdminUser = (data: { username: string; password: string; roleId: number }) =>
  request({
    url: '/admin/user',
    method: 'POST',
    data,
  });

/**
 * 更新后台管理员用户信息
 * @param id 用户ID
 * @param data 可更新角色ID、状态、密码
 * @returns void
 */
export const updateAdminUser = (id: number, data: { roleId?: number; status?: number; password?: string }) =>
  request({
    url: `/admin/user/${id}`,
    method: 'PUT',
    data,
  });

/**
 * 删除后台管理员用户
 * @param id 用户ID
 * @returns void
 */
export const deleteAdminUser = (id: number) =>
  request({
    url: `/admin/user/${id}`,
    method: 'DELETE',
  });