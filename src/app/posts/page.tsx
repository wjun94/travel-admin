import { useRef } from 'react';
import { Button, Tag, message } from 'antd';
import ProTable, { ProTableRef } from '@/components/ProTable';
import { Image } from '@/components';
import { getPosts, updatePostStatus, Post } from '@/api/posts';
import dayjs from 'dayjs';

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: '草稿', color: 'default' },
  1: { label: '已发布', color: 'green' },
  2: { label: '已下架', color: 'red' },
};

const PostsPage = () => {
  const tableRef = useRef<ProTableRef>(null);

  const handleStatus = async (id: string, status: number) => {
    await updatePostStatus(id, status);
    message.success('操作成功');
    tableRef.current?.handleRefresh();
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 90,
      render: (src: string) => (
        <Image src={src} style={{ width: 64, height: 44, objectFit: 'cover', borderRadius: 4 }} />
      ),
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '目的地', dataIndex: 'destination', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => (
        <Tag color={statusMap[status]?.color}>{statusMap[status]?.label}</Tag>
      ),
    },
    { title: '浏览量', dataIndex: 'viewCount', width: 90 },
    { title: '点赞', dataIndex: 'likeCount', width: 80 },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (val: string) => (val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      width: 140,
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
      searchFields={[
        {
          name: 'status',
          label: '状态',
          type: 'select',
          options: [
            { value: 0, label: '草稿' },
            { value: 1, label: '已发布' },
            { value: 2, label: '已下架' },
          ],
        },
      ]}
    />
  );
};

export default PostsPage;
