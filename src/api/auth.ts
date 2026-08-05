import request from "@/lib/axios";

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 管理员登录接口返回类型
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

/**
 * 管理员信息接口返回类型
 */
export interface AdminInfo {
  id: string;
  username: string;
  role: {
    name: string;
    permissions: string;
  };
}

// 登录接口
export function loginApi(data: LoginParams) {
  return request<LoginResponse>({ url: "/admin/login", method: "POST", data });
}

// 获取用户信息 + 权限
export function getUserInfoApi() {
  return request<AdminInfo>({ url: "/admin/info", method: "GET" })
}

// 登出：后端无登出接口，由前端清空本地状态
export function logoutApi() {
  return Promise.resolve()
}
