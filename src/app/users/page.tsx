import { useRef } from 'react';
import { Select, Tag, message, Avatar, Typography } from 'antd';
import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { Image } from '@/components';
import { getWxUsers, updateWxUserRole, WxUser } from '@/api/users';
import dayjs from 'dayjs';

const roleMap: Record<number, { label: string; color: string }> = {
  0: { label: '普通', color: 'gray' },
  1: { label: '领队', color: 'green' },
  2: { label: '管理员', color: 'red' },
};

const UsersPage = () => {
  const tableRef = useRef<ProTableRef>(null);

  const handleRoleChange = async (userId: string, newRole: number) => {
    await updateWxUserRole(userId, newRole);
    message.success('角色更新成功');
    tableRef.current?.handleRefresh();
  };

  const columns = [
    {
      title: '用户',
      key: 'info',
      width: 260,
      render: (_: unknown, record: WxUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {record.avatarUrl ? (
            <Image
              src={record.avatarUrl}
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Avatar style={{ flexShrink: 0 }}>{record.nickname?.[0] || '?'}</Avatar>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1f2937',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {record.nickname || '-'}
              </span>
              {record.gender === 'male' && <ManOutlined style={{ color: '#1677ff', flexShrink: 0 }} />}
              {record.gender === 'female' && <WomanOutlined style={{ color: '#eb2f96', flexShrink: 0 }} />}
              <Tag color={roleMap[record.role]?.color} style={{ flexShrink: 0, marginInlineEnd: 0 }}>
                {roleMap[record.role]?.label}
              </Tag>
            </div>
            <Typography.Text
              copyable={{ text: record.id }}
              ellipsis
              style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, display: 'block' }}
            >
              ID: {record.id}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      render: (phone: string) => phone || '-',
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 140,
      render: (_: any, record: WxUser) => (
        <Select
          value={record.role}
          style={{ width: 120 }}
          onChange={(val) => handleRoleChange(record.id, val)}
          options={[
            { value: 0, label: '普通' },
            { value: 1, label: '领队' },
            { value: 2, label: '管理员' },
          ]}
        />
      ),
    },
  ];

  return (
    <ProTable
      ref={tableRef}
      title="小程序用户管理"
      rowKey="id"
      columns={columns}
      request={getWxUsers}
      searchFields={[
        { name: 'keyword', label: '昵称/手机号', type: 'input', placeholder: '请输入昵称或手机号' },
      ]}
    />
  );
};

export default UsersPage;
