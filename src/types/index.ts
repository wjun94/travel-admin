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

// 用户
export interface User {
  id: number;
  openid: string;
  unionid: string;
  nickname: string;
  avatarUrl: string;
  role: number;        // 0普通 1领队 2管理员
  createdAt: string;
}

// 攻略帖子
export interface Post {
  id: number;
  userId: number;
  content: string;
  location: string;
  city: string;
  tags: string;
  status: number;      // 0审核中 1已发布 2下架
  likeCount: number;
  shareCount: number;
  createdAt: string;
}

// 搭子
export interface Partner {
  id: number;
  userId: number;
  type: number;        // 0用户发起 1官方活动
  destination: string;
  startDate: string;
  days: number;
  requirement: string;
  maxMembers: number;
  currentMembers: number;
  price: number;
  status: number;      // 0招募中 1满员 2取消
  createdAt: string;
}

// 推荐
export interface Recommendation {
  id: number;
  title: string;
  cover: string;
  city: string;
  type: string;        // house / activity
  link: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

// 仪表盘数据
export interface DashboardData {
  userCount: number;
  postCount: number;
  partnerCount: number;
}