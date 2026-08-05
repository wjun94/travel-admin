import request from '@/lib/axios'

/** 搭子参数（创建官方搭子，与后端 model.Partner 对齐） */
export interface PartnerParams {
  title: string;
  category?: string;
  destination: string;
  cover?: string;
  startDate: string;
  days: number;
  maxMembers: number;
  officialPrice?: number;
  desc?: string;
  requirement?: string;
}

/** 搭子实体 */
export interface Partner {
  id: string;
  userId: string;
  type: number;           // 0 用户发起, 1 官方活动
  title: string;
  category: string;
  destination: string;
  startDate: string;
  days: number;
  desc: string;
  requirement: string;
  maxMembers: number;
  currentMembers: number;
  officialPrice: number;
  status: number;         // 0 招募中, 1 满员, 2 取消, 3 已过期
  createdAt: string;
}

/** 获取官方搭子列表（分页，支持目的地/状态筛选） */
export const getPartners = (params: { page: number; pageSize: number; destination?: string; status?: number; [key: string]: any }) =>
  request<{ list: Partner[]; total: number }>({
    url: '/admin/partners',
    method: 'GET',
    params,
  });

/** 发布官方搭子 */
export const createOfficialPartner = (data: PartnerParams) =>
  request({
    url: '/admin/partner',
    method: 'POST',
    data,
  });