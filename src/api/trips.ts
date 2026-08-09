import request from '@/lib/axios'

/** 行程实体（后台行程审核列表） */
export interface Trip {
  id: string;
  userId: string;
  title: string;
  coverImage: string;
  destinations: string[];
  totalBudget: number;
  isOverseas: number;   // 0国内 1境外
  viewCount: number;
  likeCount: number;
  status: number;       // 1草稿 2已发布 3已归档完结
  isPublic: number;     // 0私密 1公开
  isAI: number;         // 0手动 1AI
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorAvatar: string;
  itemCount: number;    // 行程项数
}

/** 获取行程列表（分页，支持状态/关键词筛选） */
export const getTrips = (params: { page: number; pageSize: number; status?: number; keyword?: string; [key: string]: any }) =>
  request<{ list: Trip[]; total: number }>({
    url: '/admin/trips',
    method: 'GET',
    params,
  });

/** 审核行程（发布/下架/归档） */
export const updateTripStatus = (id: string, status: number) =>
  request({
    url: `/admin/trip/${id}/status`,
    method: 'PUT',
    data: { status },
  });

/**
 * 行程日
 */
export interface TripDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  items: TripItem[];
}

/**
 * 行程项
 */
export interface TripItem {
  id: string;
  sectionType: string;   // 板块类型：hotel/transport/food/spot/shop/activity/other
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
 * 同行者
 */
export interface TripMember {
  id: string;
  name: string;
  role: string;   // owner/editor/viewer
}

/**
 * 行程详情（含行程日/行程项/同行者）
 */
export interface TripDetail extends Trip {
  summary?: string;
  days?: TripDay[];
  members?: TripMember[];
}

/**
 * 获取行程详情
 */
export const getTripDetail = (id: string) =>
  request<TripDetail>({
    url: `/admin/trip/${id}`,
    method: 'GET',
  });
