import { Card, Form, Input, InputNumber, DatePicker, Button, message } from 'antd';
import { createOfficialPartner } from '@/api/partners';

const PartnersPage = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    await createOfficialPartner({
      destination: values.destination,
      startDate: values.startDate.format('YYYY-MM-DD'),
      days: values.days,
      maxMembers: values.maxMembers,
      price: values.price,
      requirement: values.requirement,
    });
    message.success('发布成功');
    form.resetFields();
  };

  return (
    <Card title="发布官方搭子团">
      <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 500 }}>
        <Form.Item name="destination" label="目的地" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="startDate" label="出发日期" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="days" label="天数" rules={[{ required: true }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="maxMembers" label="最大人数" rules={[{ required: true }]}>
          <InputNumber min={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="price" label="价格 (元)" rules={[{ required: true }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="requirement" label="要求">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">发布</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PartnersPage;