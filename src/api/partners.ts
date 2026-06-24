import request from '@/lib/axios'

/**
 * 创建官方搭子所需的参数
 */
export interface PartnerParams {
  destination: string;
  startDate: string;
  days: number;
  maxMembers: number;
  price: number;
  requirement?: string;
}

/**
 * 发布官方搭子团
 * @param data 搭子信息
 * @returns void
 */
export const createOfficialPartner = (data: PartnerParams) =>
  request({
    url: '/admin/official-partner',
    method: 'POST',
    data,
  });