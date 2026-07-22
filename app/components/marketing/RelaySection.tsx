import { MessageFragment, SectionIntro } from "./Primitives";
import { Reveal } from "./Reveal";

const channels = [
  { server: "Pixel Pier", initials: "PP", tone: "sky" as const, note: "Sent here" },
  { server: "Garden Guild", initials: "GG", tone: "violet" as const, note: "Safety check" },
  { server: "Night Café", initials: "NC", tone: "coral" as const, note: "Delivered" },
];

export function RelaySection() {
  return (
    <section className="atlas-section atlas-section--paper relay-section" aria-labelledby="relay-title">
      <div className="atlas-container">
        <Reveal>
          <SectionIntro question="What does InterChat actually do?" title="One channel. A whole neighbourhood." titleId="relay-title">
            A message sent in one connected channel appears across every server in the Hub, while each
            community keeps its own home.
          </SectionIntro>
        </Reveal>

        <Reveal className="relay-map" delay={100}>
          <div className="relay-map__line" aria-hidden="true">
            <span className="relay-map__traveller" />
          </div>
          {channels.map((channel, index) => (
            <article className="channel-fragment" key={channel.server}>
              <div className="channel-fragment__annotation">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {channel.note}
              </div>
              <header>
                <span className={`server-mark server-mark--${channel.tone}`}>{channel.initials}</span>
                <div>
                  <strong>{channel.server}</strong>
                  <small># global-lounge</small>
                </div>
                <span className="connected-stamp">Hub route</span>
              </header>
              <MessageFragment initials="M" name="Mia" origin={`via ${channel.server}`} tone={channel.tone}>
                anyone up for a game night?
              </MessageFragment>
            </article>
          ))}
        </Reveal>
        <p className="atlas-margin-note">Same conversation. Three communities. Everyone stays home.</p>
      </div>
    </section>
  );
}
