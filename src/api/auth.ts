import request from '@/lib/axios'

/**
 * 管理员登录接口返回类型
 */
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
}

/**
 * 管理员信息接口返回类型
 */
export interface AdminInfo {
  id: number;
  username: string;
  role: {
    name: string;
    permissions: string;
  };
}

/**
 * 管理员登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果，包含 token 和用户基本信息
 */
export const adminLogin = (username: string, password: string) =>
  request<LoginResponse>({
    url: '/admin/login',
    method: 'POST',
    data: { username, password },
  });

/**
 * 获取当前登录管理员信息
 * @returns 管理员详情及角色权限
 */
export const getAdminInfo = () =>
  request<AdminInfo>({
    url: '/admin/info',
    method: 'GET',
  });