import { Outlet, Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/layout";
import { requireUser } from "../../services/auth.server";
import { Layout, Menu, ConfigProvider, theme } from "antd";
import { AppstoreOutlined, SettingOutlined } from "@ant-design/icons";

const DASHBOARD_BACKGROUND_STORAGE_KEY = "interchat-dashboard-background";

export type DashboardBackgroundPreference = {
  version: 1;
  source: "default" | "unsplash" | "manual";
  imageUrl: string;
  previewUrl?: string;
  label: string;
  description?: string;
  photographerName?: string;
  photographerUrl?: string;
  unsplashId?: string;
  unsplashQuery?: string;
  downloadLocation?: string;
  position: string;
  opacity: number;
  appliedAt: string;
};

export type DashboardLayoutContext = {
  backgroundPreference: DashboardBackgroundPreference;
  updateBackgroundPreference: (next: DashboardBackgroundPreference) => void;
  resetBackgroundPreference: () => void;
};

export const DEFAULT_DASHBOARD_BACKGROUND: DashboardBackgroundPreference = {
  version: 1,
  source: "default",
  imageUrl:
    "https://images.unsplash.com/photo-1589750367974-4875f519d641?q=80&w=3184&auto=format&fit=crop",
  previewUrl:
    "https://images.unsplash.com/photo-1589750367974-4875f519d641?q=80&w=900&auto=format&fit=crop",
  label: "InterChat default",
  description: "Cinematic abstract background",
  photographerName: "Pawel Czerwinski",
  photographerUrl:
    "https://unsplash.com/@pawel_czerwinski?utm_source=interchat_web&utm_medium=referral",
  unsplashId: "uEr6T0D4n_I",
  unsplashQuery: "cinematic abstract",
  position: "center top",
  opacity: 0.55,
  appliedAt: new Date(0).toISOString(),
};

function normalizeDashboardBackground(
  value: unknown,
): DashboardBackgroundPreference | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.imageUrl !== "string" || !candidate.imageUrl.trim()) {
    return null;
  }

  const source = candidate.source;

  return {
    ...DEFAULT_DASHBOARD_BACKGROUND,
    source: source === "unsplash" || source === "manual" ? source : "default",
    imageUrl: candidate.imageUrl,
    previewUrl:
      typeof candidate.previewUrl === "string"
        ? candidate.previewUrl
        : undefined,
    label:
      typeof candidate.label === "string" && candidate.label.trim()
        ? candidate.label
        : DEFAULT_DASHBOARD_BACKGROUND.label,
    description:
      typeof candidate.description === "string"
        ? candidate.description
        : undefined,
    photographerName:
      typeof candidate.photographerName === "string"
        ? candidate.photographerName
        : undefined,
    photographerUrl:
      typeof candidate.photographerUrl === "string"
        ? candidate.photographerUrl
        : undefined,
    unsplashId:
      typeof candidate.unsplashId === "string"
        ? candidate.unsplashId
        : undefined,
    unsplashQuery:
      typeof candidate.unsplashQuery === "string"
        ? candidate.unsplashQuery
        : undefined,
    downloadLocation:
      typeof candidate.downloadLocation === "string"
        ? candidate.downloadLocation
        : undefined,
    position:
      typeof candidate.position === "string" && candidate.position.trim()
        ? candidate.position
        : DEFAULT_DASHBOARD_BACKGROUND.position,
    opacity:
      typeof candidate.opacity === "number"
        ? candidate.opacity
        : DEFAULT_DASHBOARD_BACKGROUND.opacity,
    appliedAt:
      typeof candidate.appliedAt === "string"
        ? candidate.appliedAt
        : new Date().toISOString(),
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [backgroundPreference, setBackgroundPreference] =
    useState<DashboardBackgroundPreference>(DEFAULT_DASHBOARD_BACKGROUND);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const saved = window.localStorage.getItem(DASHBOARD_BACKGROUND_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const normalized = normalizeDashboardBackground(parsed);

      if (normalized) {
        setBackgroundPreference(normalized);
      }
    } catch {
      window.localStorage.removeItem(DASHBOARD_BACKGROUND_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_BACKGROUND_STORAGE_KEY,
      JSON.stringify(backgroundPreference),
    );
  }, [backgroundPreference]);

  const updateBackgroundPreference = (next: DashboardBackgroundPreference) => {
    setBackgroundPreference(next);
  };

  const resetBackgroundPreference = () => {
    setBackgroundPreference(DEFAULT_DASHBOARD_BACKGROUND);
  };

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
        bodyBg: "transparent",
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
      },
    },
  };

  const dashboardLayoutContext = {
    backgroundPreference,
    updateBackgroundPreference,
    resetBackgroundPreference,
  } satisfies DashboardLayoutContext;

  return (
    <ConfigProvider theme={customTheme}>
      <div
        style={{
          position: "relative",
          height: "100vh",
          backgroundColor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Cinematic Vibrant Background Image */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url('${backgroundPreference.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: backgroundPreference.position,
              backgroundRepeat: "no-repeat",
              opacity: backgroundPreference.opacity,
            }}
          ></div>
        </div>
        {/* Dark vignette overlay for readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100vh",
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.95) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        ></div>

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

        <Layout
          style={{
            height: "100vh",
            background: "transparent",
            position: "relative",
            zIndex: 10,
            padding: "16px",
          }}
        >
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
              background: collapsed
                ? "rgba(16, 16, 24, 0.4)"
                : "rgba(16, 16, 24, 0.8)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: 24,
              border: collapsed
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(255,255,255,0.15)",
              boxShadow: collapsed ? "none" : "0 20px 40px rgba(0,0,0,0.5)",
              zIndex: 30,
              overflow: "hidden",
              height: "calc(100vh - 32px)",
              transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {/* Flex container to push the profile to the bottom */}
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              
              {/* Top Logo Section */}
              <div
                style={{
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
                  overflow: "hidden",
                }}
              >
                <img
                  src="/images/interchat.png"
                  alt="InterChat"
                  style={{ width: 36, height: 36, flexShrink: 0 }}
                />
                <span
                  style={{
                    opacity: collapsed ? 0 : 1,
                    transform: collapsed
                      ? "translateX(-16px)"
                      : "translateX(0px)",
                    transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                    display: "inline-block",
                  }}
                >
                  INTERCHAT
                </span>
              </div>

              {/* Navigation Menu (flex: 1 pushes the container below it to the bottom) */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                <Menu
                  mode="inline"
                  inlineCollapsed={collapsed}
                  selectedKeys={[location.pathname]}
                  items={menuItems}
                  style={{
                    borderRight: 0,
                    padding: "0 12px",
                    background: "transparent",
                  }}
                />
              </div>

              {/* Bottom User Profile Section */}
              <div
                style={{
                  height: 60,
                  marginBottom: 24,
                  marginTop: "auto", // Keeps it strictly at the bottom
                  display: "flex",
                  justifyContent: "flex-start",
                  paddingLeft: 22,
                  alignItems: "center",
                  gap: 12,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: "50%",
                  }}
                />
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.85)", // Muted consistent UI text color
                    fontWeight: 500, // Regular font weight
                    fontSize: "0.95rem", // Normal size, unlinked from the logo's 1.2rem
                    opacity: collapsed ? 0 : 1,
                    transform: collapsed
                      ? "translateX(-16px)"
                      : "translateX(0px)", // Matches the logo's sliding transition
                    transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                    display: "inline-block",
                  }}
                >
                  {user.username}
                </span>
              </div>

            </div>
          </Sider>

          <Layout
            style={{
              background: "transparent",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              marginLeft: 104,
              zIndex: 10,
            }}
          >
            {/* Dimmed Overlay strictly over center content when Sidebar expands */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                opacity: collapsed ? 0 : 1,
                pointerEvents: collapsed ? "none" : "auto",
                transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                zIndex: 25,
                borderRadius: 24,
              }}
            />
            <Content
              style={{
                margin: 0,
                paddingBottom: 24,
                minHeight: 0,
                position: "relative",
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <Outlet context={dashboardLayoutContext} />
            </Content>
          </Layout>
        </Layout>
      </div>
    </ConfigProvider>
  );
}