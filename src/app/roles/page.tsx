import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, Tag, Popover, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getRoles, createRole, updateRole, deleteRole, Role } from '@/api/roles';

const RolesPage = () => {
  const tableRef = useRef<ProTableRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除角色可能会影响关联用户，确定继续吗？',
      onOk: async () => {
        await deleteRole(id);
        message.success('删除成功');
        tableRef.current?.handleRefresh();
      },
    });
  };

  const handleModalOk = async () => {
    const values = await form.validateFields();
    if (editingRole) {
      await updateRole(editingRole.id, values);
      message.success('更新成功');
    } else {
      await createRole(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    tableRef.current?.handleRefresh();
  };

  // 解析权限JSON字符串，返回权限名称数组
  const parsePerms = (raw: string): string[] => {
    try {
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '角色名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '权限',
      dataIndex: 'permissions',
      ellipsis: true,
      render: (perms: string) => {
        const list = parsePerms(perms);
        if (list.length === 0) return <span style={{ color: '#999' }}>无</span>;
        return (
          <Popover
            title="权限列表"
            content={
              <div style={{ maxWidth: 300 }}>
                {list.map((p) => <Tag key={p} style={{ marginBottom: 4 }}>{p}</Tag>)}
              </div>
            }
            trigger="hover"
          >
            <span>
              {list.slice(0, 3).map((p) => <Tag key={p} color="blue" style={{ marginInlineEnd: 4 }}>{p}</Tag>)}
              {list.length > 3 && <Tag>+{list.length - 3}</Tag>}
            </span>
          </Popover>
        );
      },
    },
    {
      title: '操作',
      render: (_: any, record: Role) => (
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
        title="角色管理"
        rowKey="id"
        columns={columns}
        request={getRoles}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增角色</Button>}
        showSearch={false}
      />
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="权限JSON">
            <Input.TextArea rows={4} placeholder='例如 ["dashboard","users_manage"]' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPage;