import { useEffect, useState } from 'react';
import {
  Card, Button, Table, message, Tag,
  Modal, Form, Input, Select, DatePicker
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getRecommendations, saveRecommendation, Recommendation } from '@/api/recommendations';
import dayjs from 'dayjs';

const RecommendationsPage = () => {
  const [list, setList] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await getRecommendations();
      setList(data?.data || []);
    } catch (err) {
      message.error('获取推荐列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleOpenModal = () => {
    form.resetFields();
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
      };

      await saveRecommendation(payload);
      message.success('保存成功');
      setModalOpen(false);
      form.resetFields();
      fetchList();
    } catch (err) {
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '城市',
      dataIndex: 'city',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (t: string) => (
        <Tag color={t === 'house' ? 'blue' : 'orange'}>
          {t === 'house' ? '民宿' : '活动'}
        </Tag>
      ),
    },
    {
      title: '有效期',
      width: 260,
      render: (_: unknown, record: Recommendation) => (
        <span style={{ color: '#6b7280', fontSize: 13 }}>
          {dayjs(record.startTime).format('YYYY-MM-DD HH:mm')} ~ {dayjs(record.endTime).format('YYYY-MM-DD HH:mm')}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#1f2937' }}>推荐管理</h2>
        <p style={{ color: '#6b7280', marginTop: 4, marginBottom: 0, fontSize: 14 }}>
          管理首页展示的民宿与活动推荐内容
        </p>
      </div>

      <Card
        title="推荐列表"
        styles={{
          header: { fontWeight: 600, fontSize: 16, paddingInline: 24 },
          body: { padding: '16px 24px 24px' },
        }}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
            新增推荐
          </Button>
        }
      >
        <Table
          rowKey="id"
          dataSource={list}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* 新增弹窗 - 内容区滚动 */}
      <Modal
        title="新增推荐"
        open={modalOpen}
        width={520}
        onCancel={handleCancel}
        confirmLoading={submitting}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
        // 核心：内容区最大高度 + 溢出滚动
        styles={{
          body: {
            maxHeight: '70vh',
            overflowY: 'auto',
            paddingRight: 12,
          },
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ type: 'house' }}
          style={{ marginTop: 8 }}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入推荐标题" maxLength={50} showCount />
          </Form.Item>

          <Form.Item name="cover" label="封面图 URL">
            <Input placeholder="请输入封面图片链接" />
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input placeholder="请输入所属城市" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select
              options={[
                { value: 'house', label: '民宿' },
                { value: 'activity', label: '活动' },
              ]}
            />
          </Form.Item>

          <Form.Item name="link" label="跳转链接">
            <Input placeholder="请输入详情页跳转链接" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} placeholder="选择开始时间" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[
              { required: true, message: '请选择结束时间' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue('startTime');
                  if (!value || !startTime || value.isAfter(startTime)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('结束时间必须晚于开始时间'));
                },
              }),
            ]}
          >
            <DatePicker showTime style={{ width: '100%' }} placeholder="选择结束时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecommendationsPage;