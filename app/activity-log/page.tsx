"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Activity } from "./types";
import { activities as staticActivities } from "./data";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";
export default function ActivityLogIndex() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 高速検索・絞り込み用ステート
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("すべて");

  const categories = ["すべて", "NEWS", "PROJECT", "DIALOGUE"];

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false });

      if (error) {
        setActivities(staticActivities);
      } else if (data) {
        const dbData = data.map((item: any) => ({
          ...item,
          hasDetail: item.has_detail, 
          id: item.slug
        }));
        const combined = [...dbData, ...staticActivities].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setActivities(combined);
      } else {
        setActivities(staticActivities);
      }
      setLoading(false);
    };
    fetchActivities();
  }, []);

  // クライアントサイドでの超高速リアルタイム絞り込み処理
  const filteredActivities = activities.filter((act) => {
    const matchesCategory = activeCategory === "すべて" || act.category === activeCategory;
    const matchesSearch = 
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (act.summary && act.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="page-fade-in" style={{ background: "var(--background)" }}>
      <Navbar />

      <header className="concept-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: "140px 20px 40px" }}>
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="eyebrow">ACTIVITY LOG</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", margin: "0 auto", fontWeight: 900 }}>活動の記録</h1>
          <p style={{ color: "var(--muted)", marginTop: "16px" }}>Nexusの歩みを、ここに残していきます。</p>
        </div>
      </header>

      {/* 検索バー ＆ カテゴリタブセクション */}
      <section style={{ maxWidth: "800px", margin: "0 auto 40px", padding: "0 20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--warm-white)", padding: "24px", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
          
          {/* リアルタイムキーワード検索 */}
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              placeholder="キーワードで検索（例: 会議, 開発...）" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "16px 20px", borderRadius: "14px",
                border: "1px solid var(--border)", outline: "none", fontSize: "0.95rem",
                boxSizing: "border-box", transition: "all 0.3s ease",
                background: "#fcfcfa"
              }}
            />
          </div>

          {/* カテゴリ切り替えボタンタブ */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 20px", borderRadius: "99px",
                  fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
                  transition: "all 0.25s ease",
                  background: activeCategory === cat ? "var(--accent)" : "transparent",
                  color: activeCategory === cat ? "white" : "var(--ink-soft)",
                  border: activeCategory === cat ? "1px solid var(--accent)" : "1px solid var(--border)"
                }}
              >
                {cat === "すべて" ? "🌐 すべて" : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="concept-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)" }}>読み込み中...</div>
        ) : filteredActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted)", background: "var(--warm-white)", borderRadius: "24px", border: "1px dashed var(--border)" }}>
            🔍 条件に一致する活動記録が見つかりませんでした。
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "80px" }}>
            {filteredActivities.map((item, index) => {
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
                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
                  {item.hasDetail ? (
                    <Link href={`/activity-log/${item.id}`} style={{ textDecoration: "none" }}>{CardContent}</Link>
                  ) : (
                    CardContent
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

