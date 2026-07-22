import { useState } from "react";
import { Link } from "react-router";
import { ADD_INTERCHAT_URL } from "./marketing/constants";

const NAV_ITEMS = [
  ["Hubs", "#hubs"],
  ["Calls", "#calls"],
  ["Control", "#control"],
  ["Safety", "#safety"],
] as const;

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="atlas-header">
      <div className="atlas-header__shell">
        <a className="atlas-brand" href="#top" aria-label="InterChat home" onClick={closeMenu}>
          <img src="/images/interchat.png" alt="" width="34" height="34" />
          <span>InterChat</span>
        </a>

        <button
          className="atlas-menu-button"
          type="button"
          aria-expanded={isOpen}
          aria-controls="atlas-navigation"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span />
          <span />
        </button>

        <div className="atlas-header__nav" id="atlas-navigation" data-open={isOpen}>
          <nav aria-label="Main navigation">
            {NAV_ITEMS.map(([label, href]) => (
              <a key={href} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </nav>
          <div className="atlas-header__actions">
            <Link className="atlas-header__dashboard" to="/dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            <a className="atlas-button atlas-button--small" href={ADD_INTERCHAT_URL} onClick={closeMenu}>
              Add InterChat
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
