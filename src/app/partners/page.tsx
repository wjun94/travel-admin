import { useRef, useState } from 'react';
import {
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  message,
  Tag,
  Select,
  Image,
  Divider,
  Row,
  Col,
  Drawer,
  Descriptions,
  Collapse,
  Spin,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import ProTable, { ProTableRef } from '@/components/ProTable';
import UploadImage from '@/components/UploadImage';
import { getPartners, createOfficialPartner, getPartnerDetail, Partner, PartnerParams, PartnerDetail } from '@/api/partners';
import dayjs from 'dayjs';

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_BASE_URL;

// 表单字段类型：DatePicker 返回 Dayjs，与接口参数字符串做区分
interface PartnerForm extends Omit<PartnerParams, 'startDate' | 'endDate' | 'travelTags'> {
  startDate: Dayjs;
  endDate?: Dayjs;
  travelTags?: string[];
}

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

const categoryOptions = [
  { value: '旅游', label: '旅游' },
  { value: '美食', label: '美食' },
  { value: '运动', label: '运动' },
  { value: '学习', label: '学习' },
  { value: '探店', label: '探店' },
  { value: '看展', label: '看展' },
  { value: '桌游', label: '桌游' },
];

const locationTypeOptions = [
  { value: 0, label: '线下活动' },
  { value: 1, label: '线上活动' },
];

const genderLimitOptions = [
  { value: 0, label: '不限性别' },
  { value: 1, label: '仅男生' },
  { value: 2, label: '仅女生' },
];

const feeModeOptions = [
  { value: 0, label: '免费' },
  { value: 1, label: 'AA制' },
  { value: 2, label: '组织者全包' },
  { value: 3, label: '人均固定预算' },
];

const visibilityOptions = [
  { value: 0, label: '全部可见' },
  { value: 1, label: '同城可见' },
  { value: 2, label: '好友可见' },
];

const joinModeOptions = [
  { value: 0, label: '需审核' },
  { value: 1, label: '直接加入' },
];

const yesNoOptions = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
];

const PartnersPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<PartnerForm>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const locationType = Form.useWatch('locationType', form);
  const genderLimit = Form.useWatch('genderLimit', form);
  const feeMode = Form.useWatch('feeMode', form);

  const handleOpenModal = () => {
    form.resetFields();
    // 官方活动默认值（与 model.Partner 默认一致）
    form.setFieldsValue({
      locationType: 0,
      genderLimit: 0,
      feeMode: 0,
      visibility: 0,
      joinMode: 0,
      autoClose: 1,
      allowShare: 1,
      allowCollect: 1,
      isPublic: 1,
      minAge: 0,
      maxAge: 99,
    });
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
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

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: PartnerParams = {
        ...values,
        // 后端 *time.Time 需要 RFC3339 格式，不能用 YYYY-MM-DD
        startDate: dayjs(values.startDate).toISOString(),
        endDate: values.endDate ? dayjs(values.endDate).toISOString() : undefined,
        // 多选标签转逗号分隔字符串
        travelTags: values.travelTags?.join(',') || '',
      };

      await createOfficialPartner(payload);
      message.success('官方搭子发布成功');
      setModalOpen(false);
      form.resetFields();
      tableRef.current?.handleRefresh();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error('发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const statusMap: Record<number, { label: string; color: string }> = {
    0: { label: '招募中', color: 'green' },
    1: { label: '满员', color: 'blue' },
    2: { label: '已取消', color: 'red' },
    3: { label: '已过期', color: 'default' },
    4: { label: '已下架', color: 'red' },
  };

  const coverUrl = (src: string) => {
    if (!src) return '';
    return src.startsWith('http') ? src : `${STATIC_DOMAIN}/${src}`;
  };

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
      title: '分类',
      dataIndex: 'category',
      width: 80,
      render: (v: string) => (v ? <Tag color="blue">{v}</Tag> : '-'),
    },
    {
      title: '出行类型',
      dataIndex: 'locationType',
      width: 90,
      render: (v: number) => (v === 1 ? <Tag color="purple">线上</Tag> : <Tag>线下</Tag>),
    },
    {
      title: '出行标签',
      dataIndex: 'travelTags',
      width: 170,
      render: (v: string) =>
        v
          ? v
              .split(',')
              .filter(Boolean)
              .slice(0, 3)
              .map((t: string) => (
                <Tag key={t} style={{ marginBottom: 2 }}>
                  {t}
                </Tag>
              ))
          : '-',
    },
    {
      title: '出发日期',
      dataIndex: 'startDate',
      width: 110,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      width: 110,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD') : '-'),
    },
    { title: '天数', dataIndex: 'days', width: 60 },
    {
      title: '人数',
      width: 90,
      render: (_: unknown, record: Partner) => `${record.currentMembers}/${record.maxMembers}`,
    },
    {
      title: '价格',
      dataIndex: 'officialPrice',
      width: 90,
      render: (val: number) => (val ? `¥${val}` : '-'),
    },
    {
      title: '数据',
      width: 170,
      render: (_: unknown, record: Partner) =>
        `浏览 ${record.viewCount} · 赞 ${record.likeCount} · 藏 ${record.favoriteCount} · 评 ${record.commentCount}`,
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
      width: 90,
      fixed: 'right',
      render: (_: unknown, record: Partner) => (
        <Button type="link" onClick={() => handleViewDetail(record.id)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<Partner>
        ref={tableRef}
        title="搭子管理"
        rowKey="id"
        columns={columns}
        request={(params: any) => getPartners({ ...params, type: 1 })}
        scroll={{ x: 1500 }}
        searchFields={[
          { name: 'destination', label: '目的地', type: 'input' },
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
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
            发布官方搭子
          </Button>
        }
      />

      <Modal
        title="发布官方搭子团"
        open={modalOpen}
        width={720}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText="发布"
        confirmLoading={submitting}
        destroyOnHidden
        keyboard={false}
        mask={{
          closable: false,
        }}
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingRight: 12,
          },
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Divider titlePlacement="left">基本信息</Divider>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入招募标题" maxLength={50} showCount />
          </Form.Item>

          <Form.Item name="cover" label="封面图">
            <UploadImage type="single" maxCount={1} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="分类">
                <Select allowClear placeholder="选择活动分类" options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="locationType" label="出行类型">
                <Select options={locationTypeOptions} />
              </Form.Item>
            </Col>
          </Row>

          {locationType === 1 && (
            <Form.Item name="onlineLink" label="线上链接">
              <Input placeholder="请输入线上活动链接" />
            </Form.Item>
          )}
          {locationType === 0 && (
            <Form.Item name="address" label="详细地址">
              <Input placeholder="请输入活动详细地址" />
            </Form.Item>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="destination"
                label="目的地"
                rules={[{ required: true, message: '请输入目的地' }]}
              >
                <Input placeholder="请输入目的地名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="travelTags" label="出行标签">
                <Select mode="tags" placeholder="输入后回车添加，如 自驾/徒步/美食" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">时间与费用</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="出发日期"
                rules={[{ required: true, message: '请选择出发日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择出发日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="结束日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择结束日期" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="days"
                label="天数"
                rules={[{ required: true, message: '请输入行程天数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入天数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feeMode" label="费用模式">
                <Select options={feeModeOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="officialPrice"
                label="官方定价 (元)"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="人均价格" />
              </Form.Item>
            </Col>
            {feeMode === 3 && (
              <Col span={8}>
                <Form.Item name="budgetPerPerson" label="人均预算 (元)">
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="AA预估人均" />
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <Form.Item name="estTotal" label="预估总价 (元)">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="可选" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="feeInclude" label="费用包含">
                <Input.TextArea rows={2} placeholder="如：门票、住宿、保险" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="feeExclude" label="费用不含">
                <Input.TextArea rows={2} placeholder="如：餐饮、往返大交通" />
              </Form.Item>
            </Col>
          </Row>

          <Divider titlePlacement="left">人员要求</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxMembers"
                label="最大人数"
                rules={[{ required: true, message: '请输入最大人数' }]}
              >
                <InputNumber min={2} style={{ width: '100%' }} placeholder="最大成团人数" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minMembers" label="最小成团人数">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="默认 0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="genderLimit" label="性别限制">
                <Select options={genderLimitOptions} />
              </Form.Item>
            </Col>
            {genderLimit !== 0 && (
              <Col span={12}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Form.Item name="maleCount" label="男生名额">
                      <InputNumber min={0} style={{ width: '100%' }} placeholder="人数" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="femaleCount" label="女生名额">
                      <InputNumber min={0} style={{ width: '100%' }} placeholder="人数" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="minAge" label="年龄下限">
                <InputNumber min={0} max={99} style={{ width: '100%' }} placeholder="默认 0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxAge" label="年龄上限">
                <InputNumber min={1} max={99} style={{ width: '100%' }} placeholder="默认 99" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="requirement" label="要求">
            <Input.TextArea rows={2} placeholder="请填写参团要求、注意事项等" />
          </Form.Item>

          <Divider titlePlacement="left">行程与设置</Divider>
          <Form.Item name="desc" label="行程简述">
            <Input.TextArea rows={2} placeholder="请填写行程亮点、路线概述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="visibility" label="可见性">
                <Select options={visibilityOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="joinMode" label="加入方式">
                <Select options={joinModeOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="autoClose" label="满员自动关闭">
                <Select options={yesNoOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowShare" label="允许转发">
                <Select options={yesNoOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="allowCollect" label="允许收藏">
                <Select options={yesNoOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="isPublic" label="公开招募">
            <Select options={yesNoOptions} />
          </Form.Item>
        </Form>
      </Modal>

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
                  {feeModeOptions.find((o) => o.value === detail.partner.feeMode)?.label || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="性别限制">
                  {genderLimitOptions.find((o) => o.value === detail.partner.genderLimit)?.label || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="年龄要求">
                  {detail.partner.minAge}-{detail.partner.maxAge}
                </Descriptions.Item>
                <Descriptions.Item label="可见性">
                  {visibilityOptions.find((o) => o.value === detail.partner.visibility)?.label || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="加入方式">
                  {joinModeOptions.find((o) => o.value === detail.partner.joinMode)?.label || '-'}
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

export default PartnersPage;
