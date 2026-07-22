import { AddInterChatButton, AtlasPin, MessageFragment } from "./Primitives";
import { Reveal } from "./Reveal";

export function HeroSection() {
  return (
    <section className="atlas-hero" id="top" aria-labelledby="hero-title">
      <div className="atlas-contours atlas-contours--dark" aria-hidden="true" />
      <div className="atlas-container atlas-hero__grid">
        <Reveal className="atlas-hero__copy">
          <p className="atlas-eyebrow">InterChat for Discord</p>
          <h1 id="hero-title">Your server was never meant to be an island.</h1>
          <p className="atlas-hero__lede">
            InterChat links channels across Discord servers through shared Hubs—and matches
            communities for spontaneous text Calls, with safety and control built into every connection.
          </p>
          <div className="atlas-hero__actions">
            <AddInterChatButton />
            <a className="atlas-text-link atlas-text-link--light" href="#hubs">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
        </Reveal>

        <Reveal className="hero-map" delay={120}>
          <svg className="hero-map__route" viewBox="0 0 640 530" aria-hidden="true" focusable="false">
            <path className="route-shadow" d="M34 376C116 327 171 343 224 292S320 182 387 218s78 87 127 42 63-118 101-155" />
            <path className="route-line route-line--animated" d="M34 376C116 327 171 343 224 292S320 182 387 218s78 87 127 42 63-118 101-155" />
            <circle className="route-marker" r="7">
              <animateMotion dur="5s" repeatCount="indefinite" path="M34 376C116 327 171 343 224 292S320 182 387 218s78 87 127 42 63-118 101-155" />
            </circle>
          </svg>

          <div className="hero-compass" aria-hidden="true">
            <span>N</span>
            <img src="/images/interchat.png" alt="" width="124" height="120" />
            <small>COMMUNITY ATLAS</small>
          </div>

          <div className="hero-neighbourhood hero-neighbourhood--one">
            <AtlasPin label="Pixel Pier" tone="sky" />
            <div className="atlas-buildings" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="hero-neighbourhood hero-neighbourhood--two">
            <AtlasPin label="Garden Guild" tone="violet" />
            <div className="atlas-buildings atlas-buildings--warm" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="hero-neighbourhood hero-neighbourhood--three">
            <AtlasPin label="Night Café" tone="coral" />
            <div className="atlas-buildings atlas-buildings--small" aria-hidden="true"><i /><i /></div>
          </div>

          <div className="hero-message hero-message--one">
            <span className="fragment-label"># global-lounge · Hub</span>
            <MessageFragment initials="M" name="Mia" origin="from Garden Guild" tone="violet">
              anyone up for a game night?
            </MessageFragment>
          </div>
          <div className="hero-message hero-message--two">
            <span className="fragment-label fragment-label--coral">Text Call · Connected</span>
            <MessageFragment initials="J" name="Jay" origin="from Night Café" tone="coral">
              hello from somewhere new 👋
            </MessageFragment>
          </div>
        </Reveal>
      </div>
      <div className="atlas-route-exit" aria-hidden="true"><span /></div>
    </section>
  );
}
