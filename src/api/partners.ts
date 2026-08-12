import request from '@/lib/axios'

/** 搭子参数（创建官方搭子，与后端 model.Partner / CreatePartnerReq 对齐） */
export interface PartnerParams {
  title: string;
  category?: string;
  cover?: string;
  destination: string;
  locationType?: number;      // 0线下 1线上
  address?: string;
  onlineLink?: string;
  startDate: string;
  endDate?: string;
  days?: Partial<PartnerDay>[];   // 行程日骨架（天数由数组长度派生，后端级联保存）
  travelTags?: string;        // 逗号分隔，如：自驾,徒步,美食
  desc?: string;
  requirement?: string;
  maxMembers: number;
  minMembers?: number;        // 最小成团人数
  genderLimit?: number;       // 0不限 1仅男生 2仅女生
  maleCount?: number;         // 男生需求数
  femaleCount?: number;       // 女生需求数
  minAge?: number;
  maxAge?: number;
  feeMode?: number;           // 0免费 1AA 2组织者全包 3人均固定预算
  budgetPerPerson?: number;   // 人均预算
  officialPrice?: number;
  feeInclude?: string;
  feeExclude?: string;
  estTotal?: number;          // 预估总价
  visibility?: number;        // 0全部可见 1同城可见 2好友可见
  joinMode?: number;          // 0需审核 1直接加入
  autoClose?: number;         // 满员自动关闭 0否 1是
  allowShare?: number;        // 允许转发 0否 1是
  allowCollect?: number;      // 允许收藏 0否 1是
  isPublic?: number;          // 0仅自己可见 1公开招募
}

/** 搭子实体 */
export interface Partner {
  id: string;
  userId: string;
  type: number;           // 0 用户发起, 1 官方活动
  title: string;
  category: string;
  cover: string;
  images: string;         // 多图 JSON 数组字符串
  destination: string;
  locationType: number;   // 0线下 1线上
  address: string;
  onlineLink: string;
  startDate: string;
  endDate: string;
  dayCount: number;           // 出行天数（由行程日列表长度派生）
  travelTags: string;     // 逗号分隔
  tags: string;           // 多选标签 JSON 数组字符串
  desc: string;
  requirement: string;
  maxMembers: number;
  minMembers: number;
  currentMembers: number;
  genderLimit: number;
  maleCount: number;
  femaleCount: number;
  minAge: number;
  maxAge: number;
  feeMode: number;
  budgetPerPerson: number;
  officialPrice: number;
  feeInclude: string;
  feeExclude: string;
  estTotal: number;
  visibility: number;
  joinMode: number;
  autoClose: number;
  allowShare: number;
  allowCollect: number;
  isPublic: number;
  viewCount: number;
  likeCount: number;
  favoriteCount: number;
  commentCount: number;
  status: number;         // 0 招募中, 1 满员, 2 取消, 3 已过期, 4 已下架
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
}

/** 获取搭子列表（分页，支持目的地/状态/类型筛选；type -1全部 0用户 1官方，默认1） */
export const getPartners = (params: { page: number; pageSize: number; destination?: string; status?: number; type?: number; [key: string]: any }) =>
  request<{ list: Partner[]; total: number }>({
    url: '/admin/partners',
    method: 'GET',
    params,
  });

/** 审核搭子（0恢复招募 1满员 2已取消 3已过期 4下架） */
export const updatePartnerStatus = (id: string, status: number) =>
  request({
    url: `/admin/partner/${id}/status`,
    method: 'PUT',
    data: { status },
  });

/** 发布官方搭子 */
export const createOfficialPartner = (data: PartnerParams) =>
  request({
    url: '/admin/partner',
    method: 'POST',
    data,
  });

/** 搭子行程日（与后端 model.PartnerDay 对齐） */
export interface PartnerDay {
  id: string;
  partnerId: string;
  dayNumber: number;
  date: string;
  title: string;
  items: PartnerDayItem[];
}

/** 搭子行程项（与后端 model.PartnerDayItem 对齐） */
export interface PartnerDayItem {
  id: string;
  sectionType: string;   // 板块类型：attraction/transport/hotel/food/shopping/tips
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  address: string;
  images: string[];
  needReservation: boolean;
  ticketChannel: string;
  ticketPrice: number | null;
  transportMode: string;
  startPoint: string;
  endPoint: string;
}

/**
 * 搭子详情（含关联行程安排）
 */
export interface PartnerDetail {
  authorName?: string;
  authorAvatar?: string;
  partner: Partner & {
    endDate: string;
    address: string;
    onlineLink: string;
    images: string;
    tags: string;
    richDesc?: string;
  };
  days: PartnerDay[];
}

/**
 * 获取搭子详情
 */
export const getPartnerDetail = (id: string) =>
  request<PartnerDetail>({
    url: `/admin/partner/${id}`,
    method: 'GET',
  });
