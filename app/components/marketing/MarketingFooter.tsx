import { Link } from "react-router";
import { ADD_INTERCHAT_URL, SUPPORT_SERVER_URL } from "./constants";

export function MarketingFooter() {
  return (
    <footer className="atlas-footer">
      <div className="atlas-container atlas-footer__inner">
        <a className="atlas-brand" href="#top" aria-label="InterChat home">
          <img src="/images/interchat.png" alt="" width="32" height="32" />
          <span>InterChat</span>
        </a>
        <nav aria-label="Footer navigation">
          <a href="#hubs">Hubs</a><a href="#calls">Calls</a><a href="#safety">Safety</a>
          <Link to="/dashboard">Dashboard</Link>
          <a href={SUPPORT_SERVER_URL}>Support server</a>
          <a href={ADD_INTERCHAT_URL}>Add InterChat</a>
        </nav>
        <p>© {new Date().getFullYear()} InterChat. Built for communities across Discord.</p>
      </div>
    </footer>
  );
}
