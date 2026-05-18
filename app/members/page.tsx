"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Member {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  field: string;
  message: string;
  photo_url: string;
  skills: string; 
  github_url: string;
  portfolio_url: string;
  order_index: number;
}

const logClickEvent = async (type: string, name: string) => {
  try {
    await supabase.from("click_events").insert([{ event_type: type, target_name: name }]);
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "36px 32px", 
        background: "var(--warm-white)", 
        border: hover ? "1px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "24px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "16px",
        cursor: "pointer",
        transform: hover ? "translateY(-8px)" : "translateY(0px)",
        boxShadow: hover ? "0 15px 30px rgba(0,0,0,0.04)" : "0 4px 15px rgba(0,0,0,0.01)",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--accent-pale)", border: "2px solid var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", color: "var(--accent)", overflow: "hidden" }}>
        {member.photo_url ? <img src={member.photo_url} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} alt={member.name} /> : "👤"}
      </div>
      <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)", background: "var(--accent-pale)", padding: "4px 12px", borderRadius: "999px", alignSelf: "flex-start" }}>
        {member.role}
      </span>
      <div>
        <h2 style={{ fontSize: "1.30rem", fontWeight: 900, margin: "0 0 4px", color: "var(--ink)" }}>{member.name}</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>{member.affiliation}</p>
      </div>
      <div style={{ padding: "12px 16px", background: "var(--cream)", borderRadius: "10px" }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--accent)", margin: "0 0 4px", textTransform: "uppercase" }}>Field</p>
        <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0 }}>{member.field}</p>
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // --- フィルタリング用状態定義 ---
  const [selectedField, setSelectedField] = useState("すべて");
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  const cacheKey = "nexus_members_cache";

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setMembers(parsed);
      extractFields(parsed);
      setLoading(false);
    }

    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('is_published', true)
          .eq('is_deleted', false)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        setMembers(data || []);
        extractFields(data || []);
        localStorage.setItem(cacheKey, JSON.stringify(data || []));
      } catch (err) {
        console.error("メンバーデータの取得に失敗しました:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const extractFields = (memberList: Member[]) => {
    // メンバーから重複のない専門分野（field）を抽出して配列化
    const uniqueFields = Array.from(new Set(memberList.map(m => m.field).filter(Boolean)));
    setAvailableFields(["すべて", ...uniqueFields]);
  };

  // 選択された分野でフィルタリングされたリスト
  const filteredMembers = members.filter(m => {
    if (selectedField === "すべて") return true;
    return m.field === selectedField;
  });

  return (
    <main className="page-fade-in" style={{ background: "var(--warm-white)", minHeight: "100vh" }}>
      <Navbar />

      <header className="concept-header" style={{ padding: "120px 24px 60px", textAlign: "center" }}>
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center", display: "flex", gap: "6px" }}>MEMBERS</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "16px auto 0", textAlign: "center", fontWeight: 900 }}>運営メンバー</h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>Nexusをつくっている学生たちです。カードをクリックして詳細なポートフォリオを見ることができます。</p>
        </div>
      </header>

      <section className="concept-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px" }}>
        
        {/* 🏷️ 動的スキル・専門タグフィルター */}
        {!loading && availableFields.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "48px" }}>
            {availableFields.map(field => (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                style={{
                  background: selectedField === field ? "var(--accent)" : "var(--warm-white)",
                  color: selectedField === field ? "var(--warm-white)" : "var(--ink-soft)",
                  border: "1px solid var(--border)",
                  padding: "8px 22px",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: selectedField === field ? "0 4px 12px rgba(165, 151, 255, 0.25)" : "none"
                }}
              >
                {field}
              </button>
            ))}
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "80px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ padding: "36px 32px", background: "var(--warm-white)", border: "1px solid var(--border)", borderRadius: "20px", height: "260px" }} />
            ))}
          </div>
        )}

        {/* メンバー一覧グリッド */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "80px" }}>
            {filteredMembers.map((member) => (
              <div key={member.id} style={{ animation: "fadeIn 0.4s ease forwards" }}>
                <MemberCard 
                  member={member} 
                  onClick={() => setSelectedMember(member)} 
                />
              </div>
            ))}
          </div>
        )}

        <div className="animate-slide-up" style={{ textAlign: "center", padding: "48px 32px", background: "var(--cream)", borderRadius: "20px", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.5rem", margin: "0 0 12px", fontWeight: 800 }}>運営に興味がありますか？</h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: 1.8 }}>Nexusの運営メンバーは随時募集中です。コミュニティを一緒に育てていきたい方は、お気軽にご連絡ください。</p>
          <Link className="button button-ghost" href="/contact">お問い合わせから連絡する →</Link>
        </div>
      </section>

      {/* 🔮 グラスモーフィズム詳細モーダル */}
      {selectedMember && (
        <div 
          onClick={() => setSelectedMember(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(20, 20, 20, 0.4)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
            padding: "20px", boxSizing: "border-box", animation: "fadeIn 0.25s ease"
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--warm-white)", borderRadius: "32px", width: "100%", maxWidth: "600px",
              padding: "40px", boxSizing: "border-box", border: "1px solid var(--border)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.15)", position: "relative",
              animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <button 
              onClick={() => setSelectedMember(null)}
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

            <div style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "32px", flexWrap: "wrap" }}>
              <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "var(--accent-pale)", border: "2px solid var(--accent-light)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                {selectedMember.photo_url ? <img src={selectedMember.photo_url} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} alt={selectedMember.name} /> : "👤"}
              </div>
              <div>
                <span style={{ display: "inline-block", fontSize: "0.7rem", fontWeight: 800, color: "var(--accent)", background: "var(--accent-pale)", padding: "4px 12px", borderRadius: "999px", marginBottom: "8px" }}>
                  {selectedMember.role}
                </span>
                <h2 style={{ fontSize: "1.8rem", fontWeight: 900, margin: "0 0 4px", color: "var(--ink)", letterSpacing: "-0.01em" }}>{selectedMember.name}</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--muted)", margin: 0 }}>{selectedMember.affiliation}</p>
              </div>
            </div>

            <blockquote style={{ 
              fontSize: "1.05rem", color: "var(--ink-soft)", margin: "0 0 28px", 
              lineHeight: 1.8, fontStyle: "italic", borderLeft: "4px solid var(--accent)", 
              paddingLeft: "16px", background: "var(--cream)", padding: "16px 20px", borderRadius: "0 16px 16px 0"
            }}>
              &ldquo;{selectedMember.message}&rdquo;
            </blockquote>

            {selectedMember.skills && (
              <div style={{ marginBottom: "28px" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>Specialized Skills</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedMember.skills.split(",").map(skill => (
                    <span key={skill} style={{ background: "var(--accent-pale)", color: "var(--accent)", fontSize: "0.78rem", padding: "6px 12px", borderRadius: "10px", fontWeight: 800 }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(selectedMember.github_url || selectedMember.portfolio_url) && (
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: "10px", letterSpacing: "0.05em" }}>Links & Network</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  {selectedMember.github_url && (
                    <a 
                      href={selectedMember.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => logClickEvent('member_github', selectedMember.name)}
                      style={{ 
                        display: "inline-flex", alignItems: "center", gap: "8px", 
                        background: "var(--ink)", color: "var(--warm-white)", padding: "10px 18px", 
                        borderRadius: "12px", fontSize: "0.85rem", fontWeight: 800, 
                        textDecoration: "none", transition: "all 0.2s" 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--ink)"; }}
                    >
                      🐙 GitHub Profile
                    </a>
                  )}
                  {selectedMember.portfolio_url && (
                    <a 
                      href={selectedMember.portfolio_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => logClickEvent('member_portfolio', selectedMember.name)}
                      style={{ 
                        display: "inline-flex", alignItems: "center", gap: "8px", 
                        background: "var(--warm-white)", color: "var(--ink)", border: "1px solid var(--border)", 
                        padding: "10px 18px", borderRadius: "12px", fontSize: "0.85rem", 
                        fontWeight: 800, textDecoration: "none", transition: "all 0.2s" 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink)"; }}
                    >
                      🌐 Portfolio Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />

      <Footer />
    </main>
  );
}

