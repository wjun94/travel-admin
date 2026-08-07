import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, Radio, Select, DatePicker, Tag, message } from 'antd';
import dayjs from 'dayjs';
import ProTable, { ProTableRef } from '@/components/ProTable';
import {
  getSysMessages,
  createSysMessage,
  cancelSysMessage,
  SysMessage,
  SYS_MESSAGE_TARGET_NAMES,
  SYS_MESSAGE_GROUP_NAMES,
  SYS_MESSAGE_STATUS_NAMES,
} from '@/api/sysMessages';
import { getWxUsers } from '@/api/users';

const STATUS_COLORS = ['orange', 'green', 'gray'];

const MessagesPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [sendVisible, setSendVisible] = useState(false);
  const [form] = Form.useForm();
  // 指定用户远程搜索
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [searching, setSearching] = useState(false);

  // 打开发送弹窗
  const handleOpen = () => {
    form.resetFields();
    form.setFieldsValue({ targetType: 'all', sendMode: 'immediate' });
    setUserOptions([]);
    setSendVisible(true);
  };

  // 远程搜索用户（指定用户模式）
  const handleUserSearch = async (keyword: string) => {
    setSearching(true);
    try {
      const res = await getWxUsers({ page: 1, pageSize: 20, keyword });
      const users = res.data.list || [];
      setUserOptions(users.map((u) => ({ label: `${u.nickname}（${u.id}）`, value: u.id })));
    } catch {
      setUserOptions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: any = {
      title: values.title,
      content: values.content,
      linkUrl: values.linkUrl || '',
      targetType: values.targetType,
    };
    if (values.targetType === 'users') {
      payload.targetUserIds = values.targetUserIds || [];
    }
    if (values.targetType === 'group') {
      payload.targetGroup = values.targetGroup;
    }
    // 定时发送：转 RFC3339
    if (values.sendMode === 'scheduled' && values.sendTime) {
      payload.sendTime = values.sendTime.toISOString();
    }
    await createSysMessage(payload);
    message.success(values.sendMode === 'scheduled' ? '已设置定时发送' : '发送成功');
    setSendVisible(false);
    tableRef.current?.handleRefresh();
  };

  const handleCancel = (record: SysMessage) => {
    Modal.confirm({
      title: '确认取消',
      content: `取消后将不再发送「${record.title}」，确定取消吗？`,
      onOk: async () => {
        await cancelSysMessage(record.id);
        message.success('已取消');
        tableRef.current?.handleRefresh();
      },
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 90, ellipsis: true },
    { title: '标题', dataIndex: 'title', width: 180, ellipsis: true },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    {
      title: '接收人群',
      dataIndex: 'targetType',
      width: 150,
      render: (_: string, record: SysMessage) => (
        <span>
          {SYS_MESSAGE_TARGET_NAMES[record.targetType] || record.targetType}
          {record.groupName ? <Tag color="blue" style={{ marginLeft: 6 }}>{record.groupName}</Tag> : null}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{SYS_MESSAGE_STATUS_NAMES[status] || status}</Tag>
      ),
    },
    {
      title: '计划发送时间',
      dataIndex: 'sendTime',
      width: 160,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '送达人数',
      dataIndex: 'sentCount',
      width: 90,
      render: (n: number) => (n > 0 ? n : '-'),
    },
    { title: '操作人', dataIndex: 'operatorName', width: 100, render: (v: string) => v || '-' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      render: (t: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 100,
      render: (_: any, record: SysMessage) => (
        record.status === 0 ? (
          <Button type="link" danger onClick={() => handleCancel(record)}>取消发送</Button>
        ) : '-'
      ),
    },
  ];

  const searchFields = [
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: SYS_MESSAGE_STATUS_NAMES.map((label, i) => ({ value: i, label })),
    },
  ];

  return (
    <div>
      <ProTable
        ref={tableRef}
        title="消息管理（系统通知）"
        rowKey="id"
        columns={columns}
        request={getSysMessages}
        searchFields={searchFields}
        scroll={{ x: 1200 }}
        extra={
          <Button type="primary" onClick={handleOpen}>发送系统消息</Button>
        }
      />
      <Modal
        title="发送系统消息"
        open={sendVisible}
        onOk={handleOk}
        onCancel={() => setSendVisible(false)}
        width={560}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="消息标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入消息标题" showCount maxLength={100} />
          </Form.Item>
          <Form.Item name="content" label="消息内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={4} placeholder="请输入消息内容" showCount maxLength={1000} />
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接" tooltip="用户点击消息时跳转的网页链接（选填，可填写活动 H5 页面地址）">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="targetType" label="接收人群" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="all">全部用户</Radio>
              <Radio value="users">指定用户</Radio>
              <Radio value="group">用户分组</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.targetType !== cur.targetType}>
            {({ getFieldValue }) => {
              const targetType = getFieldValue('targetType');
              if (targetType === 'users') {
                return (
                  <Form.Item name="targetUserIds" label="选择用户" rules={[{ required: true, message: '请选择用户' }]}>
                    <Select
                      mode="multiple"
                      placeholder="输入昵称搜索用户"
                      filterOption={false}
                      onSearch={handleUserSearch}
                      options={userOptions}
                      loading={searching}
                      allowClear
                      notFoundContent="输入关键词搜索用户"
                    />
                  </Form.Item>
                );
              }
              if (targetType === 'group') {
                return (
                  <Form.Item name="targetGroup" label="用户分组" rules={[{ required: true, message: '请选择分组' }]}>
                    <Select
                      placeholder="请选择用户分组"
                      options={Object.entries(SYS_MESSAGE_GROUP_NAMES).map(([value, label]) => ({ value, label }))}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          <Form.Item name="sendMode" label="发送方式" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="immediate">立即发送</Radio>
              <Radio value="scheduled">定时发送</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.sendMode !== cur.sendMode}>
            {({ getFieldValue }) =>
              getFieldValue('sendMode') === 'scheduled' ? (
                <Form.Item name="sendTime" label="定时发送时间" rules={[{ required: true, message: '请选择发送时间' }]}>
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
                    placeholder="请选择发送时间"
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;
