import { PlusOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { orpc } from "~/lib/orpc";
import { PageHeader, ResourceAvatar, Section } from "~/components/dashboard/WorkspacePrimitives";

export default function DashboardIndex() {
  const { data: hubs = [], isLoading, isError } = useQuery(orpc.hub.getUserHubs.queryOptions());
  const connectionCount = hubs.reduce((total, hub) => total + hub.status.connectionCount, 0);
  const activeHubs = hubs.filter((hub) => !hub.spec.locked).length;

  return <>
    <PageHeader eyebrow="Today" title="Your InterChat workspace" description="Review the communities you manage and move directly to the work that needs attention." actions={<Link className="dashboard-button dashboard-button--primary" to="/dashboard/hubs"><PlusOutlined /> Manage hubs</Link>} />
    {isError && <div className="dashboard-alert">Authorization or Hub data could not be verified. Retry before making changes.</div>}
    <Section title="At a glance">
      <div className="dashboard-grid">
        <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Accessible Hubs</h3><p>Owner and staff access</p></div><strong>{isLoading ? "—" : hubs.length}</strong></div></div>
        <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Open routes</h3><p>Connected servers</p></div><strong>{isLoading ? "—" : connectionCount}</strong></div></div>
        <div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Available</h3><p>Hubs accepting traffic</p></div><strong>{isLoading ? "—" : activeHubs}</strong></div></div>
      </div>
    </Section>
    <Section title="Recent places" action={{ label: "View all Hubs", to: "/dashboard/hubs" }}>
      <div className="dashboard-panel dashboard-panel--wide">
        {hubs.slice(0, 5).map((hub) => <div className="dashboard-row" key={hub.metadata.id}>
          <div className="dashboard-row__identity"><ResourceAvatar name={hub.metadata.name} imageUrl={hub.spec.iconUrl} /><div><strong>{hub.metadata.name}</strong><small>{hub.metadata.effectiveRole.toLowerCase()} · {hub.spec.visibility.toLowerCase()}</small></div></div>
          <div className="dashboard-row__meta">{hub.status.connectionCount} connected servers</div>
          <span className={`dashboard-status${hub.spec.locked ? " dashboard-status--attention" : ""}`}>{hub.spec.locked ? "Locked" : "Open"}</span>
          <Link className="dashboard-row__action" to={`/dashboard/hubs/${hub.metadata.id}/overview`}>Open</Link>
        </div>)}
        {!isLoading && hubs.length === 0 && <div className="dashboard-empty"><SafetyCertificateOutlined /><h3>No Hubs yet</h3><p>Create a Hub to connect communities. Discord onboarding remains available if you prefer to start there.</p><Link className="dashboard-button dashboard-button--primary" to="/dashboard/hubs">Create Hub</Link></div>}
      </div>
    </Section>
  </>;
}
