import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";
import { useAuthStore } from "@/stores/authStore";

/** 后端统一响应格式 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 分页通用结构 */
export interface PageData<T> {
  list: T[];
  total: number;
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：统一处理业务码，只返回 data
instance.interceptors.response.use(
  (res) => {
    // 后端统一响应：{ code, msg, data }
    const body = res.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code !== 0) {
        message.error(body.msg || '请求失败');
        return Promise.reject(new Error(body.msg || '请求失败'));
      }
      return body; // 返回完整响应体，页面通过 res.data 取业务数据
    }
    return body;
  },
  (err) => {
    console.log(err.response);
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      message.error("登录已过期");
      // window.location.href = '/login'
    } else {
      message.error(err?.response?.data?.msg || err.message || "请求失败");
    }

    return Promise.reject(err);
  }
);

/**
 * 通用请求函数：T 为业务 data 类型，返回完整响应体 { code, msg, data }
 */
export function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return instance.request(config) as Promise<ApiResponse<T>>;
}

export default request;
