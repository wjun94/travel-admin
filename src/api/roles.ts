import request from '@/lib/axios'

/**
 * 角色实体
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string; // 权限JSON字符串，如 ["dashboard","users_manage"]
}

/**
 * 分页获取角色列表
 * @param params 分页参数
 * @returns 角色列表及总数
 */
export const getRoles = (params?: { page?: number; pageSize?: number }) =>
  request<{ list: Role[]; total: number }>({
    url: '/admin/roles',
    method: 'GET',
    params,
  });

/**
 * 创建新角色
 * @param data 角色名称、描述、权限JSON字符串
 * @returns void
 */
export const createRole = (data: { name: string; description: string; permissions: string }) =>
  request({
    url: '/admin/role',
    method: 'POST',
    data,
  });

/**
 * 更新角色信息
 * @param id 角色ID
 * @param data 可选更新的字段
 * @returns void
 */
export const updateRole = (id: string, data: { name?: string; description?: string; permissions?: string }) =>
  request({
    url: `/admin/role/${id}`,
    method: 'PUT',
    data,
  });

/**
 * 删除角色
 * @param id 角色ID
 * @returns void
 */
export const deleteRole = (id: string) =>
  request({
    url: `/admin/role/${id}`,
    method: 'DELETE',
  });