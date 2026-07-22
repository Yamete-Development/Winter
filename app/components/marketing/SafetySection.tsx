import { SectionIntro } from "./Primitives";
import { Reveal } from "./Reveal";

export function SafetySection() {
  return (
    <section className="atlas-section atlas-section--safety" id="safety" aria-labelledby="safety-title">
      <div className="atlas-container safety-layout">
        <Reveal className="safety-layout__copy">
          <SectionIntro question="What happens when something goes wrong?" title="Safe passage, built into the route." titleId="safety-title">
            Hub and Call messages pass through InterChat’s safety checks before delivery. People can report problems,
            and moderators can warn, mute, ban, or restrict access.
          </SectionIntro>
        </Reveal>

        <div className="safety-route" aria-label="Safety flow: check, report, resolve">
          <div className="safety-route__line" aria-hidden="true" />
          <Reveal className="checkpoint checkpoint--check" delay={80}>
            <span className="checkpoint__number">01</span>
            <div className="checkpoint__marker" aria-hidden="true">✓</div>
            <div className="checkpoint__copy"><strong>Check before delivery</strong><span>Messages follow Hub and Call safety settings.</span></div>
            <div className="safety-result-card">
              <span>Check passed</span><strong>Message delivered</strong>
              <p>Safety settings applied before delivery.</p>
            </div>
          </Reveal>
          <Reveal className="checkpoint checkpoint--report" delay={160}>
            <span className="checkpoint__number">02</span>
            <div className="checkpoint__marker" aria-hidden="true">!</div>
            <div className="checkpoint__copy"><strong>Report with context</strong><span>People can flag a message or a wider conversation.</span></div>
            <div className="safety-result-card">
              <span>Report received</span><strong>Context attached</strong>
              <p>Recent messages are ready for moderator review.</p>
            </div>
          </Reveal>
          <Reveal className="checkpoint checkpoint--resolve" delay={240}>
            <span className="checkpoint__number">03</span>
            <div className="checkpoint__marker" aria-hidden="true">→</div>
            <div className="checkpoint__copy"><strong>Resolve with care</strong><span>Moderators act and leave a clear audit history.</span></div>
            <div className="safety-result-card">
              <span>Action recorded</span><strong>Access restricted</strong>
              <p>Reason saved · Appeal available</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
