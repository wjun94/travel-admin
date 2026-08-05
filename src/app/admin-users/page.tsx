import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, AdminUser } from '@/api/adminUsers';
import { getRoles, Role } from '@/api/roles';

const AdminUsersPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    const res = await getRoles();
    setRoles(res?.data?.list || []);
  };

  const handleAdd = async () => {
    await fetchRoles();
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = async (record: AdminUser) => {
    await fetchRoles();
    setEditingUser(record);
    form.setFieldsValue({
      username: record.username,
      roleId: record.roleId,
      status: record.status,
      password: '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      onOk: async () => {
        await deleteAdminUser(id);
        message.success('删除成功');
        tableRef.current?.handleRefresh();
      },
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (editingUser) {
      const payload: any = { roleId: values.roleId, status: values.status };
      if (values.password) payload.password = values.password;
      await updateAdminUser(editingUser.id, payload);
      message.success('更新成功');
    } else {
      await createAdminUser(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    tableRef.current?.handleRefresh();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username' },
    {
      title: '角色',
      dataIndex: ['role', 'name'],
      render: (_: any, record: AdminUser) => <Tag color="blue">{record.role?.name}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => (status === 1 ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>),
    },
    {
      title: '操作',
      render: (_: any, record: AdminUser) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <ProTable
        ref={tableRef}
        title="后台用户管理"
        rowKey="id"
        columns={columns}
        request={getAdminUsers}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={editingUser ? [] : [{ required: true }]}>
            <Input.Password placeholder={editingUser ? '留空则不修改' : ''} />
          </Form.Item>
          <Form.Item name="roleId" label="角色" rules={[{ required: true }]}>
            <Select options={roles.map(r => ({ value: r.id, label: r.name }))} />
          </Form.Item>
          {editingUser && (
            <Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;