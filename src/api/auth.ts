import request from "@/lib/axios";

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息（包含权限）
export interface UserInfo {
  id: number
  username: string
  roles: string[]
  permissions: string[]
}

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

// 登录接口
export function loginApi(data: LoginParams) {
  return request.post<LoginResponse>("/admin/login", data);
}

// 获取用户信息 + 权限 ← 重点
export function getUserInfoApi() {
  return request.get<AdminInfo>('/admin/info')
}

// 登出接口
export function logoutApi() {
  return request.post("/auth/logout");
}
