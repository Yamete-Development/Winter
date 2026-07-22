import { ConfigProvider, theme as antTheme } from "antd";
import { MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Route } from "./+types/layout";
import { requireUser } from "~/services/auth.server";
import { DashboardMobileNavigation, DashboardNavigation } from "~/components/dashboard/Navigation";
import "~/styles/dashboard.css";

type DashboardTheme = "night" | "paper";

export async function loader({ request }: Route.LoaderArgs) {
  return { user: await requireUser(request) };
}

export default function DashboardLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState<DashboardTheme>("night");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("interchat-dashboard-theme");
    if (stored === "night" || stored === "paper") setDashboardTheme(stored);
    else if (!matchMedia("(prefers-color-scheme: dark)").matches) setDashboardTheme("paper");
  }, []);

  useEffect(() => {
    const listener = (event: Event) => setDashboardTheme((event as CustomEvent<DashboardTheme>).detail);
    window.addEventListener("interchat-dashboard-theme", listener);
    return () => window.removeEventListener("interchat-dashboard-theme", listener);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const navigation = document.getElementById("dashboard-navigation");
    navigation?.querySelector<HTMLAnchorElement>("a")?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);
  useEffect(() => {
    localStorage.setItem("interchat-dashboard-theme", dashboardTheme);
    document.documentElement.dataset.dashboardTheme = dashboardTheme;
  }, [dashboardTheme]);

  const theme = useMemo(() => ({
    algorithm: dashboardTheme === "night" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: "#5B4CCB",
      colorInfo: "#3C7DA2",
      colorSuccess: "#4B8A5A",
      colorWarning: "#C75D49",
      colorError: "#B93838",
      borderRadius: 7,
      fontFamily: "Inter, system-ui, sans-serif",
    },
  }), [dashboardTheme]);

  return (
    <ConfigProvider theme={theme}>
      <div className="dashboard-root" data-dashboard-theme={dashboardTheme} data-menu-open={menuOpen}>
        <button className="dashboard-drawer-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
        <DashboardNavigation user={user} onNavigate={() => setMenuOpen(false)} />
        <div className="dashboard-main">
          <header className="dashboard-topbar">
            <button ref={menuButtonRef} className="dashboard-icon-button dashboard-menu-button" aria-label="Open navigation" aria-controls="dashboard-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><MenuOutlined /></button>
            <div className="dashboard-topbar__title">InterChat operations</div>
            <div className="dashboard-topbar__actions">
              <button className="dashboard-icon-button" aria-label={`Use ${dashboardTheme === "night" ? "paper" : "night"} theme`} title={`Use ${dashboardTheme === "night" ? "paper" : "night"} theme`} onClick={() => setDashboardTheme((value) => value === "night" ? "paper" : "night")}>
                {dashboardTheme === "night" ? <SunOutlined /> : <MoonOutlined />}
              </button>
            </div>
          </header>
          <main className="dashboard-content"><Outlet /></main>
        </div>
        <DashboardMobileNavigation />
      </div>
    </ConfigProvider>
  );
}
