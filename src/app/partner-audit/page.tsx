import { useRef, useState } from 'react';
import { Button, message, Tag, Drawer, Descriptions, Collapse, Spin, Divider, Image } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getPartners, getPartnerDetail, updatePartnerStatus, Partner, PartnerDetail } from '@/api/partners';
import dayjs from 'dayjs';

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_BASE_URL;

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '招募中', color: 'green' },
  1: { label: '满员', color: 'blue' },
  2: { label: '已取消', color: 'red' },
  3: { label: '已过期', color: 'default' },
  4: { label: '已下架', color: 'red' },
};

const sectionTypeMap: Record<string, string> = {
  attraction: '打卡地',
  transport: '交通',
  hotel: '住宿',
  food: '美食',
  shopping: '购物',
  tips: '避坑',
};

/** 行程项目类型标签配色（背景色/字色） */
const sectionTypeStyleMap: Record<string, { bg: string; color: string }> = {
  attraction: { bg: '#F9F0FF', color: '#722ED1' }, // 打卡地-紫
  transport: { bg: '#E6F4FF', color: '#0958D9' },  // 交通-蓝
  hotel: { bg: '#F6FFED', color: '#389E0D' },      // 住宿-绿
  food: { bg: '#FFF7E6', color: '#D46B08' },       // 美食-橙
  shopping: { bg: '#FFF0F6', color: '#C41D7F' },   // 购物-粉
  tips: { bg: '#FFFBE6', color: '#D48806' },       // 避坑-金
};

const feeModeMap: Record<number, string> = { 0: '免费', 1: 'AA制', 2: '组织者全包', 3: '人均固定预算' };
const genderLimitMap: Record<number, string> = { 0: '不限性别', 1: '仅男生', 2: '仅女生' };
const visibilityMap: Record<number, string> = { 0: '全部可见', 1: '同城可见', 2: '好友可见' };
const joinModeMap: Record<number, string> = { 0: '需审核', 1: '直接加入' };

const PartnerAuditPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<PartnerDetail | null>(null);

  const handleStatus = async (id: string, status: number) => {
    await updatePartnerStatus(id, status);
    message.success('操作成功');
    tableRef.current?.handleRefresh();
  };

  const handleViewDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getPartnerDetail(id);
      setDetail(res.data);
    } catch (err) {
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const coverUrl = (src: string) => {
    if (!src) return '';
    return src.startsWith('http') ? src : `${STATIC_DOMAIN}/${src}`;
  };

  const renderItems = (items: any[]) =>
    items?.map((item) => (
      <div key={item.id} style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>
          {item.sectionType && (
            <Tag
              style={{
                marginRight: 6,
                backgroundColor: sectionTypeStyleMap[item.sectionType]?.bg || '#F5F5F5',
                color: sectionTypeStyleMap[item.sectionType]?.color || '#595959',
                borderColor: sectionTypeStyleMap[item.sectionType]?.bg || '#F5F5F5',
              }}
            >
              {sectionTypeMap[item.sectionType] || item.sectionType}
            </Tag>
          )}
          {item.title}
        </div>
        {item.description && <p style={{ color: '#666', margin: '4px 0' }}>{item.description}</p>}
        {(item.startTime || item.endTime) && (
          <div style={{ color: '#999', fontSize: 12 }}>
            时间：{item.startTime || ''}
            {item.startTime && item.endTime ? ' - ' : ''}
            {item.endTime || ''}
          </div>
        )}
        {item.address && <div style={{ color: '#999', fontSize: 12 }}>地址：{item.address}</div>}
        {item.needReservation && (
          <div style={{ color: '#F97316', fontSize: 12 }}>
            需预约{item.ticketChannel ? `（${item.ticketChannel}）` : ''}
            {item.ticketPrice != null ? ` · 票价 ¥${item.ticketPrice}` : ''}
          </div>
        )}
        {item.transportMode && (
          <div style={{ color: '#999', fontSize: 12 }}>
            交通：{item.transportMode}
            {item.startPoint && item.endPoint ? `（${item.startPoint} → ${item.endPoint}）` : ''}
          </div>
        )}
        {Array.isArray(item.images) && item.images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
            {item.images.slice(0, 6).map((img: string, idx: number) => (
              <Image key={idx} src={img.startsWith('http') ? img : `${STATIC_DOMAIN}/${img}`} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </div>
        )}
      </div>
    ));

  const columns = [
    {
      title: '信息',
      key: 'info',
      width: 240,
      render: (_: unknown, record: Partner) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {record.cover ? (
            <Image
              src={coverUrl(record.cover)}
              style={{ width: 42, height: 42, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: 4, background: '#f5f5f5', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#1f2937',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {record.title}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#9ca3af',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {record.destination || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (v: number) => (v === 1 ? <Tag color="blue">官方</Tag> : <Tag color="green">用户</Tag>),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 80,
      render: (v: string) => (v ? <Tag color="blue">{v}</Tag> : '-'),
    },
    { title: '作者', dataIndex: 'authorName', width: 110, ellipsis: true, render: (v: string) => v || '-' },
    {
      title: '人数',
      width: 90,
      render: (_: unknown, record: Partner) => `${record.currentMembers}/${record.maxMembers}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => {
        const info = statusMap[status];
        return <Tag color={info?.color}>{info?.label}</Tag>;
      },
    },
    {
      title: '数据',
      dataIndex: 'viewCount',
      width: 130,
      render: (_: unknown, record: Partner) => `浏览 ${record.viewCount} · 赞 ${record.likeCount}`,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Partner) => (
        <>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.status !== 4 ? (
            <Button type="link" danger onClick={() => handleStatus(record.id, 4)}>
              下架
            </Button>
          ) : (
            <Button type="link" onClick={() => handleStatus(record.id, 0)}>
              恢复招募
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<Partner>
        ref={tableRef}
        title="搭子审核"
        rowKey="id"
        columns={columns}
        request={(params: any) => getPartners({ ...params, type: -1 })}
        scroll={{ x: 1300 }}
        searchFields={[
          { name: 'destination', label: '目的地', type: 'input' },
          {
            name: 'type',
            label: '类型',
            type: 'select',
            options: [
              { value: -1, label: '全部' },
              { value: 0, label: '用户发起' },
              { value: 1, label: '官方活动' },
            ],
          },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            options: [
              { value: 0, label: '招募中' },
              { value: 1, label: '满员' },
              { value: 2, label: '已取消' },
              { value: 3, label: '已过期' },
              { value: 4, label: '已下架' },
            ],
          },
        ]}
      />

      <Drawer title="搭子详情" width={640} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin />
          </div>
        ) : (
          detail && (
            <div>
              {detail.partner.cover && (
                <Image
                  src={coverUrl(detail.partner.cover)}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <h3 style={{ margin: '12px 0 4px', fontSize: 18 }}>{detail.partner.title}</h3>
              <Tag color={statusMap[detail.partner.status]?.color}>
                {statusMap[detail.partner.status]?.label}
              </Tag>
              <Descriptions size="small" column={2} style={{ marginTop: 12 }}>
                <Descriptions.Item label="作者">{detail.authorName || '-'}</Descriptions.Item>
                <Descriptions.Item label="类型">
                  {detail.partner.type === 1 ? <Tag color="blue">官方</Tag> : <Tag color="green">用户</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="分类">{detail.partner.category || '-'}</Descriptions.Item>
                <Descriptions.Item label="出行类型">
                  {detail.partner.locationType === 1 ? '线上' : '线下'}
                </Descriptions.Item>
                <Descriptions.Item label="目的地">{detail.partner.destination || '-'}</Descriptions.Item>
                <Descriptions.Item label="详细地址">{detail.partner.address || '-'}</Descriptions.Item>
                <Descriptions.Item label="出发日期">
                  {detail.partner.startDate ? dayjs(detail.partner.startDate).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="结束日期">
                  {detail.partner.endDate ? dayjs(detail.partner.endDate).format('YYYY-MM-DD') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="天数">{detail.partner.days}</Descriptions.Item>
                <Descriptions.Item label="人数">
                  {detail.partner.currentMembers}/{detail.partner.maxMembers}
                  {detail.partner.minMembers > 0 ? `（最小 ${detail.partner.minMembers}）` : ''}
                </Descriptions.Item>
                <Descriptions.Item label="官方定价">
                  {detail.partner.officialPrice ? `¥${detail.partner.officialPrice}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="费用模式">
                  {feeModeMap[detail.partner.feeMode] || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="性别限制">
                  {genderLimitMap[detail.partner.genderLimit] || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="年龄要求">
                  {detail.partner.minAge}-{detail.partner.maxAge}
                </Descriptions.Item>
                <Descriptions.Item label="可见性">
                  {visibilityMap[detail.partner.visibility] || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="加入方式">
                  {joinModeMap[detail.partner.joinMode] || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="浏览量">{detail.partner.viewCount}</Descriptions.Item>
                <Descriptions.Item label="赞/藏/评">
                  {detail.partner.likeCount} / {detail.partner.favoriteCount} / {detail.partner.commentCount}
                </Descriptions.Item>
              </Descriptions>
              {detail.partner.travelTags && (
                <div style={{ margin: '8px 0' }}>
                  {detail.partner.travelTags
                    .split(',')
                    .filter(Boolean)
                    .map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                </div>
              )}
              {detail.partner.feeInclude && (
                <p style={{ margin: '6px 0' }}>
                  <b>费用包含：</b>
                  {detail.partner.feeInclude}
                </p>
              )}
              {detail.partner.feeExclude && (
                <p style={{ margin: '6px 0' }}>
                  <b>费用不含：</b>
                  {detail.partner.feeExclude}
                </p>
              )}
              {detail.partner.desc && <p style={{ color: '#666' }}>{detail.partner.desc}</p>}
              {detail.partner.requirement && (
                <p style={{ color: '#666' }}>
                  <b>要求：</b>
                  {detail.partner.requirement}
                </p>
              )}
              {detail.days?.length > 0 && (
                <>
                  <Divider style={{ margin: '12px 0' }}>行程安排</Divider>
                  <Collapse
                    items={detail.days.map((d) => ({
                      key: d.id,
                      label: `Day ${d.dayNumber} ${d.title || ''}`,
                      children: renderItems(d.items),
                    }))}
                  />
                </>
              )}
            </div>
          )
        )}
      </Drawer>
    </div>
  );
};

export default PartnerAuditPage;
