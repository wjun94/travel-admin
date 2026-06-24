import request from '@/lib/axios'

/** 搭子参数（创建/编辑用） */
export interface PartnerParams {
  destination: string;
  startDate: string;
  days: number;
  maxMembers: number;
  price: number;
  requirement?: string;
}

/** 搭子实体 */
export interface Partner {
  id: number;
  userId: number;
  type: number;           // 0 用户发起, 1 官方活动
  destination: string;
  startDate: string;
  days: number;
  requirement: string;
  maxMembers: number;
  currentMembers: number;
  price: number;
  status: number;         // 0 招募中, 1 满员, 2 取消
  createdAt: string;
}

/** 获取搭子列表 */
export const getPartners = (params: { page: number; size: number; [key: string]: any }) =>
  request<{ list: Partner[]; total: number }>({
    url: '/admin/partners',
    method: 'GET',
    params,
  });

/** 发布官方搭子 */
export const createOfficialPartner = (data: PartnerParams) =>
  request({
    url: '/admin/official-partner',
    method: 'POST',
    data,
  });