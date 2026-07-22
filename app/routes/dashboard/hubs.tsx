import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { orpc } from "~/lib/orpc";
import { CreateHubWizard } from "~/components/CreateHubWizard";
import { PageHeader, ResourceAvatar } from "~/components/dashboard/WorkspacePrimitives";

export default function HubsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: hubs = [], isLoading, isError } = useQuery(orpc.hub.getUserHubs.queryOptions());
  return <>
    <PageHeader eyebrow="Places" title="Hubs" description="Persistent spaces where connected Discord communities share conversation, rules, and a moderation team." actions={<button className="dashboard-button dashboard-button--primary" type="button" onClick={() => setCreateOpen(true)}><PlusOutlined /> Create Hub</button>} />
    {isError && <div className="dashboard-alert">Your Hub access could not be verified. No permissions have been changed.</div>}
    <section className="dashboard-section">
      <div className="dashboard-panel dashboard-panel--wide">
        {hubs.map((hub) => <div className="dashboard-row" key={hub.metadata.id}>
          <div className="dashboard-row__identity"><ResourceAvatar name={hub.metadata.name} imageUrl={hub.spec.iconUrl} /><div><strong>{hub.metadata.name}</strong><small>{hub.spec.shortDescription || hub.spec.description}</small></div></div>
          <div className="dashboard-row__meta">{hub.status.connectionCount} routes · {hub.status.weeklyMessageCount} messages this week</div>
          <span className={`dashboard-status${hub.spec.locked ? " dashboard-status--attention" : ""}`}>{hub.spec.locked ? "Locked" : hub.spec.visibility}</span>
          <Link className="dashboard-row__action" to={`/dashboard/hubs/${hub.metadata.id}/overview`}>Manage</Link>
        </div>)}
        {!isLoading && hubs.length === 0 && <div className="dashboard-empty"><TeamOutlined /><h3>No accessible Hubs</h3><p>Create one here or ask a Hub owner to add you to their team.</p></div>}
      </div>
    </section>
    <CreateHubWizard
      mode="modal"
      open={createOpen}
      onCancel={() => setCreateOpen(false)}
      isFirstHub={hubs.length === 0}
      onCreated={async (hubId) => {
        await queryClient.invalidateQueries({ queryKey: orpc.hub.getUserHubs.queryOptions().queryKey });
        navigate(`/dashboard/hubs/${hubId}/overview`);
      }}
    />
  </>;
}
