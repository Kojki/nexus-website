import React from "react";
import { S } from "./SharedUI";

interface Props {
  analytics: {
    totalViews: number;
    todayViews: number;
    popularPages: any[];
  };
  logs: any[];
}

export function SystemDashboardTab({ analytics, logs }: Props) {
  return (
    <div>
      <h2 style={S.sectionTitle}>システム情報 ＆ アクセス解析</h2>
      
      {/* 1. アクセス数概要カード */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" }}>
        
        <div style={{ background: "white", padding: "28px", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>TODAY'S VIEWS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--accent)" }}>{analytics.todayViews}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>PV</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#888", margin: "12px 0 0" }}>本日一般公開サイトに訪れたPV数です</p>
        </div>

        <div style={{ background: "white", padding: "28px", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 15px rgba(0,0,0,0.01)" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "8px" }}>TOTAL VIEWS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#111" }}>{analytics.totalViews}</span>
            <span style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>PV</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#888", margin: "12px 0 0" }}>計測開始からの累計PV数です</p>
        </div>

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        
        {/* 2. 人気ページランキング */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🔥 人気ページランキング
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {analytics.popularPages.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>まだアクセスデータが蓄積されていません。</div>
            ) : (
              analytics.popularPages.map((p, idx) => (
                <div key={p.path} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: idx !== analytics.popularPages.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <span style={{ background: idx === 0 ? "var(--accent-pale)" : "#eee", color: idx === 0 ? "var(--accent)" : "#666", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 900 }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: "0.9rem", fontFamily: "monospace", color: "#333" }}>{p.path}</span>
                  </div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{p.views} PV</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. セキュリティ操作履歴 (監査ログタイムライン) */}
        <div style={{ background: "white", padding: "32px", borderRadius: "24px", border: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 900, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            🛡️ セキュリティ監査ログ (操作履歴)
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
            {logs.length === 0 ? (
              <div style={{ color: "#aaa", fontSize: "0.85rem", textAlign: "center", padding: "20px" }}>操作履歴はまだありません。</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} style={{ display: "flex", flexDirection: "column", gap: "4px", paddingBottom: "12px", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#888" }}>
                    <span style={{ fontWeight: 800, color: "var(--accent)" }}>{log.actor_email}</span>
                    <span>{new Date(log.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#333", lineHeight: 1.5 }}>
                    <span style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 900, marginRight: "8px", textTransform: "uppercase" }}>
                      {log.action}
                    </span>
                    {log.details}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
