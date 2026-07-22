import { useEffect, useState } from "react";
import { Select, Switch } from "antd";
import type { DiscordChannelResource, ServerResource } from "~/resources/server";

type CallSpec = ServerResource["spec"];
const toggles: Array<{ key: keyof Omit<CallSpec, "lobbyChannelIds">; label: string; description: string }> = [
  { key: "hideServerName", label: "Hide server name", description: "Keep this server’s name private from matched communities." },
  { key: "pingOnMatch", label: "Ping on match", description: "Notify the Call channel when another server connects." },
  { key: "autoRequeueOnSkip", label: "Requeue after skip", description: "Look for another text Call after a skipped match." },
  { key: "autoRequeueOnHangup", label: "Requeue after hangup", description: "Return to matching after the current Call ends." },
  { key: "filterNsfw", label: "Filter explicit images", description: "Ask InterChat to block explicit imagery before it reaches this server." },
];

export function CallSettings({ server, channels, saving, onSave }: { server: ServerResource; channels: DiscordChannelResource[]; saving: boolean; onSave: (spec: CallSpec) => void }) {
  const [spec, setSpec] = useState(server.spec);
  useEffect(() => setSpec(server.spec), [server]);
  const update = <K extends keyof CallSpec>(key: K, value: CallSpec[K]) => setSpec((current) => ({ ...current, [key]: value }));
  return <section className="dashboard-section"><div className="dashboard-form">
    {!server.status.botInstalled && <div className="dashboard-alert">Install InterChat in this server before changing text Call settings.</div>}
    <div className="dashboard-field"><label htmlFor="call-channels">Allowed Call channels</label><Select id="call-channels" mode="multiple" value={spec.lobbyChannelIds} disabled={!server.status.botInstalled} placeholder="Any text channel" options={channels.map((channel) => ({ value: channel.id, label: `#${channel.name}` }))} onChange={(value) => update("lobbyChannelIds", value)} /><small>Leave empty to allow text Calls in any channel where InterChat can respond.</small></div>
    <div>{toggles.map((toggle) => <div className="dashboard-toggle-row" key={toggle.key}><div><strong>{toggle.label}</strong><small>{toggle.description}</small></div><Switch checked={Boolean(spec[toggle.key])} disabled={!server.status.botInstalled} onChange={(value) => update(toggle.key, value)} /></div>)}</div>
    {server.status.botInstalled && <div><button className="dashboard-button dashboard-button--primary" disabled={saving} onClick={() => onSave(spec)}>{saving ? "Saving…" : "Save Call settings"}</button></div>}
  </div></section>;
}
