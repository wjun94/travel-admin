import { useRef } from 'react';
import { Button, Tag, message } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { getPosts, updatePostStatus, Post } from '@/api/posts';

const PostsPage = () => {
  const tableRef = useRef<ProTableRef>(null);

  const handleStatus = async (id: number, status: number) => {
    await updatePostStatus(id, status);
    message.success('操作成功');
    tableRef.current?.handleRefresh();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '内容摘要', dataIndex: 'content', ellipsis: true },
    { title: '城市', dataIndex: 'city' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => {
        const statusMap: Record<number, { label: string; color: string }> = {
          0: { label: '待审核', color: 'orange' },
          1: { label: '已发布', color: 'green' },
          2: { label: '已下架', color: 'red' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>;
      },
    },
    {
      title: '操作',
      render: (_: any, record: Post) => (
        <>
          {record.status !== 1 && (
            <Button type="link" onClick={() => handleStatus(record.id, 1)}>发布</Button>
          )}
          {record.status !== 2 && (
            <Button type="link" danger onClick={() => handleStatus(record.id, 2)}>下架</Button>
          )}
        </>
      ),
    },
  ];

  return (
    <ProTable
      ref={tableRef}
      title="攻略审核"
      rowKey="id"
      columns={columns}
      request={getPosts}
    />
  );
};

export default PostsPage;