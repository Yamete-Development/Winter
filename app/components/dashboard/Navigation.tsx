import {
  AppstoreOutlined,
  BellOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link, NavLink } from "react-router";
import type { User } from "~/services/auth.server";

const navigation = [
  { to: "/dashboard", label: "Today", icon: <AppstoreOutlined />, end: true },
  { to: "/dashboard/inbox", label: "Inbox", icon: <BellOutlined /> },
  { to: "/dashboard/hubs", label: "Hubs", icon: <TeamOutlined /> },
  { to: "/dashboard/servers", label: "Servers", icon: <SafetyCertificateOutlined /> },
];

export function DashboardNavigation({ user, onNavigate }: { user: User; onNavigate?: () => void }) {
  return (
    <aside id="dashboard-navigation" className="dashboard-sidebar" aria-label="Dashboard navigation">
      <Link className="dashboard-brand" to="/dashboard" onClick={onNavigate}>
        <img src="/images/interchat.png" alt="" />
        <span>InterChat</span>
      </Link>
      <nav className="dashboard-nav">
        <div className="dashboard-nav__label">Workspace</div>
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="dashboard-nav__link" onClick={onNavigate}>
            {item.icon}<span>{item.label}</span>
          </NavLink>
        ))}
        <div className="dashboard-nav__label">Preferences</div>
        <NavLink to="/dashboard/settings" className="dashboard-nav__link" onClick={onNavigate}>
          <SettingOutlined /><span>Appearance</span>
        </NavLink>
      </nav>
      <div className="dashboard-account">
        <div className="dashboard-user">
          <img src={user.avatarUrl} alt="" />
          <div><strong>{user.username}</strong><small>Discord account</small></div>
        </div>
        <Link className="dashboard-nav__link" to="/auth/logout"><LogoutOutlined /><span>Sign out</span></Link>
      </div>
    </aside>
  );
}

export function DashboardMobileNavigation() {
  return (
    <nav className="dashboard-mobile-nav" aria-label="Mobile dashboard navigation">
      {navigation.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end}>{item.icon}<span>{item.label}</span></NavLink>
      ))}
    </nav>
  );
}
