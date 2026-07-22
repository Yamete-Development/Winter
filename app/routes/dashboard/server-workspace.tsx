import { message } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router";
import type { Route } from "./+types/server-workspace";
import { CallSettings } from "~/components/dashboard/CallSettings";
import { PageHeader, WorkspaceTabs } from "~/components/dashboard/WorkspacePrimitives";
import { orpc } from "~/lib/orpc";

const views = ["overview", "calls", "connections", "safety", "activity"] as const;
const tabs = views.map((path) => ({ path, label: path === "calls" ? "Text Calls" : path[0].toUpperCase() + path.slice(1) }));

export default function ServerWorkspace({ params }: Route.ComponentProps) {
  const view = params.view || "overview";
  const serverId = params.serverId;
  const queryClient = useQueryClient();
  const { data: servers = [], isLoading } = useQuery(orpc.server.list.queryOptions());
  const server = servers.find((candidate) => candidate.metadata.id === serverId);
  const { data: channels = [] } = useQuery(orpc.server.channels.queryOptions({ input: { serverId }, enabled: view === "calls" && !!server?.status.botInstalled }));
  const update = useMutation(orpc.server.patchCallConfig.mutationOptions());
  if (!views.includes(view as typeof views[number])) return <Navigate to={`/dashboard/servers/${serverId}/overview`} replace />;
  if (isLoading) return <div className="dashboard-alert dashboard-alert--sage">Loading server workspace…</div>;
  if (!server) return <div className="dashboard-alert">This server does not exist or Discord could not verify Manage Server permission.</div>;
  return <>
    <PageHeader eyebrow="Discord server" title={server.metadata.name} description="Owner controls for InterChat text Calls and cross-server connections." />
    <WorkspaceTabs base={`/dashboard/servers/${serverId}`} items={tabs} />
    {view === "overview" && <section className="dashboard-section"><div className="dashboard-grid"><div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body dashboard-stat"><div><h3>Text Calls</h3><p>Recorded for this server</p></div><strong>{server.status.callCount}</strong></div></div><div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body"><h3>Channel access</h3><p>{server.spec.lobbyChannelIds.length ? `${server.spec.lobbyChannelIds.length} selected channels` : "Any available channel"}</p></div></div><div className="dashboard-panel dashboard-panel--narrow"><div className="dashboard-panel__body"><h3>Image filtering</h3><p>{server.spec.filterNsfw ? "Enabled before delivery" : "Disabled for this server"}</p></div></div></div></section>}
    {view === "calls" && <CallSettings server={server} channels={channels} saving={update.isPending} onSave={async (spec) => { await update.mutateAsync({ serverId, ...spec }); await queryClient.invalidateQueries({ queryKey: orpc.server.list.key() }); message.success("Text Call settings saved"); }} />}
    {view === "connections" && <section className="dashboard-section"><div className="dashboard-alert dashboard-alert--sage">Hub connections are managed from each Hub’s Routes workspace.</div></section>}
    {view === "safety" && <section className="dashboard-section"><div className="dashboard-panel dashboard-panel--wide"><div className="dashboard-panel__body"><h3>Call image filtering</h3><p>{server.spec.filterNsfw ? "Explicit images are evaluated before they are shown in this server’s text Calls." : "Image filtering is currently disabled for this server."}</p></div></div></section>}
    {view === "activity" && <section className="dashboard-section"><div className="dashboard-alert dashboard-alert--sage">Only persisted server activity will appear here; no synthetic timeline is shown.</div></section>}
  </>;
}
