// 后端统一响应格式
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页通用结构
export interface PaginatedData<T> {
  list: T[];
  total: number;
}
