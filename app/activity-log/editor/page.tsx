"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "members" | "faq" | "inquiries";
type PagePath = "home" | "about" | "en" | "guidelines" | "privacy";

export default function NexusUltimateDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- データ状態 ---
  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});
  const [liveData, setLiveData] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // --- 入力用状態 ---
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");

  const fetchData = async () => {
    const { data: cData } = await supabase.from('site_content').select('*');
    const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
    cData?.forEach(item => { if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value; });
    setSiteContents(cMap);
    setLiveData(cMap[activePage] || {});

    const { data: mData } = await supabase.from('members').select('*').order('order_index');
    setMembers(mData || []);

    const { data: fData } = await supabase.from('faqs').select('*').order('order_index');
    setFaqs(fData || []);

    const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    setInquiries(iData || []);

    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      fetchData();
    };
    init();
  }, [router]);

  useEffect(() => {
    setLiveData(siteContents[activePage] || {});
  }, [activePage, siteContents]);

  // --- 各種処理 ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('activity-images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('activity-images').getPublicUrl(fileName);
      setUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleUpdateContent = async (key: string, value: string) => {
    await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    setSiteContents(prev => ({ ...prev, [activePage]: { ...prev[activePage], [key]: value } }));
  };

  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, summary, content, image_url: imageUrl, slug, has_detail: !!content, date: new Date().toLocaleDateString('ja-JP').replace(/\//g, '.') }]);
    if (!error) { alert("記事を公開しました"); setTitle(""); setImageUrl(""); fetchData(); }
    setPublishing(false);
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("削除しますか？")) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Nexus Studio Loading...</div>;

  return (
    <main style={{ background: "#fcfbf9", minHeight: "100vh" }}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1.1rem", fontWeight: 900 }}>STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>活動</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>編集</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")}>メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => setActiveTab("faq")}>FAQ</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>Logout</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 450px", minHeight: "calc(100vh - 70px)" }}>
        
        {/* 左側：編集エリア */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee", overflowY: "auto" }}>
          
          {/* 文言編集タブ */}
          {activeTab === "content" && (
            <div style={{ maxWidth: "700px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "30px", background: "#f0f0f0", padding: "5px", borderRadius: "10px", width: "fit-content" }}>
                {(["home", "about", "en", "guidelines", "privacy"] as PagePath[]).map(p => (
                  <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>{p.toUpperCase()}</PageTabBtn>
                ))}
              </div>
              <div style={formStack}>
                {Object.keys(siteContents[activePage] || {}).map(key => (
                  <div key={`${activePage}-${key}`} style={cardStyle}>
                    <label style={labelStyle}>{key}</label>
                    <textarea 
                      style={inputStyle} 
                      value={liveData[key] || ""} 
                      onChange={(e) => setLiveData(prev => ({ ...prev, [key]: e.target.value }))}
                      onBlur={(e) => handleUpdateContent(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 活動記録タブ */}
          {activeTab === "activity" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>活動記録の投稿</h2>
              <div style={formStack}>
                <Field label="記事タイトル" value={title} onChange={setTitle} />
                <div style={groupStyle}><label style={labelStyle}>画像</label><input type="file" onChange={(e) => handleUpload(e, setImageUrl)} style={inputStyle} /></div>
                <Field label="スラッグ" value={slug} onChange={setSlug} />
                <Field label="要約" value={summary} onChange={setSummary} textarea />
                <Field label="本文" value={content} onChange={setContent} textarea large />
                <button onClick={handlePublishActivity} disabled={publishing || uploading} style={primaryBtn}>公開する</button>
              </div>
            </div>
          )}

          {/* メンバー管理タブ */}
          {activeTab === "members" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>メンバー管理</h2>
              <div style={{ ...cardStyle, marginBottom: "30px" }}>
                <Field label="名前" value={mName} onChange={setMName} />
                <Field label="役割" value={mRole} onChange={setMRole} />
                <button onClick={async () => {
                  await supabase.from('members').insert([{ name: mName, role: mRole, order_index: members.length + 1 }]);
                  setMName(""); setMRole(""); fetchData();
                }} style={primaryBtn}>メンバーを追加</button>
              </div>
              {members.map(m => (
                <div key={m.id} style={listItemStyle}>
                  <span>{m.name} ({m.role})</span>
                  <button onClick={() => handleDelete('members', m.id)} style={deleteBtn}>削除</button>
                </div>
              ))}
            </div>
          )}

          {/* FAQ管理タブ */}
          {activeTab === "faq" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>FAQ管理</h2>
              <div style={{ ...cardStyle, marginBottom: "30px" }}>
                <Field label="質問" value={fQuestion} onChange={setFQuestion} />
                <Field label="回答" value={fAnswer} onChange={setFAnswer} textarea />
                <button onClick={async () => {
                  await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1 }]);
                  setFQuestion(""); setFAnswer(""); fetchData();
                }} style={primaryBtn}>FAQを追加</button>
              </div>
              {faqs.map(f => (
                <div key={f.id} style={listItemStyle}>
                  <span>{f.question}</span>
                  <button onClick={() => handleDelete('faqs', f.id)} style={deleteBtn}>削除</button>
                </div>
              ))}
            </div>
          )}

          {/* お問い合わせタブ */}
          {activeTab === "inquiries" && (
            <div>
              <h2 style={titleStyle}>お問い合わせ</h2>
              {inquiries.map(i => (
                <div key={i.id} style={cardStyle}>
                  <p><strong>{i.name}</strong> ({i.email})</p>
                  <p style={{ marginTop: "10px" }}>{i.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右側：プレビュー */}
        <div style={{ background: "#f0f0f0", padding: "30px", position: "sticky", top: "70px", height: "calc(100vh - 70px)" }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "24px", height: "100%", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.05)" }}>
            {activeTab === "content" ? (
              <div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.3, marginBottom: "20px" }}>
                  {(liveData.hero_title || liveData.about_title || "Preview").split('\\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </h2>
                <div style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {liveData.hero_copy || liveData.about_body_1 || liveData.intro_text || ""}
                </div>
              </div>
            ) : (
              <p style={{ color: "#ccc", textAlign: "center", marginTop: "100px" }}>No preview for this tab</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

// 共通パーツ
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer", background: active ? "#111" : "transparent", color: active ? "white" : "#666", fontWeight: active ? 700 : 500 }}>{children}</button>;
}
function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: "6px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#888", fontSize: "0.75rem", fontWeight: active ? 800 : 500 }}>{children}</button>;
}
function Field({ label, value, onChange, textarea, large }: any) {
  return <div style={groupStyle}><label style={labelStyle}>{label}</label>{textarea ? <textarea style={{ ...inputStyle, height: large ? "200px" : "100px" }} value={value} onChange={e => onChange(e.target.value)} /> : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}

const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", position: "sticky" as const, top: 0, zIndex: 100 };
const tabNavStyle = { display: "flex", gap: "5px", background: "#f0f0f0", padding: "5px", borderRadius: "14px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.5rem", fontWeight: 800, marginBottom: "30px" };
const labelStyle = { fontWeight: 800, fontSize: "0.65rem", color: "#aaa", textTransform: "uppercase" as const, marginBottom: "8px", display: "block" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" as const };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "20px" };
const cardStyle = { background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #eee" };
const listItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "15px", borderRadius: "12px", marginBottom: "10px", border: "1px solid #eee" };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, cursor: "pointer" };
const deleteBtn = { color: "red", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem" };
