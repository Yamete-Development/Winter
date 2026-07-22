import { AddInterChatButton } from "./Primitives";
import { Reveal } from "./Reveal";
import { SUPPORT_SERVER_URL } from "./constants";

export function FinaleSection() {
  return (
    <section className="atlas-finale" aria-labelledby="finale-title">
      <div className="atlas-contours atlas-contours--dark" aria-hidden="true" />
      <div className="finale-map" aria-hidden="true">
        <svg viewBox="0 0 1200 700" focusable="false">
          <path d="M16 414C177 362 217 477 354 390S470 220 606 293s185 112 290 15 179-133 287-80" />
          <path d="M95 606C221 516 322 605 434 515s173-65 235-20 165 65 251-29 182-74 266-32" />
          <circle cx="354" cy="390" r="9" /><circle cx="606" cy="293" r="9" /><circle cx="896" cy="308" r="9" />
          <circle cx="434" cy="515" r="7" /><circle cx="920" cy="466" r="7" />
        </svg>
        <span className="finale-map__place finale-map__place--one">Pixel Pier</span>
        <span className="finale-map__place finale-map__place--two">Garden Guild</span>
        <span className="finale-map__place finale-map__place--three">Night Café</span>
      </div>
      <div className="atlas-container finale-content">
        <Reveal>
          <img className="finale-mark" src="/images/interchat.png" alt="" width="112" height="108" />
          <p className="atlas-eyebrow">The map is open</p>
          <h2 id="finale-title">Make your server part of something bigger.</h2>
          <p>Open a route to new communities, new conversations, and people you would never have met otherwise.</p>
          <div className="finale-content__actions">
            <AddInterChatButton />
            <a className="atlas-text-link atlas-text-link--light" href={SUPPORT_SERVER_URL}>Join the support server <span aria-hidden="true">↗</span></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
