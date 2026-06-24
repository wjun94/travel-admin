import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin } from 'antd';
import { UserOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { getDashboard, DashboardData } from '@/api/dashboard';

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboard()
      .then(res => {
        setData(res?.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 统计卡片配置，方便后续扩展
  const statisticList = [
    {
      title: '用户总数',
      value: data?.userCount ?? 0,
      icon: <UserOutlined />,
      color: '#1677ff',
      bgColor: '#f0f7ff'
    },
    {
      title: '攻略总数',
      value: data?.postCount ?? 0,
      icon: <FileTextOutlined />,
      color: '#52c41a',
      bgColor: '#f0fff4'
    },
    {
      title: '搭子总数',
      value: data?.partnerCount ?? 0,
      icon: <TeamOutlined />,
      color: '#fa8c16',
      bgColor: '#fff7e6'
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '22px', fontWeight: 600 }}>数据仪表盘</h2>

      <Spin spinning={loading} tip="数据加载中...">
        <Row gutter={[16, 16]}>
          {statisticList.map((item, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                styles={{
                  body: {
                    backgroundColor: item.bgColor,
                    borderRadius: 8
                  }
                }}
              >
                <Statistic
                  title={item.title}
                  value={item.value}
                  styles={{
                    content: {
                      color: item.color,
                      fontSize: 32,
                      fontWeight: 600,
                    },
                  }}
                  prefix={<span style={{ fontSize: 20, color: item.color }}>{item.icon}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard;