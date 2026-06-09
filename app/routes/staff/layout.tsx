import { Outlet, Link, useLocation } from "react-router";
import type { Route } from "./+types/layout";
import { requireStaff } from "../../services/auth.server";
import { Layout, Menu, ConfigProvider, theme } from "antd";
import { DashboardOutlined, NodeIndexOutlined, LineChartOutlined } from "@ant-design/icons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireStaff(request);
  return { user };
}

const { Header, Sider, Content } = Layout;

export default function StaffLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const location = useLocation();

  const menuItems = [
    {
      key: "/staff",
      icon: <DashboardOutlined />,
      label: <Link to="/staff">Overview</Link>,
    },
    {
      key: "/staff/relationships",
      icon: <NodeIndexOutlined />,
      label: <Link to="/staff/relationships">Relationships Graph</Link>,
    },
    {
      key: "/staff/analytics",
      icon: <LineChartOutlined />,
      label: <Link to="/staff/analytics">Analytics</Link>,
    },
  ];

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={250} theme="dark" breakpoint="lg" collapsedWidth="0">
          <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
            InterChat Staff
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} />
        </Sider>
        <Layout>
          <Header style={{ padding: "0 24px", background: "#141414", display: "flex", alignItems: "center", justifyContent: "flex-end", borderBottom: "1px solid #303030" }}>
            <span style={{ color: "white", marginRight: 16 }}>{user.username} (Staff Admin)</span>
          </Header>
          <Content style={{ margin: "24px 16px", padding: 24, minHeight: 280, background: "#1f1f1f", borderRadius: 8 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
