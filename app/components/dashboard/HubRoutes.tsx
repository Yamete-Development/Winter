import { PauseCircleOutlined, PlayCircleOutlined, StopOutlined } from "@ant-design/icons";
import type { HubConnectionResource } from "~/resources/connection";

export function HubRoutes({ connections, canManage, pending, onToggle, onDisconnect }: { connections: HubConnectionResource[]; canManage: boolean; pending: boolean; onToggle: (connection: HubConnectionResource) => void; onDisconnect: (connection: HubConnectionResource) => void }) {
  return <section className="dashboard-section"><div className="dashboard-section__header"><h2>Connected routes</h2></div><div className="dashboard-panel dashboard-panel--wide">
    {connections.map((connection) => <div className="dashboard-row" key={connection.metadata.id}>
      <div className="dashboard-row__identity"><span className="dashboard-avatar">{connection.status.serverName.slice(0, 2).toUpperCase()}</span><div><strong>{connection.status.serverName}</strong><small>{connection.status.channelName || `Channel ${connection.spec.channelId}`}</small></div></div>
      <div className="dashboard-row__meta">{connection.spec.connected ? "Receiving Hub messages" : "Paused by a manager"}</div>
      <span className={`dashboard-status${connection.spec.connected ? "" : " dashboard-status--attention"}`}>{connection.spec.connected ? "Active" : "Paused"}</span>
      <div className="dashboard-actions"><button className="dashboard-icon-button" title={connection.spec.connected ? "Pause route" : "Resume route"} aria-label={connection.spec.connected ? `Pause ${connection.status.serverName}` : `Resume ${connection.status.serverName}`} disabled={!canManage || pending} onClick={() => onToggle(connection)}>{connection.spec.connected ? <PauseCircleOutlined /> : <PlayCircleOutlined />}</button><button className="dashboard-icon-button dashboard-button--danger" title="Disconnect route" aria-label={`Disconnect ${connection.status.serverName}`} disabled={!canManage || pending} onClick={() => onDisconnect(connection)}><StopOutlined /></button></div>
    </div>)}
    {connections.length === 0 && <div className="dashboard-empty"><h3>No connected routes</h3><p>Connect a Discord channel through InterChat’s trusted server flow.</p></div>}
  </div></section>;
}
