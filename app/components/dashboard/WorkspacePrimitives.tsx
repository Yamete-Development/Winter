import type { ReactNode } from "react";
import { Link, NavLink } from "react-router";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="dashboard-page-header"><div><div className="dashboard-eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="dashboard-actions">{actions}</div>}</header>;
}

export function Section({ title, action, children }: { title: string; action?: { label: string; to: string }; children: ReactNode }) {
  return <section className="dashboard-section"><div className="dashboard-section__header"><h2>{title}</h2>{action && <Link to={action.to}>{action.label}</Link>}</div>{children}</section>;
}

export function ResourceAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  return <span className="dashboard-avatar">{imageUrl ? <img src={imageUrl} alt="" /> : name.slice(0, 2).toUpperCase()}</span>;
}

export function WorkspaceTabs({ base, items }: { base: string; items: Array<{ path: string; label: string }> }) {
  return <nav className="dashboard-tabs" aria-label="Workspace sections">{items.map(({ path, label }) => <NavLink key={path} to={`${base}/${path}`}>{label}</NavLink>)}</nav>;
}
