"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// 📝 アプリ共通のマークダウンレンダラーをインポート
import { renderMarkdown } from "@/lib/markdown";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string;
  roles_needed: string;
  status: 'open' | 'closed';
  created_at: string;
}

const logClickEvent = async (type: string, name: string) => {
  try {
    await supabase.from("click_events").insert([{ event_type: type, target_name: name }]);
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};

// ==========================================
// 💡 折りたたみ ＆ マークダウン対応 プロジェクトカード
// ==========================================
function ProjectCard({ proj, onApply }: { proj: Project; onApply: (title: string) => void }) {
  const [hover, setHover] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // 個別の展開ステート

  const isLong = proj.description && proj.description.length > 120;

  return (
    <div 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        background: "var(--warm-white)", 
        borderRadius: "24px", 
        border: hover ? "1px solid var(--accent)" : "1px solid var(--border)", 
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <span style={{ 
            fontSize: "0.7rem", 
            fontWeight: 800, 
            padding: "4px 10px", 
            borderRadius: "6px",
            background: proj.status === 'open' ? "var(--accent-pale)" : "var(--border)",
            color: proj.status === 'open' ? "var(--accent)" : "var(--muted)",
            letterSpacing: "0.05em"
          }}>
            {proj.status === 'open' ? "🟢 メンバー募集中" : "🔴 募集終了"}
          </span>
        </div>

        <h3 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "16px", color: "var(--ink)", lineHeight: 1.4 }}>
          {proj.title}
        </h3>

        {/* 📝 プロジェクト詳細（タップ展開 ＆ マークダウン適用） */}
        <div style={{ marginBottom: "24px", transition: "all 0.3s ease" }}>
          {isExpanded ? (
            <div style={{ fontSize: "0.92rem", lineHeight: 1.7, animation: "fadeIn 0.2s ease" }}>
              {renderMarkdown(proj.description)}
              {isLong && (
                <button 
                  onClick={() => setIsExpanded(false)}
                  style={{
                    background: "none", border: "none", color: "var(--accent)",
                    fontSize: "0.8rem", fontWeight: 800, cursor: "pointer",
                    padding: "12px 0 0", display: "flex", alignItems: "center", gap: "4px"
                  }}
                >
                  ▲ 閉じる (折りたたむ)
                </button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: "0.9rem", color: "var(--ink-soft)", lineHeight: 1.6 }}>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {isLong ? `${proj.description.slice(0, 120)}...` : proj.description}
              </p>
              {isLong && (
                <button 
                  onClick={() => setIsExpanded(true)}
                  style={{
                    background: "none", border: "none", color: "var(--accent)",
                    fontSize: "0.82rem", fontWeight: 800, cursor: "pointer",
                    padding: "8px 0 0", display: "flex", alignItems: "center", gap: "4px"
                  }}
                >
                  ▼ 続きを読む ➔
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        {proj.tech_stack && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Tech Stack</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {proj.tech_stack.split(",").map(t => (
                <span key={t} style={{ background: "var(--cream)", color: "var(--accent)", fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px", fontWeight: 700 }}>
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {proj.roles_needed && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Looking For</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {proj.roles_needed.split(",").map(r => (
                <span key={r} style={{ border: "1px solid var(--border)", color: "var(--accent)", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "8px", fontWeight: 700 }}>
                  {r.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {proj.status === 'open' ? (
          <button 
            onClick={() => onApply(proj.title)}
            style={{ 
              width: "100%",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              background: "var(--ink)", 
              color: "var(--warm-white)", 
              padding: "12px 24px", 
              borderRadius: "14px", 
              fontSize: "0.85rem", 
              fontWeight: 800, 
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--ink)"; }}
          >
            このプロジェクトに参画申請する ➔
          </button>
        ) : (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            background: "var(--border)", 
            color: "var(--muted)", 
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  // --- ドロワー（スライドパネル）状態管理 ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [targetProjectTitle, setTargetProjectTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    content: "",
  });

  const cacheKey = "nexus_projects_cache";

  useEffect(() => {
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
          .eq("is_deleted", false)
          .order("order_index", { ascending: true });
        
        if (error) throw error;
        setProjects(data || []);
        localStorage.setItem(cacheKey, JSON.stringify(data || []));
      } catch (err) {
        console.error("プロジェクトデータの取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const openApplyDrawer = (projectTitle: string) => {
    setTargetProjectTitle(projectTitle);
    setFormData({
      name: "",
      organization: "",
      email: "",
      content: `【参画希望プロジェクト】\n${projectTitle}\n\n【志望理由 / スキルなど】\n`,
    });
    setIsSuccess(false);
    setIsDrawerOpen(true);
    logClickEvent('project_drawer_open', projectTitle);
  };

  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dbPayload = {
        name: formData.name,
        organization: formData.organization,
        email: formData.email,
        category: "プロジェクト参画希望",
        content: formData.content,
      };

      const { error } = await supabase.from("inquiries").insert([dbPayload]);
      if (error) throw error;

      try {
        await supabase.functions.invoke("contact-slack", {
          body: dbPayload,
        });
      } catch (slackErr) {
        console.error("Slack通知に失敗しました:", slackErr);
      }

      setIsSuccess(true);
    } catch (error) {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (filter === 'open') return p.status === 'open';
    if (filter === 'closed') return p.status === 'closed';
    return true;
  });

  return (
    <div style={{ background: "var(--warm-white)", minHeight: "100vh", color: "var(--ink)", fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}>
      <Navbar />

      <section style={{ 
        position: "relative", padding: "180px 24px 80px", 
        background: "radial-gradient(circle at top right, rgba(230, 92, 0, 0.05), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 0, 0, 0.03), transparent 50%)",
        borderBottom: "1px solid var(--border)", textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span style={{ 
            background: "var(--accent-pale)", color: "var(--accent)", 
            padding: "6px 14px", borderRadius: "99px", fontSize: "0.75rem", 
            fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" 
          }}>
            Co-Creation Board
          </span>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 900, marginTop: "16px", marginBottom: "20px" }}>
            🚀 Nexus 共創プロジェクト
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.7, maxWidth: "600px", margin: "0 auto" }}>
            意欲ある学生たちの情熱や専門性を融合させ、新しい価値を創造するプロジェクトが多数稼働中。あなたのスキルや興味を活かし、共創を加速させましょう！
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px 120px" }}>
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
                background: filter === btn.id ? "var(--ink)" : "var(--warm-white)",
                color: filter === btn.id ? "var(--warm-white)" : "var(--ink-soft)",
                border: "1px solid var(--border)",
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

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "var(--warm-white)", height: "300px", borderRadius: "24px", border: "1px solid var(--border)", padding: "32px", boxSizing: "border-box" }}>
                <div style={{ background: "var(--border)", width: "40%", height: "20px", borderRadius: "4px", marginBottom: "16px" }} />
                <div style={{ background: "var(--border)", width: "80%", height: "32px", borderRadius: "6px", marginBottom: "20px" }} />
                <div style={{ background: "var(--border)", width: "100%", height: "80px", borderRadius: "6px" }} />
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", background: "var(--warm-white)", borderRadius: "24px", border: "1px dashed var(--border)" }}>
            <span style={{ fontSize: "2.5rem" }}>👀</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "16px", color: "var(--ink-soft)" }}>該当するプロジェクトが見つかりません。</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "8px" }}>現在、新しいプロジェクトを準備中です。続報をお楽しみに！</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "32px" }}>
            {filteredProjects.map((proj) => (
              <ProjectCard key={proj.id} proj={proj} onApply={openApplyDrawer} />
            ))}
          </div>
        )}
      </main>

      {/* 🔮 プレミアム・スライドドロワーUI */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(10, 8, 15, 0.4)", zIndex: 99999,
            display: "flex", justifyContent: "flex-end",
            animation: "fadeInBlur 0.3s ease forwards"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: "500px", height: "100%", background: "var(--warm-white)",
              borderLeft: "1px solid var(--border)", padding: "48px 36px", boxSizing: "border-box",
              boxShadow: "-15px 0 45px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column",
              position: "relative", overflowY: "auto",
              animation: "slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            {/* 閉じるボタン */}
            <button 
              onClick={() => setIsDrawerOpen(false)}
              style={{
                position: "absolute", top: "24px", right: "24px", background: "var(--accent-pale)",
                border: "none", width: "36px", height: "36px", borderRadius: "50%",
                fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", color: "var(--accent)", transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "var(--warm-white)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-pale)"; e.currentTarget.style.color = "var(--accent)"; }}
            >
              ×
            </button>

            {isSuccess ? (
              <div style={{ textAlign: "center", margin: "auto 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "64px", height: "64px", background: "var(--accent-pale)", color: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>✓</div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 900 }}>申請を受け付けました</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>プロジェクト「{targetProjectTitle}」への参画申請が送信されました。運営メンバーが内容を確認し、追ってSlackまたはメールにてご連絡いたします。</p>
                <button className="button button-dark" onClick={() => setIsDrawerOpen(false)} style={{ width: "100%", marginTop: "16px" }}>閉じる</button>
              </div>
            ) : (
              <form onSubmit={handleDrawerSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", background: "var(--accent-pale)", padding: "4px 12px", borderRadius: "999px" }}>
                    Project Co-Creation
                  </span>
                  <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "16px 0 8px" }}>参画申請フォーム</h2>
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem", margin: "0 0 32px" }}>
                    新しいプロジェクトの立ち上げや共創に参加しましょう。
                  </p>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>お名前 <span className="required-badge">必須</span></label>
                    <input 
                      type="text" required className="form-input" placeholder="山田 太郎"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>所属・学校名</label>
                    <input 
                      type="text" className="form-input" placeholder="〇〇大学 〇〇学部"
                      value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>メールアドレス <span className="required-badge">必須</span></label>
                    <input 
                      type="email" required className="form-input" placeholder="example@nexus-connect.jp"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "24px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, display: "block", marginBottom: "8px" }}>メッセージ・自己紹介 <span className="required-badge">必須</span></label>
                    <textarea 
                      required className="form-textarea" style={{ minHeight: "140px" }}
                      value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="button button-dark" style={{ width: "100%", marginTop: "16px" }} disabled={isSubmitting}>
                  {isSubmitting ? "送信中..." : "この内容で参画を申請する"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
