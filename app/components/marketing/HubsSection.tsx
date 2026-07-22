import { AtlasPin, SectionIntro } from "./Primitives";
import { Reveal } from "./Reveal";

export function HubsSection() {
  return (
    <section className="atlas-section atlas-section--hubs" id="hubs" aria-labelledby="hubs-title">
      <div className="atlas-container hubs-layout">
        <Reveal className="hubs-layout__copy">
          <SectionIntro question="Can whole communities meet here?" title="Build the place your people haven’t found yet." titleId="hubs-title">
            Create a public, unlisted, or private Hub. Set the rules, welcome new servers, and let
            communities meet without merging them.
          </SectionIntro>
          <div className="slash-command" aria-label="Use slash hub directory in Discord">
            <span>/hub directory</span>
            <small>Browse public Hubs from Discord</small>
          </div>
        </Reveal>

        <Reveal className="hub-plaza" delay={100}>
          <svg viewBox="0 0 700 590" aria-hidden="true" focusable="false">
            <path d="M34 434C123 424 172 359 250 330S342 302 369 245" />
            <path d="M667 439C580 410 550 352 470 321S405 279 369 245" />
            <path d="M346 574C335 479 373 416 369 245" />
          </svg>
          <div className="hub-plaza__center">
            <div className="hub-plaza__seal" aria-hidden="true">H</div>
            <p>Hobby Corner</p>
            <span>PUBLIC HUB · 8 SERVERS</span>
          </div>
          <div className="hub-plaza__pin hub-plaza__pin--one"><AtlasPin label="Pixel Pier" tone="sky" /></div>
          <div className="hub-plaza__pin hub-plaza__pin--two"><AtlasPin label="Night Café" tone="coral" /></div>
          <div className="hub-plaza__pin hub-plaza__pin--three"><AtlasPin label="Garden Guild" /></div>

          <div className="directory-card">
            <div className="directory-card__command">/hub directory</div>
            <div className="directory-card__result">
              <span className="directory-card__icon">HC</span>
              <div><strong>Hobby Corner</strong><small>Art, games & creative projects</small></div>
              <span className="visibility-badge">Public</span>
            </div>
            <div className="directory-card__details">
              <span>📌 Read the plaza rules</span>
              <span>✦ Weekly community spotlight</span>
              <span>↗ Invite a server</span>
            </div>
          </div>

          <div className="atlas-stamp atlas-stamp--rules">RULES<br />POSTED</div>
          <div className="atlas-stamp atlas-stamp--welcome">INVITES<br />OPEN</div>
        </Reveal>
      </div>
      <div className="atlas-fold" aria-hidden="true"><span>Detour: spontaneous Calls</span></div>
    </section>
  );
}
