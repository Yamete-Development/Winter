import { Outlet, Link, useLocation } from "react-router";
import { useState } from "react";
import type { Route } from "./+types/layout";
import { requireUser } from "../../services/auth.server";
import { Layout, Menu, ConfigProvider, theme } from "antd";
import { AppstoreOutlined, SettingOutlined } from "@ant-design/icons";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    {
      key: "/dashboard",
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard">My Servers</Link>,
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/settings">Settings</Link>,
    },
  ];

  // Custom premium theme for the User Dashboard
  const customTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: "#8b5cf6", // Interchat purple
      colorBgBase: "#000000",
      colorBgContainer: "rgba(20, 20, 25, 0.4)", // Translucent for cards
      colorBgElevated: "rgba(30, 30, 40, 0.6)",
      borderRadius: 12,
      fontFamily: "'Inter', system-ui, sans-serif",
      colorTextBase: "rgba(255, 255, 255, 0.9)",
    },
    components: {
      Layout: {
        headerBg: "transparent",
        siderBg: "transparent",
        bodyBg: "transparent"
      },
      Menu: {
        itemBg: "transparent",
        itemColor: "rgba(255, 255, 255, 0.6)",
        itemSelectedColor: "#fff",
        itemSelectedBg: "rgba(139, 92, 246, 0.15)",
        itemBorderRadius: 8,
      },
      Card: {
        colorBorderSecondary: "rgba(255, 255, 255, 0.05)",
      },
      Select: {
        colorBgContainer: "rgba(0,0,0,0.3)",
        colorBorder: "#2d2d34",
      }
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <div style={{
        position: "relative",
        height: "100vh",
        backgroundColor: "#000000",
        overflow: "hidden"
      }}>
        {/* Cinematic Vibrant Background Image */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
           <div style={{ width: "100%", height: "100%", backgroundImage: "url('https://images.unsplash.com/photo-1589750367974-4875f519d641?q=80&w=3184&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", opacity: 0.55 }}></div>
        </div>
        {/* Dark vignette overlay for readability */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.95) 100%)", pointerEvents: "none", zIndex: 1 }}></div>
        
        {/* Global Glassmorphism Dropdowns */}
        <style>{`
          .ant-select-dropdown {
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            background: rgba(20, 20, 25, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
            border-radius: 12px !important;
            padding: 4px !important;
          }
          .ant-select-item-option {
            border-radius: 8px !important;
            margin-bottom: 4px !important;
          }
          .ant-select-item-option:last-child {
            margin-bottom: 0 !important;
          }
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: rgba(139, 92, 246, 0.2) !important;
          }
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          
          /* Custom Context Menu Styling */
          .ant-dropdown-menu {
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            background: rgba(20, 20, 25, 0.9) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
            border-radius: 12px !important;
            padding: 4px !important;
          }
          .ant-dropdown-menu-item {
            border-radius: 8px !important;
            color: rgba(255, 255, 255, 0.8) !important;
            transition: all 0.2s !important;
          }
          .ant-dropdown-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
          }
          .ant-dropdown-menu-item-danger {
            color: #ff4d4f !important;
          }
          .ant-dropdown-menu-item-danger:hover {
            background-color: rgba(255, 77, 79, 0.1) !important;
          }
          
          /* Custom Tabs Styling */
          .ant-tabs-nav::before {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          .ant-tabs-tab {
            color: rgba(255, 255, 255, 0.45) !important;
            transition: all 0.2s !important;
          }
          .ant-tabs-tab:hover {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #fff !important;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.3) !important;
          }
          .ant-tabs-ink-bar {
            background: #9146ff !important;
            height: 3px !important;
            border-radius: 3px !important;
          }
        `}</style>

        <Layout style={{ height: "100vh", background: "transparent", position: "relative", zIndex: 10, padding: "16px" }}>

          {/* Floating Collapsible Sidebar */}
          <Sider 
            collapsible
            collapsedWidth={80}
            width={240}
            collapsed={collapsed}
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
            trigger={null}
            style={{ 
              position: "absolute",
              left: 16,
              top: 16,
              bottom: 16,
              background: collapsed ? "rgba(16, 16, 24, 0.4)" : "rgba(16, 16, 24, 0.8)", 
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 24, 
              border: collapsed ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.15)", 
              boxShadow: collapsed ? "none" : "0 20px 40px rgba(0,0,0,0.5)",
              zIndex: 30,
              overflow: "hidden",
              height: "calc(100vh - 32px)",
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
          >
            <div style={{ 
              height: 60, 
              margin: "24px 0", 
              display: "flex", 
              justifyContent: "flex-start", 
              paddingLeft: 22, 
              alignItems: "center", 
              gap: 12, 
              color: "white", 
              fontWeight: 800, 
              fontSize: "1.2rem", 
              letterSpacing: "-0.02em", 
              whiteSpace: "nowrap",
              overflow: "hidden"
            }}>
               <img src="/images/interchat.png" alt="InterChat" style={{ width: 36, height: 36, flexShrink: 0 }} />
               <span style={{ 
                 opacity: collapsed ? 0 : 1, 
                 transform: collapsed ? "translateX(-16px)" : "translateX(0px)",
                 transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                 display: "inline-block"
               }}>INTERCHAT</span>
            </div>
            <Menu 
              mode="inline" 
              inlineCollapsed={collapsed}
              selectedKeys={[location.pathname]} 
              items={menuItems} 
              style={{ borderRight: 0, padding: "0 12px", background: "transparent" }} 
            />
          </Sider>
          
          <Layout style={{ background: "transparent", borderRadius: 24, display: "flex", flexDirection: "column", position: "relative", marginLeft: 104, zIndex: 10 }}>

            {/* Dimmed Overlay strictly over center content when Sidebar expands */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              opacity: collapsed ? 0 : 1,
              pointerEvents: collapsed ? "none" : "auto",
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
              zIndex: 25,
              borderRadius: 24
            }} />

            {/* Grounded Solid Header */}
            <Header style={{ flexShrink: 0, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "flex-end", background: "rgba(16, 16, 24, 0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                 <div style={{ width: 36, height: 36, borderRadius: "50%", background: `url('${user.avatarUrl}') center/cover`, backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)" }} />
                 <span style={{ color: "white", fontWeight: 500 }}>{user.username}</span>
              </div>
            </Header>
            <Content style={{ margin: 0, paddingBottom: 24, minHeight: 0, position: "relative", zIndex: 5, display: "flex", flexDirection: "column", flex: 1 }}>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
}
