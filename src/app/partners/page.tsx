import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, DatePicker, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getPartners, createOfficialPartner, Partner, PartnerParams } from '@/api/partners';
import dayjs from 'dayjs';

// 表单字段类型：DatePicker 返回 Dayjs，与接口参数字符串做区分
interface PartnerForm extends Omit<PartnerParams, 'startDate'> {
  startDate: Dayjs;
}

const PartnersPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<PartnerForm>();

  const handleOpenModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: PartnerParams = {
        ...values,
        startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
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
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '目的地', dataIndex: 'destination' },
    {
      title: '出发日期',
      dataIndex: 'startDate',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD'),
    },
    { title: '天数', dataIndex: 'days', width: 80 },
    {
      title: '人数',
      width: 100,
      render: (_: unknown, record: Partner) => `${record.currentMembers}/${record.maxMembers}`,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (val: number) => `¥${val}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => {
        const info = statusMap[status];
        return <Tag color={info?.color}>{info?.label}</Tag>;
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type: number) => <Tag>{type === 1 ? '官方' : '用户'}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (val: string) => dayjs(val).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProTable<Partner>
        ref={tableRef}
        title="搭子管理"
        rowKey="id"
        columns={columns}
        request={getPartners}
        searchFields={[
          { name: 'destination', label: '目的地', type: 'input' },
          {
            name: 'type',
            label: '类型',
            type: 'select',
            options: [
              { value: 0, label: '用户' },
              { value: 1, label: '官方' },
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
        width={520}
        onOk={handleCreate}
        onCancel={handleCancel}
        okText="发布"
        confirmLoading={submitting}
        destroyOnHidden
        keyboard={false}
        // antd 6.x 标准写法：替代废弃的 maskClosable
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
          <Form.Item
            name="destination"
            label="目的地"
            rules={[{ required: true, message: '请输入目的地' }]}
          >
            <Input placeholder="请输入目的地名称" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="出发日期"
            rules={[{ required: true, message: '请选择出发日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择出发日期" />
          </Form.Item>

          <Form.Item
            name="days"
            label="天数"
            rules={[{ required: true, message: '请输入行程天数' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入天数" />
          </Form.Item>

          <Form.Item
            name="maxMembers"
            label="最大人数"
            rules={[{ required: true, message: '请输入最大人数' }]}
          >
            <InputNumber min={2} style={{ width: '100%' }} placeholder="请输入最大成团人数" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格 (元)"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入人均价格"
            />
          </Form.Item>

          <Form.Item name="requirement" label="要求">
            <Input.TextArea rows={3} placeholder="请填写参团要求、注意事项等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartnersPage;