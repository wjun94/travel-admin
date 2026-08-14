import { useRef, useState } from 'react';
import { Button, Tag, message, Drawer, Descriptions, Collapse, Spin, Divider } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { Image } from '@/components';
import { getPosts, updatePostStatus, getGuideDetail, Post, GuideDetail } from '@/api/posts';
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
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已下架', color: 'red' },
};

const PostsPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<GuideDetail | null>(null);

  const handleStatus = async (id: string, status: number) => {
    await updatePostStatus(id, status);
    message.success('操作成功');
    tableRef.current?.handleRefresh();
  };

  const handleViewDetail = async (id: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await getGuideDetail(id);
      setDetail(res.data);
    } catch (err) {
      message.error('获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: '信息',
      key: 'info',
      width: 240,
      render: (_: unknown, record: Post) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {record.coverImage ? (
            <Image
              src={record.coverImage}
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
      title: '数据',
      dataIndex: 'viewCount',
      width: 130,
      render: (_: unknown, record: Post) => `浏览 ${record.viewCount} · 赞 ${record.likeCount}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 200,
      render: (_: any, record: Post) => (
        <>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
          {record.status !== 1 && (
            <Button type="link" onClick={() => handleStatus(record.id, 1)}>发布</Button>
          )}
          {record.status !== 2 && (
            <Button type="link" danger onClick={() => handleStatus(record.id, 2)}>下架</Button>
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
        title="攻略审核"
        rowKey="id"
        columns={columns}
        request={getPosts}
        searchFields={[
          { name: 'title', label: '标题', type: 'input' },
          { name: 'destination', label: '目的地', type: 'input' },
          {
            name: 'status',
            label: '状态',
            type: 'select',
            options: [
              { value: 0, label: '草稿' },
              { value: 1, label: '已发布' },
              { value: 2, label: '已下架' },
            ],
          },
        ]}
      />

      <Drawer title="攻略详情" width={640} open={detailOpen} onClose={() => setDetailOpen(false)}>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Spin />
          </div>
        ) : (
          detail && (
            <div>
              {detail.guide.coverImage && (
                <Image
                  src={detail.guide.coverImage}
                  style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                />
              )}
              <h3 style={{ margin: '12px 0 4px', fontSize: 18 }}>{detail.guide.title}</h3>
              <Tag color={statusMap[detail.guide.status]?.color}>
                {statusMap[detail.guide.status]?.label}
              </Tag>
              <Descriptions size="small" column={2} style={{ marginTop: 12 }}>
                <Descriptions.Item label="作者">{detail.authorName || '-'}</Descriptions.Item>
                <Descriptions.Item label="目的地">{detail.guide.destination || '-'}</Descriptions.Item>
                <Descriptions.Item label="难度">{detail.guide.difficulty || '-'}</Descriptions.Item>
                <Descriptions.Item label="建议天数">{detail.guide.recommendedDays ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="最佳季节">{detail.guide.bestSeason || '-'}</Descriptions.Item>
                <Descriptions.Item label="预算">
                  {detail.guide.budgetMin != null && detail.guide.budgetMax != null
                    ? `¥${detail.guide.budgetMin} - ¥${detail.guide.budgetMax}`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="适合人群">{detail.guide.crowdType || '-'}</Descriptions.Item>
                <Descriptions.Item label="浏览量">{detail.guide.viewCount}</Descriptions.Item>
                <Descriptions.Item label="赞/藏/评">
                  {detail.guide.likeCount} / {detail.guide.favoriteCount ?? 0} / {detail.guide.commentCount ?? 0}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(detail.guide.createdAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              </Descriptions>
              {detail.guide.tags && (
                <div style={{ margin: '8px 0' }}>
                  {(JSON.parse(detail.guide.tags) as string[]).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
              {detail.guide.summary && (
                <p style={{ marginTop: 8, color: '#666' }}>{detail.guide.summary}</p>
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
    </>
  );
};

export default PostsPage;
