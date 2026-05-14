"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { Activity } from "./types";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function ActivityLogIndex() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. データをSupabaseから取得
  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false }); // 日付の新しい順

      if (error) {
        console.error("Error fetching activities:", error);
      } else if (data) {
        // DBの列名（has_detail）をプログラム側の名前（hasDetail）に変換してセット
        const formattedData = data.map((item: any) => ({
          ...item,
          hasDetail: item.has_detail, 
          id: item.slug // IDとしてslugを使用（URLを綺麗にするため）
        }));
        setActivities(formattedData);
      }
      setLoading(false);
    };

    fetchActivities();
  }, []);

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
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0", color: "var(--muted)" }}>読み込み中...</div>
        ) : activities.length > 0 ? (
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
                <div style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: item.hasDetail ? "var(--accent)" : "var(--muted)", background: item.hasDetail ? "var(--accent-pale)" : "transparent", padding: "4px 12px", borderRadius: "999px", border: item.hasDetail ? "none" : "1px solid var(--border)" }}>{item.category}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{item.date}</span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--ink)", marginBottom: "8px", fontWeight: 700 }}>{item.title}</h3>
                  <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{item.summary}</p>
                  {item.hasDetail && <div style={{ marginTop: "16px", color: "var(--accent)", fontWeight: 700, fontSize: "0.9rem" }}>詳細をチェックする →</div>}
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
        ) : (
          <div style={{ textAlign: "center", padding: "100px 0", color: "var(--muted)" }}>活動記録はまだありません。</div>
        )}
      </section>
    </main>
  );
}
