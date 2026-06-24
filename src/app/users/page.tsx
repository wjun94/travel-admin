import { useRef } from 'react';
import { Select, Tag, message } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getWxUsers, updateWxUserRole, WxUser } from '@/api/users';

const UsersPage = () => {
  const tableRef = useRef<ProTableRef>(null);

  const handleRoleChange = async (userId: number, newRole: number) => {
    await updateWxUserRole(userId, newRole);
    message.success('角色更新成功');
    tableRef.current?.handleRefresh();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '昵称', dataIndex: 'nickname' },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: number) => {
        const roleMap: Record<number, { label: string; color: string }> = {
          0: { label: '普通', color: 'gray' },
          1: { label: '领队', color: 'green' },
          2: { label: '管理员', color: 'red' },
        };
        return <Tag color={roleMap[role]?.color}>{roleMap[role]?.label}</Tag>;
      },
    },
    {
      title: '操作',
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
    />
  );
};

export default UsersPage;