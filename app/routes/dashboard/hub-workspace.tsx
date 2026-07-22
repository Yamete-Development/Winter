import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router";
import { message, Modal } from "antd";
import { orpc } from "~/lib/orpc";
import { PageHeader, WorkspaceTabs } from "~/components/dashboard/WorkspacePrimitives";
import { HubOverview } from "~/components/dashboard/HubOverview";
import { HubRoutes } from "~/components/dashboard/HubRoutes";
import { HubSettings } from "~/components/dashboard/HubSettings";
import type { Route } from "./+types/hub-workspace";

const views = ["overview", "routes", "messages", "safety", "team", "settings", "activity"] as const;
const tabs = views.map((path) => ({ path, label: path[0].toUpperCase() + path.slice(1) }));

export default function HubWorkspace({ params }: Route.ComponentProps) {
  const view = params.view || "overview";
  const hubId = params.hubId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: hubs = [], isLoading } = useQuery(orpc.hub.getUserHubs.queryOptions());
  const hub = hubs.find((candidate) => candidate.metadata.id === hubId);
  const { data: connections = [] } = useQuery(orpc.hub.getConnections.queryOptions({ input: { hubId }, enabled: view === "routes" }));
  const { data: messages } = useQuery(orpc.hub.getRecentMessages.queryOptions({ input: { hubId, limit: 30 }, enabled: view === "messages" }));
  const { data: staff = [] } = useQuery(orpc.moderation.getStaff.queryOptions({ input: { hubId }, enabled: view === "team" && !!hub?.metadata.permissions.MANAGE_MODERATORS }));
  const patchHub = useMutation(orpc.hub.patchConfig.mutationOptions());
  const toggleRoute = useMutation(orpc.hub.toggleConnection.mutationOptions());
  const disconnectRoute = useMutation(orpc.hub.disconnectConnection.mutationOptions());

  if (!views.includes(view as typeof views[number])) return <Navigate to={`/dashboard/hubs/${hubId}/overview`} replace />;
  if (isLoading) return <div className="dashboard-alert dashboard-alert--sage">Loading Hub workspace…</div>;
  if (!hub) return <div className="dashboard-alert">This Hub does not exist or Iris could not verify your access.</div>;
  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: orpc.hub.getUserHubs.key() }); };

  return <>
    <PageHeader eyebrow={`${hub.metadata.effectiveRole} access`} title={hub.metadata.name} description={hub.spec.shortDescription || hub.spec.description} actions={<button className="dashboard-button" onClick={() => navigate("/dashboard/hubs")}>All Hubs</button>} />
    <WorkspaceTabs base={`/dashboard/hubs/${hubId}`} items={tabs} />
    {view === "overview" && <HubOverview hub={hub} />}
    {view === "routes" && <HubRoutes connections={connections} canManage={hub.metadata.permissions.MANAGE_CONNECTIONS} pending={toggleRoute.isPending || disconnectRoute.isPending} onToggle={async (connection) => { await toggleRoute.mutateAsync({ hubId, connectionId: connection.metadata.id, enabled: !connection.spec.connected }); message.success(connection.spec.connected ? "Route paused" : "Route resumed"); await queryClient.invalidateQueries({ queryKey: orpc.hub.getConnections.key() }); }} onDisconnect={(connection) => Modal.confirm({ title: `Disconnect ${connection.status.serverName}?`, content: "This channel will stop receiving Hub messages.", okText: "Disconnect", okType: "danger", onOk: async () => { await disconnectRoute.mutateAsync({ hubId, connectionId: connection.metadata.id }); await queryClient.invalidateQueries({ queryKey: orpc.hub.getConnections.key() }); } })} />}
    {view === "messages" && <section className="dashboard-section"><div className="dashboard-section__header"><h2>Recent Hub messages</h2></div><div className="dashboard-panel dashboard-panel--wide">{messages?.items.map((item) => <div className="dashboard-row" key={item.metadata.id}><div className="dashboard-row__identity"><span className="dashboard-avatar">{(item.status.authorName || "?").slice(0, 2).toUpperCase()}</span><div><strong>{item.status.authorName || "Unknown member"}</strong><small>{item.status.guildName || "Unknown server"}</small></div></div><div className="dashboard-row__meta" style={{ gridColumn: "span 2" }}>{item.spec.content}</div><small>{new Date(item.metadata.createdAt).toLocaleString()}</small></div>)}{!messages?.items.length && <div className="dashboard-empty"><h3>No recent messages</h3><p>The owner surface is read-only; new conversations happen in Discord.</p></div>}</div></section>}
    {view === "safety" && <section className="dashboard-section"><div className="dashboard-grid"><div className="dashboard-panel dashboard-panel--wide"><div className="dashboard-panel__body"><h3>Safety operations</h3><p>Polarizer evaluates Hub and Call content before delivery. Held messages, reports, appeals, infractions, and restrictions are managed in the safety inbox.</p><div className="dashboard-actions" style={{ marginTop: 16 }}><a className="dashboard-button dashboard-button--primary" href={`/dashboard/inbox?hubId=${hubId}`}>Open safety inbox</a></div></div></div><div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body"><h3>Image filtering</h3><p>Image safety decisions are evaluated by Polarizer before content is delivered.</p></div></div></div></section>}
    {view === "team" && <section className="dashboard-section"><div className="dashboard-section__header"><h2>Hub team</h2></div>{!hub.metadata.permissions.MANAGE_MODERATORS ? <div className="dashboard-alert">Team membership is visible only to people who can manage moderators.</div> : <div className="dashboard-panel dashboard-panel--wide">{staff.map((member) => <div className="dashboard-row" key={member.userId}><div className="dashboard-row__identity"><span className="dashboard-avatar">{member.userId.slice(-2)}</span><div><strong>{member.userId}</strong><small>Discord user</small></div></div><div className="dashboard-row__meta">{member.role}</div><span className="dashboard-status">Active</span><span /></div>)}{staff.length === 0 && <div className="dashboard-empty"><h3>No delegated staff</h3><p>The Hub owner retains full access.</p></div>}</div>}</section>}
    {view === "settings" && <HubSettings hub={hub} canEdit={hub.metadata.permissions.MANAGE_HUB_SETTINGS} saving={patchHub.isPending} onSave={async (changes) => { await patchHub.mutateAsync({ hubId, ...changes }); await refresh(); message.success("Hub settings saved"); }} />}
    {view === "activity" && <section className="dashboard-section"><div className="dashboard-alert dashboard-alert--sage">Audit history will appear here as recorded events become available. No synthetic activity is shown.</div></section>}
  </>;
}
