import request from '@/lib/axios'

/**
 * 投诉实体
 */
export interface Complaint {
  id: string;
  userId: string; // 投诉人ID
  userName?: string; // 投诉人昵称
  avatarUrl?: string; // 投诉人头像
  targetType: string; // user/guide/trip/partner/comment/other
  targetId: string; // 被投诉对象ID
  targetName?: string; // 被投诉对象摘要
  reason: string; // 投诉原因
  content: string; // 详细描述
  images?: string; // 图片URL（JSON数组字符串，最多9张）
  status: number; // 0待处理 1已处理 2已驳回
  handleNote: string; // 处理备注
  reply: string; // 后台回复（小程序可见）
  handledAt?: string; // 处理时间
  createdAt: string; // 提交时间
}

/** 投诉对象类型名称 */
export const COMPLAINT_TARGET_NAMES: Record<string, string> = {
  user: '用户',
  guide: '攻略',
  trip: '行程',
  partner: '搭子',
  comment: '评论',
  other: '其他',
};

/** 投诉状态名称 */
export const COMPLAINT_STATUS_NAMES = ['待处理', '已处理', '已驳回'];

/**
 * 分页获取投诉列表
 */
export const getComplaints = (params?: { page?: number; pageSize?: number; status?: number; targetType?: string }) =>
  request<{ list: Complaint[]; total: number }>({
    url: '/admin/complaints',
    method: 'GET',
    params,
  });

/**
 * 处理投诉（已处理/驳回）
 */
export const handleComplaint = (id: string, data: { status: number; handleNote?: string; reply?: string }) =>
  request({
    url: `/admin/complaint/${id}/status`,
    method: 'PUT',
    data,
  });

/**
 * 删除投诉
 */
export const deleteComplaint = (id: string) =>
  request({
    url: `/admin/complaint/${id}`,
    method: 'DELETE',
  });
