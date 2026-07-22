import { Link } from "react-router";
import { SectionIntro } from "./Primitives";
import { Reveal } from "./Reveal";

const serverControls = [
  ["Call channels", "# meet-someone"],
  ["Hide server name", "Off"],
  ["Match pings", "Friends only"],
  ["NSFW image filter", "On"],
] as const;

const hubControls = ["Manage connections", "Edit rules & modules", "Send announcements", "Review audit history"];

export function ControlSection() {
  return (
    <section className="atlas-section atlas-section--control" id="control" aria-labelledby="control-title">
      <div className="atlas-contours" aria-hidden="true" />
      <div className="atlas-container control-layout">
        <Reveal className="control-layout__copy">
          <SectionIntro question="Do we lose control of our server?" title="Your community keeps the keys." titleId="control-title" inverse>
            Choose where Calls can happen, decide what crosses your Hub, and give each moderator only the controls they need.
          </SectionIntro>
          <Link className="atlas-button atlas-button--paper" to="/dashboard">
            Open Dashboard <span aria-hidden="true">↗</span>
          </Link>
        </Reveal>

        <Reveal className="control-legend" delay={100}>
          <div className="control-legend__heading">
            <span>ATLAS LEGEND · OWNER CONTROLS</span>
            <strong>Garden Guild</strong>
          </div>
          <section className="control-panel" aria-labelledby="server-controls-title">
            <header><span className="legend-key legend-key--sky" /><h3 id="server-controls-title">Server controls</h3><small>4 settings</small></header>
            {serverControls.map(([label, value]) => (
              <div className="setting-row" key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </section>
          <section className="control-panel" aria-labelledby="hub-controls-title">
            <header><span className="legend-key legend-key--violet" /><h3 id="hub-controls-title">Hub team controls</h3><small>Granular roles</small></header>
            <div className="permission-list">
              {hubControls.map((item) => <span key={item}><i aria-hidden="true">✓</i>{item}</span>)}
            </div>
          </section>
          <div className="control-legend__foot">
            <span><i className="status-dot status-dot--on" /> Connections open</span>
            <span><i className="status-dot" /> Private Hub</span>
            <span><i className="status-dot status-dot--log" /> Logs saved</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
