import { useRef } from 'react';
import { Select, Tag, message, Avatar, Tooltip } from 'antd';
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
      title: 'ID',
      dataIndex: 'id',
      width: 220,
      ellipsis: { showTitle: false },
      render: (id: string) => (
        <Tooltip title={id} placement="topLeft">
          <span>{id}</span>
        </Tooltip>
      ),
    },
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      width: 70,
      render: (src: string, record: WxUser) => (
        src ? (
          <Image src={src} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <Avatar>{record.nickname?.[0] || '?'}</Avatar>
        )
      ),
    },
    { title: '昵称', dataIndex: 'nickname', ellipsis: true },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 130,
      render: (phone: string) => phone || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 90,
      render: (role: number) => (
        <Tag color={roleMap[role]?.color}>{roleMap[role]?.label}</Tag>
      ),
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
