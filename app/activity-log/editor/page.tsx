"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "inquiries";

export default function NexusDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // --- 1. 活動記録用状態 ---
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");

  // --- 2. サイトコンテンツ用状態 ---
  const [homeContent, setHomeContent] = useState<Record<string, string>>({});

  // --- 3. お問い合わせ用状態 ---
  const [inquiries, setInquiries] = useState<any[]>([]);

  // 初期データ取得
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // コンテンツ取得
      const { data: cData } = await supabase.from('site_content').select('*').eq('page_path', 'home');
      const cMap: Record<string, string> = {};
      cData?.forEach(item => cMap[item.content_key] = item.content_value);
      setHomeContent(cMap);

      // お問い合わせ取得
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(iData || []);

      setLoading(false);
    };
    init();
  }, [router]);

  // 活動記録の保存
  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, date, category, summary, content, slug, has_detail: !!content }]);
    if (error) alert("エラー: " + error.message);
    else { alert("記事を公開しました！"); setSlug(""); setTitle(""); setSummary(""); setContent(""); }
    setPublishing(false);
  };

  // サイトコンテンツの保存
  const handleUpdateContent = async (key: string, value: string) => {
    const { error } = await supabase.from('site_content').upsert({ page_path: 'home', content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    if (error) alert("更新エラー: " + error.message);
    else alert(`「${key}」を更新しました`);
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Nexus Dashboard Loading...</div>;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh", paddingBottom: "100px" }}>
      {/* Header */}
      <header style={{ background: "white", padding: "20px 5vw", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={30} height={30} />
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Nexus Management</h1>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <nav style={{ display: "flex", gap: "10px" }}>
            <TabBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>記事投稿</TabBtn>
            <TabBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>サイト編集</TabBtn>
            <TabBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</TabBtn>
          </nav>
          <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={{ fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" }}>ログアウト</button>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
        
        {/* Tab: Activity */}
        {activeTab === "activity" && (
          <section className="animate-fade-in">
            <h2 style={{ marginBottom: "24px" }}>新しい活動記録を投稿</h2>
            <div style={cardStyle}>
              <div style={formGrid}>
                <Field label="記事タイトル" value={title} onChange={setTitle} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <Field label="日付" value={date} onChange={setDate} />
                  <div style={groupStyle}>
                    <label style={labelStyle}>カテゴリ</label>
                    <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="NEWS">NEWS</option>
                      <option value="PROJECT">PROJECT</option>
                      <option value="DIALOGUE">DIALOGUE</option>
                      <option value="COMMUNITY">COMMUNITY</option>
                    </select>
                  </div>
                </div>
                <Field label="Slug (URL用の英数字)" value={slug} onChange={setSlug} placeholder="example-post-title" />
                <Field label="要約 (一覧に表示)" value={summary} onChange={setSummary} textarea />
                <Field label="本文 (詳細ページがある場合のみ)" value={content} onChange={setContent} textarea large />
                <button onClick={handlePublishActivity} disabled={publishing} style={primaryBtn}>
                  {publishing ? "公開中..." : "記事を公開する"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Tab: Content Editing */}
        {activeTab === "content" && (
          <section className="animate-fade-in">
            <h2 style={{ marginBottom: "8px" }}>トップページの編集</h2>
            <p style={{ color: "#888", marginBottom: "24px" }}>各項目を入力して「更新」を押すと、サイトの文言が即座に切り替わります。</p>
            <div style={cardStyle}>
              <ContentField label="ヒーロー見出し" k="hero_title" val={homeContent.hero_title} onSave={handleUpdateContent} />
              <ContentField label="ヒーロー紹介文" k="hero_copy" val={homeContent.hero_copy} onSave={handleUpdateContent} textarea />
              <div style={{ height: "40px" }} />
              <ContentField label="ABOUT見出し" k="about_title" val={homeContent.about_title} onSave={handleUpdateContent} />
              <ContentField label="ABOUT本文1" k="about_body_1" val={homeContent.about_body_1} onSave={handleUpdateContent} textarea />
              <ContentField label="ABOUT本文2" k="about_body_2" val={homeContent.about_body_2} onSave={handleUpdateContent} textarea />
            </div>
          </section>
        )}

        {/* Tab: Inquiries */}
        {activeTab === "inquiries" && (
          <section className="animate-fade-in">
            <h2 style={{ marginBottom: "24px" }}>届いているお問い合わせ</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {inquiries.length === 0 ? <p>まだお問い合わせはありません。</p> : inquiries.map(i => (
                <div key={i.id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{i.name} 様</span>
                    <span style={{ color: "#888", fontSize: "0.8rem" }}>{new Date(i.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "8px" }}>
                    <strong>所属:</strong> {i.organization || "なし"} | <strong>メール:</strong> {i.email}
                  </div>
                  <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", whiteSpace: "pre-wrap" }}>{i.content}</div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

// --- Sub-components for clean code ---

function TabBtn({ children, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
      background: active ? "var(--accent)" : "transparent",
      color: active ? "white" : "#555",
      fontWeight: active ? 700 : 400,
      transition: "0.2s"
    }}>{children}</button>
  );
}

function Field({ label, value, onChange, textarea, large, placeholder }: any) {
  return (
    <div style={groupStyle}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea style={{ ...inputStyle, height: large ? "300px" : "100px" }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function ContentField({ label, k, val, onSave, textarea }: any) {
  const [current, setCurrent] = useState(val || "");
  useEffect(() => { setCurrent(val || ""); }, [val]);
  return (
    <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid #f0f0f0" }}>
      <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>{label} <code style={{ fontWeight: 400, color: "#ccc", marginLeft: "8px" }}>({k})</code></label>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
        {textarea ? (
          <textarea style={{ ...inputStyle, flex: 1 }} value={current} onChange={e => setCurrent(e.target.value)} />
        ) : (
          <input style={{ ...inputStyle, flex: 1 }} value={current} onChange={e => setCurrent(e.target.value)} />
        )}
        <button onClick={() => onSave(k, current)} style={{ ...primaryBtn, width: "auto", padding: "10px 24px", fontSize: "0.9rem" }}>更新</button>
      </div>
    </div>
  );
}

const cardStyle = { background: "white", padding: "32px", borderRadius: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" };
const formGrid = { display: "flex", flexDirection: "column" as const, gap: "24px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const labelStyle = { fontWeight: 700, fontSize: "0.9rem", color: "#555" };
const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #eee", background: "#fcfcfc", fontSize: "1rem", boxSizing: "border-box" as const };
const primaryBtn = { background: "#7c6fcd", color: "white", border: "none", borderRadius: "12px", padding: "16px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", width: "100%" };
