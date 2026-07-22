import { InitialAvatar, MessageFragment, SectionIntro } from "./Primitives";
import { Reveal } from "./Reveal";

export function CallsSection() {
  return (
    <section className="atlas-section atlas-section--calls" id="calls" aria-labelledby="calls-title">
      <div className="atlas-container calls-layout">
        <Reveal className="calls-map">
          <div className="calls-map__server calls-map__server--local">
            <span className="server-mark server-mark--violet">GG</span>
            <div><strong>Garden Guild</strong><small># call-corner</small></div>
          </div>
          <div className="calls-map__track" aria-hidden="true">
            <span className="calls-map__switch" />
            <span className="calls-map__signal">MATCH</span>
          </div>
          <div className="calls-map__server calls-map__server--remote">
            <span className="server-mark server-mark--sky">PP</span>
            <div><strong>Pixel Pier</strong><small># meet-someone</small></div>
          </div>

          <div className="call-card">
            <header>
              <div className="call-card__peers">
                <InitialAvatar initials="GG" tone="violet" />
                <InitialAvatar initials="PP" tone="sky" />
              </div>
              <div><strong>Text Call connected</strong><small>Garden Guild ↔ Pixel Pier</small></div>
              <span className="live-dot">Live</span>
            </header>
            <div className="call-card__messages">
              <MessageFragment initials="R" name="Rae" origin="Remote" tone="sky">hey! what are you all building?</MessageFragment>
              <MessageFragment initials="Y" name="You" tone="violet">a tiny co-op game. want a peek?</MessageFragment>
            </div>
            <div className="call-card__actions" aria-label="Available Call actions">
              <span>Skip</span><span>Send friend request</span><span className="danger">Hang up</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="calls-layout__copy" delay={100}>
          <SectionIntro question="How do Calls work?" title="A hello from somewhere unexpected." titleId="calls-title">
            Start a 1:1 text Call, skip when the vibe isn’t right, or open a group Call for up to five servers.
          </SectionIntro>
          <p className="atlas-handnote">Temporary route. Real conversation.</p>
        </Reveal>
      </div>
    </section>
  );
}
