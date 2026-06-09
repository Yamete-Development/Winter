import { Link } from "react-router";

export function MarketingHeader() {
  return (
    <header style={{ maxWidth: 1200, margin: "0 auto", padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: "1.25rem", color: "#ffffff", letterSpacing: "-0.02em" }}>
        <img src="/images/interchat.png" alt="InterChat" style={{ width: 36, height: 36 }} />
        INTERCHAT
      </div>
      
      <nav style={{ gap: 32, fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.8)" }} className="hidden md:flex">
        <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>Product</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>Enterprise</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>Education</a>
        <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>Pricing</a>
      </nav>
      
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <Link to="/auth/discord" style={{ background: "rgba(88, 101, 242, 0.15)", border: "1px solid rgba(88, 101, 242, 0.3)", color: "#ffffff", textDecoration: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 500, fontSize: "0.95rem", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(88, 101, 242, 0.15)" }}>
          <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.09,53,91.04,65.69,84.69,65.69Z"/>
          </svg>
          Login with Discord
        </Link>
      </div>
    </header>
  );
}
