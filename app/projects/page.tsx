"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  roles_needed: string;
  status: 'open' | 'closed';
  created_at: string;
}

// 📈 クリックイベント統計のログ記録用ヘルパー
const logClickEvent = async (type: string, name: string) => {
  try {
    await supabase.from("click_events").insert([{ event_type: type, target_name: name }]);
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};

// 🟢 ホバーアニメーションを完全保証するためのProjectCard子コンポーネント
function ProjectCard({ proj }: { proj: Project }) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        background: "white", 
        borderRadius: "24px", 
        border: hover ? "1px solid #e65c00" : "1px solid #ede8df", 
        padding: "32px", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
        boxShadow: hover ? "0 20px 40px rgba(0,0,0,0.04)" : "0 4px 20px rgba(0,0,0,0.01)",
        transform: hover ? "translateY(-8px)" : "translateY(0px)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        boxSizing: "border-box",
        height: "100%"
      }}
    >
      <div>
        {/* ステータスバッジ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ 
            fontSize: "0.7rem", 
            fontWeight: 800, 
            padding: "4px 10px", 
            borderRadius: "6px",
            background: proj.status === 'open' ? "#e6ffe6" : "#f5f5f5",
            color: proj.status === 'open' ? "#006600" : "#666",
            letterSpacing: "0.05em"
          }}>
            {proj.status === 'open' ? "🟢 メンバー募集中" : "🔴 募集終了"}
          </span>
        </div>

        <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "16px", color: "#111", lineHeight: 1.4 }}>
          {proj.title}
        </h3>

        {/* 説明文 */}
        <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.6, marginBottom: "24px", whiteSpace: "pre-wrap" }}>
          {proj.description}
        </p>
      </div>

      <div>
        {/* 使用技術スタック */}
        {proj.tech_stack && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#aaa", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Tech Stack</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {proj.tech_stack.split(",").map(t => (
                <span key={t} style={{ background: "#f5f3ef", color: "#666", fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px", fontWeight: 700 }}>
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 募集ロール */}
        {proj.roles_needed && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#aaa", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Looking For</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {proj.roles_needed.split(",").map(r => (
                <span key={r} style={{ border: "1px solid #e0dacb", color: "#e65c00", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "8px", fontWeight: 700 }}>
                  {r.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA 参加申請ボタン */}
        {proj.status === 'open' ? (
          <Link 
            href={`/contact?category=project&title=${encodeURIComponent(proj.title)}`}
            onClick={() => logClickEvent('project_apply', proj.title)} // 🚀 クリック時に統計データを蓄積
            style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: "#111", 
              color: "white", 
              padding: "12px 24px", 
              borderRadius: "14px", 
              fontSize: "0.85rem", 
              fontWeight: 800, 
              textDecoration: "none",
              transition: "all 0.2s ease",
              textAlign: "center"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e65c00"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#111"; }}
          >
            このプロジェクトに参画申請する ➔
          </Link>
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: "#f0f0f0", 
            color: "#999", 
            padding: "12px 24px", 
            borderRadius: "14px", 
            fontSize: "0.85rem", 
            fontWeight: 800, 
            textAlign: "center",
            cursor: "not-allowed"
          }}>
            募集を終了しました
          </div>
        )}
      </div>
    </div>
  );
}

// 🌐 メインのProjectsPage
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  const cacheKey = "nexus_projects_cache";

  useEffect(() => {
    // 🚀 1. キャッシュがあれば即時レンダリング (ロード時間0秒を達成)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setProjects(JSON.parse(cached));
      setLoading(false);
    }

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("is_deleted", false) // 🗑️ 論理削除されていないデータのみ取得
          .order("order_index", { ascending: true });
        
        if (error) throw error;
        setProjects(data || []);
        
        // 🚀 キャッシュを裏側で静かにアップデート
        localStorage.setItem(cacheKey, JSON.stringify(data || []));
      } catch (err) {
        console.error("プロジェクトデータの取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    if (filter === 'open') return p.status === 'open';
    if (filter === 'closed') return p.status === 'closed';
    return true;
  });

  return (
    <div style={{ background: "#fdfbf8", minHeight: "100vh", color: "#1a1a1a", fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      {/* ヒーローヘッダー */}
      <section style={{ 
        position: "relative", padding: "120px 24px 80px", 
        background: "radial-gradient(circle at top right, rgba(230, 92, 0, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.03), transparent 50%)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)", textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ 
            background: "rgba(230, 92, 0, 0.08)", color: "#e65c00", 
            padding: "6px 14px", borderRadius: "99px", fontSize: "0.75rem", 
            fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" 
          }}>
            Co-Creation Board
          </span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 900, marginTop: "16px", marginBottom: "20px", color: "#111" }}>
            🚀 Nexus 共創プロジェクト
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto" }}>
            意欲ある学生たちの情熱や専門性を融合させ、新しい価値を創造するプロジェクトが多数稼働中。あなたのスキルや興味を活かし、共創を加速させましょう！
          </p>
        </div>
      </section>

      {/* コンテンツエリア */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 120px" }}>
        
        {/* フィルター用タブ */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "48px" }}>
          {[
            { id: 'all', label: 'すべてのプロジェクト' },
            { id: 'open', label: '🟢 メンバー募集中' },
            { id: 'closed', label: '🔴 募集終了' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              style={{
                background: filter === btn.id ? "#111" : "white",
                color: filter === btn.id ? "white" : "#555",
                border: "1px solid",
                borderColor: filter === btn.id ? "#111" : "#e0dacb",
                padding: "10px 24px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: filter === btn.id ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* スケルトンローディング表示 */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "white", height: "300px", borderRadius: "24px", border: "1px solid #ede8df", padding: "32px", boxSizing: "border-box" }}>
                <div style={{ background: "#eee", width: "40%", height: "20px", borderRadius: "4px", marginBottom: "16px" }} />
                <div style={{ background: "#eee", width: "80%", height: "32px", borderRadius: "6px", marginBottom: "20px" }} />
                <div style={{ background: "#eee", width: "100%", height: "80px", borderRadius: "6px" }} />
              </div>
            ))}
          </div>
        )}

        {/* 取得データの描画 */}
        {!loading && filteredProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "white", borderRadius: "24px", border: "1px dashed #e0dacb" }}>
            <span style={{ fontSize: "2.5rem" }}>👀</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "16px", color: "#555" }}>該当するプロジェクトが見つかりません。</h3>
            <p style={{ fontSize: "0.85rem", color: "#999", marginTop: "8px" }}>現在、新しいプロジェクトを準備中です。続報をお楽しみに！</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
            {filteredProjects.map((proj) => (
              <ProjectCard key={proj.id} proj={proj} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
