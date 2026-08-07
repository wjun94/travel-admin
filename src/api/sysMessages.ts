import request from '@/lib/axios'

/**
 * 系统消息记录
 */
export interface SysMessage {
  id: string;
  title: string; // 消息标题
  content: string; // 消息内容
  linkUrl: string; // 跳转链接
  targetType: string; // 接收人群：all全部 users指定用户 group用户分组
  targetUserIds: string; // 指定用户ID列表（JSON字符串）
  targetGroup: string; // 用户分组：normal普通 leader领队 admin管理员
  status: number; // 发送状态：0待发送 1已发送 2已取消
  sendTime: string; // 计划发送时间
  sentAt?: string; // 实际发送时间
  sentCount: number; // 实际送达人数
  operatorId: string; // 操作管理员ID
  operatorName?: string; // 操作管理员用户名
  targetName?: string; // 接收人群名称
  groupName?: string; // 用户分组名称
  createdAt: string;
}

/** 接收人群名称 */
export const SYS_MESSAGE_TARGET_NAMES: Record<string, string> = {
  all: '全部用户',
  users: '指定用户',
  group: '用户分组',
};

/** 用户分组名称 */
export const SYS_MESSAGE_GROUP_NAMES: Record<string, string> = {
  normal: '普通用户',
  leader: '领队',
  admin: '管理员',
};

/** 发送状态名称 */
export const SYS_MESSAGE_STATUS_NAMES = ['待发送', '已发送', '已取消'];

/**
 * 分页获取系统消息列表
 */
export const getSysMessages = (params?: { page?: number; pageSize?: number; status?: number }) =>
  request<{ list: SysMessage[]; total: number }>({
    url: '/admin/sys-messages',
    method: 'GET',
    params,
  });

/**
 * 创建系统消息（立即发送 / 定时发送）
 * @param data title/content 必填；sendTime 为空表示立即发送
 */
export const createSysMessage = (data: {
  title: string;
  content: string;
  linkUrl?: string;
  targetType: string;
  targetUserIds?: string[];
  targetGroup?: string;
  sendTime?: string;
}) =>
  request<SysMessage>({
    url: '/admin/sys-message',
    method: 'POST',
    data,
  });

/**
 * 取消定时发送（仅待发送状态可取消）
 */
export const cancelSysMessage = (id: string) =>
  request({
    url: `/admin/sys-message/${id}/cancel`,
    method: 'PUT',
  });
