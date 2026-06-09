import type { Route } from "./+types/index";
import { Link } from "react-router";
import { MarketingHeader } from "../../components/MarketingHeader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "InterChat - Connect your servers" },
    { name: "description", content: "Chat across servers in real time. Call a random community live." },
  ];
}

export default function MarketingIndex() {
  return (
    <div style={{ width: "100%", backgroundColor: "#000000", color: "#ffffff", fontFamily: "'Inter', system-ui, sans-serif", overflowX: "hidden", position: "relative", minHeight: "100vh" }}>
      
      {/* Cinematic Vibrant Background Image */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
         <div style={{ width: "100%", height: "100%", backgroundImage: "url('https://images.unsplash.com/photo-1589750367974-4875f519d641?q=80&w=3184&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center top", backgroundRepeat: "no-repeat", opacity: 0.9 }}></div>
      </div>

      {/* Dark vignette overlay for white text readability */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100vh", background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)", pointerEvents: "none", zIndex: 1 }}></div>
      
      <style>{`
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: var(--card-opacity, 1);
            transform: scale(1) translateY(0);
          }
        }

        .hero-card-left {
          --card-opacity: 1;
          position: absolute;
          width: 340px;
          z-index: 5;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          left: 5%;
          top: 160px;
          opacity: 0;
          animation: heroFadeIn 0.3s cubic-bezier(0.191, 0.703, 0.704, 0.952) forwards;
          animation-delay: 0.2s;
        }
        .hero-card-right {
          --card-opacity: 1;
          position: absolute;
          width: 340px;
          z-index: 5;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          right: 5%;
          top: 220px;
          opacity: 0;
          animation: heroFadeIn 0.3s cubic-bezier(0.191, 0.703, 0.704, 0.952) forwards;
          animation-delay: 0.4s;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 540;
          color: #ffffff;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          max-width: 500px;
        }

        @media (max-width: 1150px) {
          .hero-card-left {
            --card-opacity: 0.5;
            left: -40px;
            top: 380px;
            transform: scale(0.9);
            pointer-events: none;
          }
          .hero-card-right {
            --card-opacity: 0.5;
            right: -40px;
            top: 440px;
            transform: scale(0.9);
            pointer-events: none;
          }
        }

        @media (max-width: 860px) {
          .hero-card-left {
            --card-opacity: 0.15;
            left: -120px;
          }
          .hero-card-right {
            --card-opacity: 0.15;
            right: -120px;
          }
        }

        @media (max-width: 640px) {
          .hero-card-left, .hero-card-right {
            display: none;
          }
          .hero-title {
            font-size: 36px !important;
          }
        }
      `}</style>

      {/* Header */}
      <MarketingHeader />

      {/* Hero Section */}
      <main style={{ paddingTop: 60, paddingBottom: 120, position: "relative", zIndex: 10 }}>
        
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10 }}>

          <h1 className="hero-title">
            Your server was never meant to be an island.
          </h1>
          
          <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, fontWeight: 400, marginBottom: 40, maxWidth: 600 }}>
            Chat across servers in real time. Call a random community live. One bot for every community.
          </p>
          
          <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
            <a href="#" style={{ background: "rgba(30, 30, 40, 0.7)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)", color: "white", textDecoration: "none", padding: "6px 6px 6px 24px", borderRadius: 12, fontWeight: 500, fontSize: "1.05rem", display: "inline-flex", alignItems: "center", gap: 16, transition: "all 0.2s", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)" }}>
              Invite to your Server
              <div style={{ background: "linear-gradient(135deg, #8b5cf6, #6352be)", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(99, 82, 190, 0.5)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </div>
            </a>
          </div>
          
        </div>
        
        {/* Left Floating Card: Hubs (Multi-server chat) */}
        <div className="hero-card-left" style={{ background: "linear-gradient(210deg, rgba(255,255,255,0.15) 0%, transparent 30%), linear-gradient(180deg, rgba(30,30,40,0.3) 0%, rgba(30,30,40,0.2) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 16, padding: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #a78bfa, #6352be)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg></div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}># global-lounge</div>
            </div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#a78bfa", background: "rgba(167, 139, 250, 0.15)", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(167, 139, 250, 0.3)" }}>Connected Hub</div>
          </div>
          
          {/* Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Msg 1 */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Jake') center/cover", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "white", fontWeight: 500, fontSize: "0.85rem" }}>Jake</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>via Gaming Lounge</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>anyone got good Spotify playlists for coding?</p>
              </div>
            </div>
            
            {/* Msg 2 */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Mia') center/cover", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "white", fontWeight: 500, fontSize: "0.85rem" }}>Mia</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>via Chill Zone</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>lofi hip hop radio is the only correct answer here 🎧</p>
              </div>
            </div>
            
            {/* Msg 3 */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Tyler') center/cover", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "white", fontWeight: 500, fontSize: "0.85rem" }}>Tyler</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem" }}>via The Boys</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>i literally just listen to video game OSTs on loop 😂</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Floating Card: Userphone (1-1 calls) */}
        <div className="hero-card-right" style={{ background: "linear-gradient(210deg, rgba(255,255,255,0.15) 0%, transparent 30%), linear-gradient(180deg, rgba(30,30,40,0.3) 0%, rgba(30,30,40,0.2) 100%)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 16, padding: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "white" }}>Userphone Call</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(34, 197, 94, 0.15)", padding: "4px 8px", borderRadius: 12, border: "1px solid rgba(34, 197, 94, 0.3)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#4ade80" }}>Connected</div>
            </div>
          </div>
          
          {/* Call Status / Info */}
          <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: 12, marginBottom: 16, textAlign: "center" }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>You are now connected to <strong>Midnight Cafe</strong></p>
            <p style={{ margin: "4px 0 0 0", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Say hi and be nice! 👋</p>
          </div>
          
          {/* Messages */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
            {/* Msg 1 */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Sam') center/cover", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "white", fontWeight: 500, fontSize: "0.8rem" }}>Sam</span>
                  <span style={{ color: "#ef4444", fontSize: "0.65rem", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "1px 4px", borderRadius: 4 }}>Remote</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>hello?? is this thing working</p>
              </div>
            </div>
            
            {/* Msg 2 */}
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=You') center/cover", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.1)" }}></div>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                  <span style={{ color: "white", fontWeight: 500, fontSize: "0.8rem" }}>You</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", lineHeight: 1.4, margin: 0 }}>yeah we hear you loud and clear 🎤</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: 8, color: "white", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Skip</button>
            <button style={{ flex: 1, background: "rgba(239, 68, 68, 0.2)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: 6, padding: 8, color: "#fca5a5", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>Hang Up</button>
          </div>
        </div>
        
        {/* Centered Placeholder instead of Mockup */}
        <div style={{ width: "calc(100% - 48px)", maxWidth: 520, margin: "60px auto 0", position: "relative", height: 420, zIndex: 20 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 24, overflow: "hidden", zIndex: 2, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #6352be)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 style={{ color: "white", margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Web Dashboard</h3>
            <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: "0.9rem" }}>Manage your server connections here</p>
            <Link to="/dashboard" style={{ marginTop: 12, background: "white", color: "black", padding: "8px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>Open Dashboard</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
