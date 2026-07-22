import { useEffect, useState } from "react";
import { Switch } from "antd";
import type { HubResource } from "~/resources/hub";

export function HubSettings({ hub, canEdit, saving, onSave }: { hub: HubResource; canEdit: boolean; saving: boolean; onSave: (changes: { locked: boolean; nsfw: boolean; welcomeMessage: string }) => void }) {
  const [locked, setLocked] = useState(hub.spec.locked);
  const [nsfw, setNsfw] = useState(hub.spec.nsfw);
  const [welcomeMessage, setWelcomeMessage] = useState(hub.spec.welcomeMessage || "");
  useEffect(() => { setLocked(hub.spec.locked); setNsfw(hub.spec.nsfw); setWelcomeMessage(hub.spec.welcomeMessage || ""); }, [hub]);
  return <section className="dashboard-section"><div className="dashboard-section__header"><h2>Hub settings</h2></div><div className="dashboard-form">
    {!canEdit && <div className="dashboard-alert">Your current Hub capabilities allow viewing these settings, but not changing them.</div>}
    <div className="dashboard-toggle-row"><div><strong>Lock new activity</strong><small>Pause new connections and conversation while moderators work.</small></div><Switch checked={locked} disabled={!canEdit} onChange={setLocked} /></div>
    <div className="dashboard-toggle-row"><div><strong>NSFW community</strong><small>Mark the Hub as intended for age-restricted communities.</small></div><Switch checked={nsfw} disabled={!canEdit} onChange={setNsfw} /></div>
    <div className="dashboard-field"><label htmlFor="hub-welcome">Welcome message</label><textarea id="hub-welcome" className="dashboard-textarea" value={welcomeMessage} disabled={!canEdit} maxLength={2000} onChange={(event) => setWelcomeMessage(event.target.value)} /><small>Shown when a community joins this Hub.</small></div>
    {canEdit && <div><button className="dashboard-button dashboard-button--primary" disabled={saving} onClick={() => onSave({ locked, nsfw, welcomeMessage })}>{saving ? "Saving…" : "Save changes"}</button></div>}
  </div></section>;
}
