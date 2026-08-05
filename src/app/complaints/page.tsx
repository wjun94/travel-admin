import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, Radio, Tag, message, Avatar, Tooltip } from 'antd';
import dayjs from 'dayjs';
import ProTable, { ProTableRef } from '@/components/ProTable';
import {
  getComplaints,
  handleComplaint,
  deleteComplaint,
  Complaint,
  COMPLAINT_TARGET_NAMES,
  COMPLAINT_STATUS_NAMES,
} from '@/api/complaints';

const STATUS_COLORS = ['orange', 'green', 'red'];

const ComplaintsPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [handleVisible, setHandleVisible] = useState(false);
  const [handlingComplaint, setHandlingComplaint] = useState<Complaint | null>(null);
  const [form] = Form.useForm();

  const handleOpen = (record: Complaint) => {
    setHandlingComplaint(record);
    form.setFieldsValue({ status: 1, handleNote: '', reply: record.reply || '' });
    setHandleVisible(true);
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (!handlingComplaint) return;
    await handleComplaint(handlingComplaint.id, values);
    message.success('处理成功');
    setHandleVisible(false);
    tableRef.current?.handleRefresh();
  };

  const handleDelete = (record: Complaint) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确定删除该投诉吗？',
      onOk: async () => {
        await deleteComplaint(record.id);
        message.success('删除成功');
        tableRef.current?.handleRefresh();
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 110, ellipsis: true },
    {
      title: '投诉人',
      dataIndex: 'userName',
      width: 130,
      render: (_: string, record: Complaint) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={28} src={record.avatarUrl}>{record.userName?.[0]}</Avatar>
          <span>{record.userName || record.userId}</span>
        </div>
      ),
    },
    {
      title: '投诉对象',
      dataIndex: 'targetType',
      width: 200,
      render: (_: string, record: Complaint) => (
        <div>
          <Tag color="blue" style={{ marginInlineEnd: 4 }}>
            {COMPLAINT_TARGET_NAMES[record.targetType] || record.targetType}
          </Tag>
          <Tooltip title={record.targetName}>
            <span style={{ color: '#666' }}>{record.targetName || record.targetId || '-'}</span>
          </Tooltip>
        </div>
      ),
    },
    { title: '原因', dataIndex: 'reason', width: 110 },
    { title: '问题描述', dataIndex: 'content', ellipsis: true },
    {
      title: '回复',
      dataIndex: 'reply',
      width: 140,
      ellipsis: true,
      render: (reply: string) => (reply ? <span style={{ color: '#52c41a' }}>{reply}</span> : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{COMPLAINT_STATUS_NAMES[status] || status}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 130,
      render: (_: any, record: Complaint) => (
        <>
          <Button type="link" onClick={() => handleOpen(record)}>处理</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </>
      ),
    },
  ];

  const searchFields = [
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: COMPLAINT_STATUS_NAMES.map((label, i) => ({ value: i, label })),
    },
    {
      name: 'targetType',
      label: '对象类型',
      type: 'select',
      options: Object.entries(COMPLAINT_TARGET_NAMES).map(([value, label]) => ({ value, label })),
    },
  ];

  return (
    <div>
      <ProTable
        ref={tableRef}
        title="投诉管理"
        rowKey="id"
        columns={columns}
        request={getComplaints}
        searchFields={searchFields}
        scroll={{ x: 1100 }}
      />
      <Modal
        title="处理投诉"
        open={handleVisible}
        onOk={handleOk}
        onCancel={() => setHandleVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="处理结果" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value={1}>已处理</Radio>
              <Radio value={2}>驳回</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="reply" label="回复内容" tooltip="回复将展示给小程序用户">
            <Input.TextArea rows={3} placeholder="填写对用户的回复（选填）" showCount maxLength={500} />
          </Form.Item>
          <Form.Item name="handleNote" label="处理备注" tooltip="后台内部备注，用户不可见">
            <Input.TextArea rows={2} placeholder="填写处理说明（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
