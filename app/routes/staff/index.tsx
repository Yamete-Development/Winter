import { Typography, Row, Col, Card, Statistic } from "antd";
import { UserOutlined, TeamOutlined, GlobalOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function StaffOverview() {
  return (
    <div>
      <Title level={2}>Staff Overview</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Users" value={112893} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Connected Servers" value={4512} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Active Hubs" value={134} prefix={<GlobalOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
