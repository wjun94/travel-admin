import { useRef, useState } from 'react';
import { Button, Modal, Form, Input, Tag, Popover, Checkbox, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getRoles, createRole, updateRole, deleteRole, Role } from '@/api/roles';

// 权限清单：key 与后端权限标识一致
const PERMISSION_OPTIONS = [
  { label: '全部权限（超级管理员）', value: '*' },
  { label: '仪表盘', value: 'dashboard' },
  { label: '小程序用户', value: 'users_manage' },
  { label: '攻略管理', value: 'guides_manage' },
  { label: '攻略审核', value: 'posts_manage' },
  { label: '行程审核', value: 'trips_manage' },
  { label: '搭子审核', value: 'partner_audit' },
  { label: '官方搭子', value: 'partners_manage' },
  { label: '推荐管理', value: 'recommendations_manage' },
  { label: '投诉管理', value: 'complaints_manage' },
  { label: '消息管理', value: 'messages_manage' },
  { label: '后台用户', value: 'admin_users_manage' },
  { label: '角色管理', value: 'roles_manage' },
];

// key → 中文名映射
const PERMISSION_LABEL_MAP: Record<string, string> = Object.fromEntries(
  PERMISSION_OPTIONS.map((p) => [p.value, p.label])
);

// 权限key转为中文名，未知key回显原样
const permLabel = (key: string) => PERMISSION_LABEL_MAP[key] || key;

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
    // 权限JSON字符串解析为数组回填勾选
    form.setFieldsValue({ ...record, permissions: parsePerms(record.permissions) });
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
    // 勾选的权限数组转为JSON字符串提交
    const payload = { ...values, permissions: JSON.stringify(values.permissions || []) };
    if (editingRole) {
      await updateRole(editingRole.id, payload);
      message.success('更新成功');
    } else {
      await createRole(payload);
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
                {list.map((p) => <Tag key={p} style={{ marginBottom: 4 }}>{permLabel(p)}</Tag>)}
              </div>
            }
            trigger="hover"
          >
            <span>
              {list.slice(0, 3).map((p) => <Tag key={p} color="blue" style={{ marginInlineEnd: 4 }}>{permLabel(p)}</Tag>)}
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
          <Form.Item name="permissions" label="权限" rules={[{ required: true, message: '请勾选权限' }]}>
            <Checkbox.Group options={PERMISSION_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RolesPage;