import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Segmented } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
  ScheduleOutlined,
  CommentOutlined,
  StarOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { getDashboardData, DashboardData } from '@/api/dashboard';

// 9 个统计维度配置（key 对应后端返回字段）
const DIMENSIONS: {
  key: keyof DashboardData;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  { key: 'user', label: '用户', icon: <UserOutlined />, color: '#1677ff', bg: '#f0f7ff' },
  { key: 'guide', label: '攻略', icon: <FileTextOutlined />, color: '#52c41a', bg: '#f0fff4' },
  { key: 'partner', label: '搭子', icon: <TeamOutlined />, color: '#fa8c16', bg: '#fff7e6' },
  { key: 'trip', label: '行程', icon: <ScheduleOutlined />, color: '#722ed1', bg: '#f9f0ff' },
  { key: 'comment', label: '评论', icon: <CommentOutlined />, color: '#eb2f96', bg: '#fff0f6' },
  { key: 'favorite', label: '收藏', icon: <StarOutlined />, color: '#faad14', bg: '#fffbe6' },
  { key: 'application', label: '搭子申请', icon: <UsergroupAddOutlined />, color: '#13c2c2', bg: '#e6fffb' },
  { key: 'complaint', label: '投诉', icon: <WarningOutlined />, color: '#f5222d', bg: '#fff1f0' },
  { key: 'aiGenerate', label: 'AI生成', icon: <RobotOutlined />, color: '#8b5cf6', bg: '#f5f3ff' },
];

// 时间段切换选项（field 对应 DimensionCounts 字段）
const PERIODS: { key: 'today' | 'week' | 'month'; label: string }[] = [
  { key: 'today', label: '今日数据' },
  { key: 'week', label: '本周数据' },
  { key: 'month', label: '本月数据' },
];

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    setLoading(true);
    getDashboardData()
      .then((res) => {
        setData(res?.data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '22px', fontWeight: 600 }}>数据仪表盘</h2>

      <Spin spinning={loading} tip="数据加载中...">
        {/* 8 个维度总数卡片 */}
        <Row gutter={[16, 16]}>
          {DIMENSIONS.map((d) => (
            <Col xs={24} sm={12} lg={6} key={d.key}>
              <Card
                hoverable
                styles={{
                  body: {
                    backgroundColor: d.bg,
                    borderRadius: 8,
                  },
                }}
              >
                <Statistic
                  title={`${d.label}总数`}
                  value={data?.[d.key]?.total ?? 0}
                  styles={{
                    content: {
                      color: d.color,
                      fontSize: 32,
                      fontWeight: 600,
                    },
                  }}
                  prefix={<span style={{ fontSize: 20, color: d.color }}>{d.icon}</span>}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 新增数据：今日 / 本周 / 本月 切换 */}
        <Card
          title="新增数据"
          size="small"
          style={{ marginTop: 16 }}
          extra={
            <Segmented
              options={PERIODS.map((p) => ({ label: p.label, value: p.key }))}
              value={period}
              onChange={(v) => setPeriod(v as 'today' | 'week' | 'month')}
            />
          }
        >
          <Row gutter={[8, 12]}>
            {DIMENSIONS.map((d) => (
              <Col xs={12} md={6} key={d.key}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 6,
                    backgroundColor: '#fafafa',
                  }}
                >
                  <span style={{ color: '#666', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: d.color }}>{d.icon}</span>
                    {d.label}
                  </span>
                  <b style={{ color: d.color, fontSize: 18 }}>{data?.[d.key]?.[period] ?? 0}</b>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard;
