import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { orpc } from "~/lib/orpc";
import { PageHeader, ResourceAvatar } from "~/components/dashboard/WorkspacePrimitives";

export default function ServersPage() {
  const { data: servers = [], isLoading, isError } = useQuery(orpc.server.list.queryOptions());
  return <>
    <PageHeader eyebrow="Places" title="Discord servers" description="Manage InterChat text Call behavior for servers where you have Discord Manage Server permission." />
    {isError && <div className="dashboard-alert">Discord server access could not be refreshed. Sign in again if this continues.</div>}
    <section className="dashboard-section"><div className="dashboard-panel dashboard-panel--wide">
      {servers.map((server) => <div className="dashboard-row" key={server.metadata.id}>
        <div className="dashboard-row__identity"><ResourceAvatar name={server.metadata.name} imageUrl={server.metadata.iconUrl} /><div><strong>{server.metadata.name}</strong><small>{server.status.botInstalled ? "InterChat installed" : "InterChat not installed"}</small></div></div>
        <div className="dashboard-row__meta">{server.status.callCount} text Calls · {server.spec.lobbyChannelIds.length || "Any"} allowed channels</div>
        <span className={`dashboard-status${server.status.botInstalled ? "" : " dashboard-status--attention"}`}>{server.status.botInstalled ? "Ready" : "Install required"}</span>
        <Link className="dashboard-row__action" to={`/dashboard/servers/${server.metadata.id}/overview`}>Manage</Link>
      </div>)}
      {!isLoading && servers.length === 0 && <div className="dashboard-empty"><SafetyCertificateOutlined /><h3>No manageable servers</h3><p>Discord did not return any servers where you can manage InterChat settings.</p></div>}
    </div></section>
  </>;
}
