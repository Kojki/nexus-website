import Image from "next/image";
import Link from "next/link";
import { activities } from "./data";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function ActivityLogIndex() {
  return (
    <main>
      <nav className="site-nav">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Logo" width={34} height={34} /> Nexus</Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>ACTIVITY LOG</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", textAlign: "center" }}>活動の記録</h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", textAlign: "center" }}>Nexusの歩みを、ここに残していきます。</p>
        </div>
      </header>

      <section className="concept-container">
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "80px" }}>
          {activities.map((item, index) => {
            const cardStyle: React.CSSProperties = {
              padding: "32px",
              borderRadius: "20px",
              background: "var(--warm-white)",
              border: item.hasDetail ? "2px solid var(--accent-light)" : "1px solid var(--border)",
              transition: "all 0.3s ease",
              cursor: item.hasDetail ? "pointer" : "default",
              position: "relative",
            };

            const CardContent = (
              <div 
                style={cardStyle}
                className={item.hasDetail ? "clickable-card" : ""}
                // インラインで簡単なホバー制御（より高度な場合はCSSファイル推奨）
                onMouseEnter={(e) => {
                  if (item.hasDetail) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(111, 101, 239, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.hasDetail) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 700, 
                    color: item.hasDetail ? "var(--accent)" : "var(--muted)",
                    background: item.hasDetail ? "var(--accent-pale)" : "transparent",
                    padding: "4px 12px",
                    borderRadius: "999px",
                    border: item.hasDetail ? "none" : "1px solid var(--border)"
                  }}>
                    {item.category}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{item.date}</span>
                </div>
                <h3 style={{ fontSize: "1.25rem", color: "var(--ink)", marginBottom: "8px", fontWeight: 700 }}>{item.title}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{item.summary}</p>
                {item.hasDetail && (
                  <div style={{ marginTop: "16px", color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>
                    詳細をチェックする →
                  </div>
                )}
              </div>
            );

            return (
              <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                {item.hasDetail ? (
                  <Link href={`/activity-log/${item.id}`} style={{ textDecoration: "none" }}>{CardContent}</Link>
                ) : (
                  CardContent
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
