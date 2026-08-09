import { useRef, useState } from 'react';
import { Button, message, Tag, Drawer, Descriptions, Collapse, Spin, Divider } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { Image } from '@/components';
import { getTrips, updateTripStatus, getTripDetail, Trip, TripDetail } from '@/api/trips';
import dayjs from 'dayjs';

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

const statusMap: Record<number, { label: string; color: string }> = {
  1: { label: '草稿', color: 'default' },
  2: { label: '已发布', color: 'green' },
  3: { label: '已归档', color: 'blue' },
};

const TripsPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<TripDetail | null>(null);

  const handleStatus = async (id: string, status: number) => {
    await updateTripStatus(id, status);
    message.success('操作成功');
    tableRef.current?.handleRefresh();
  };

  const handleViewDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getTripDetail(id);
      setDetail(res.data);
    } catch (err) {
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 90,
      render: (src: string) => (
        <Image src={src} style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '作者', dataIndex: 'authorName', width: 110, ellipsis: true },
    {
      title: '目的地',
      dataIndex: 'destinations',
      width: 140,
      ellipsis: true,
      render: (val: string[]) => (Array.isArray(val) && val.length ? val.join(' · ') : '-'),
    },
    {
      title: '预算',
      dataIndex: 'totalBudget',
      width: 90,
      render: (val: number) => (val ? `¥${val}` : '-'),
    },
    { title: '行程项', dataIndex: 'itemCount', width: 70 },
    {
      title: '数据',
      width: 120,
      render: (_: unknown, record: Trip) => `浏览 ${record.viewCount} · 赞 ${record.likeCount}`,
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
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 260,
      render: (_: any, record: Trip) => (
        <>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.status !== 2 && (
            <Button type="link" onClick={() => handleStatus(record.id, 2)}>
              发布
            </Button>
          )}
          {record.status !== 1 && (
            <Button type="link" danger onClick={() => handleStatus(record.id, 1)}>
              下架
            </Button>
          )}
        </>
      ),
    },
  ];

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
              <Image key={idx} src={img} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </div>
        )}
      </div>
    ));

  return (
    <>
      <ProTable
        ref={tableRef}
        title="行程审核"
        rowKey="id"
        columns={columns}
        request={getTrips}
        scroll={{ x: 1300 }}
        searchFields={[
          { name: 'keyword', label: '关键词', type: 'input', placeholder: '标题/目的地' },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            options: [
              { value: 1, label: '草稿' },
              { value: 2, label: '已发布' },
            ],
          },
        ]}
      />

      <Drawer title="行程详情" width={640} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin />
          </div>
        ) : (
          detail && (
            <div>
              {detail.coverImage && (
                <Image
                  src={detail.coverImage}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <h3 style={{ margin: '12px 0 4px', fontSize: 18 }}>{detail.title}</h3>
              <Tag color={statusMap[detail.status]?.color}>{statusMap[detail.status]?.label}</Tag>
              <Descriptions size="small" column={2} style={{ marginTop: 12 }}>
                <Descriptions.Item label="作者">{detail.authorName || '-'}</Descriptions.Item>
                <Descriptions.Item label="目的地">
                  {Array.isArray(detail.destinations) && detail.destinations.length
                    ? detail.destinations.join(' · ')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="预算">
                  {detail.totalBudget ? `¥${detail.totalBudget}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="境内/境外">
                  {detail.isOverseas === 1 ? '境外' : '国内'}
                </Descriptions.Item>
                <Descriptions.Item label="可见性">{detail.isPublic === 1 ? '公开' : '私密'}</Descriptions.Item>
                <Descriptions.Item label="行程项数">{detail.itemCount}</Descriptions.Item>
                <Descriptions.Item label="浏览量">{detail.viewCount}</Descriptions.Item>
                <Descriptions.Item label="点赞">{detail.likeCount}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              </Descriptions>
              {detail.summary && <p style={{ marginTop: 8, color: '#666' }}>{detail.summary}</p>}
              {detail.days && detail.days.length > 0 && (
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
    </>
  );
};

export default TripsPage;
