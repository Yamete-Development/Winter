import type { HubResource } from "~/resources/hub";

export function HubOverview({ hub }: { hub: HubResource }) {
  const protections = [hub.spec.locked && "Hub locked", hub.spec.nsfw && "NSFW space", hub.spec.settings > 0 && "Modules configured"].filter(Boolean);
  return <>
    <section className="dashboard-section"><div className="dashboard-grid">
      <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Connected servers</h3><p>Active routes in this Hub</p></div><strong>{hub.status.connectionCount}</strong></div></div>
      <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Weekly messages</h3><p>Observed Hub activity</p></div><strong>{hub.status.weeklyMessageCount}</strong></div></div>
      <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body"><h3>Visibility</h3><p>{hub.spec.visibility.toLowerCase()} · {hub.spec.language || "Any language"}</p></div></div>
    </div></section>
    <section className="dashboard-section"><div className="dashboard-section__header"><h2>Configuration summary</h2></div><div className="dashboard-grid">
      <div className="dashboard-panel dashboard-panel--wide"><div className="dashboard-panel__body"><h3>Welcome</h3><p>{hub.spec.welcomeMessage || "No welcome message has been configured."}</p></div></div>
      <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body"><h3>Protections</h3><p>{protections.length ? protections.join(" · ") : "Using the standard Hub defaults"}</p></div></div>
    </div></section>
  </>;
}
