import type { ReactNode } from "react";
import { ADD_INTERCHAT_URL } from "./constants";

export function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AddInterChatButton({ className = "" }: { className?: string }) {
  return (
    <a className={`atlas-button ${className}`} href={ADD_INTERCHAT_URL}>
      Add InterChat <ArrowIcon />
    </a>
  );
}

export function SectionIntro({
  question,
  title,
  titleId,
  children,
  inverse = false,
}: {
  question: string;
  title: string;
  titleId?: string;
  children: ReactNode;
  inverse?: boolean;
}) {
  return (
    <div className={`atlas-intro ${inverse ? "atlas-intro--inverse" : ""}`}>
      <p className="atlas-question">{question}</p>
      <h2 id={titleId}>{title}</h2>
      <p className="atlas-copy">{children}</p>
    </div>
  );
}

export function InitialAvatar({ initials, tone = "violet" }: { initials: string; tone?: "violet" | "sky" | "coral" | "sage" }) {
  return <span className={`atlas-avatar atlas-avatar--${tone}`} aria-hidden="true">{initials}</span>;
}

export function MessageFragment({
  initials,
  name,
  origin,
  children,
  tone = "violet",
}: {
  initials: string;
  name: string;
  origin?: string;
  children: ReactNode;
  tone?: "violet" | "sky" | "coral" | "sage";
}) {
  return (
    <div className="message-fragment">
      <InitialAvatar initials={initials} tone={tone} />
      <div>
        <div className="message-fragment__meta">
          <strong>{name}</strong>
          {origin && <span>{origin}</span>}
        </div>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function AtlasPin({ label, tone = "violet" }: { label: string; tone?: "violet" | "sky" | "coral" }) {
  return (
    <div className={`atlas-pin atlas-pin--${tone}`}>
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}
