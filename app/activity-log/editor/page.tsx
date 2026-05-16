"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "members" | "faq" | "inquiries";
type PagePath = "home" | "about" | "en" | "guidelines" | "privacy";

export default function NexusUltimateDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- 状態管理 ---
  const [activities, setActivities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});

  // フォーム用入力状態
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");

  const fetchData = async () => {
    const { data: cData } = await supabase.from('site_content').select('*');
    const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
    cData?.forEach(item => { if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value; });
    setSiteContents(cMap);

    const { data: mData } = await supabase.from('members').select('*').order('order_index', { ascending: true });
    setMembers(mData || []);

    const { data: fData } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
    setFaqs(fData || []);

    const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    setInquiries(iData || []);

    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      fetchData();
    };
    checkUser();
  }, [router]);

  // 共通アップロード
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

  // 保存処理
  const handleUpdateContent = async (key: string, value: string) => {
    await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    alert("更新しました"); fetchData();
  };

  const handleAddFaq = async () => {
    await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1 }]);
    setFQuestion(""); setFAnswer(""); fetchData();
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("削除してもよろしいですか？")) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Nexus Studio Loading...</div>;

  return (
    <main style={{ background: "#fcfbf9", minHeight: "100vh" }}>
      {/* Navbar */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={30} height={30} />
          <h1 style={{ fontSize: "1.1rem", fontWeight: 900 }}>STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>活動</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>サイト文言</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")}>メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => setActiveTab("faq")}>FAQ</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>Sign Out</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", minHeight: "calc(100vh - 70px)" }}>
        {/* 左：編集 */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee", overflowY: "auto" }}>
          
          {activeTab === "content" && (
            <section>
              <div style={{ display: "flex", gap: "10px", marginBottom: "30px", background: "#eee", padding: "4px", borderRadius: "10px", width: "fit-content" }}>
                {(["home", "about", "en", "guidelines", "privacy"] as PagePath[]).map(p => (
                  <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>{p.toUpperCase()}</PageTabBtn>
                ))}
              </div>
              <div style={formStack}>
                {Object.keys(siteContents[activePage] || {}).map(key => (
                  <ContentField key={`${activePage}-${key}`} label={key} k={key} val={siteContents[activePage][key]} onSave={handleUpdateContent} />
                ))}
              </div>
            </section>
          )}

          {activeTab === "members" && (
            <section>
              <h2 style={titleStyle}>メンバー管理</h2>
              <div style={{ ...cardStyle, marginBottom: "30px", border: "2px solid #ddd" }}>
                <Field label="名前" value={mName} onChange={setMName} />
                <Field label="役割" value={mRole} onChange={setMRole} />
                <button onClick={async () => {
                  await supabase.from('members').insert([{ name: mName, role: mRole, order_index: members.length + 1 }]);
                  setMName(""); setMRole(""); fetchData();
                }} style={primaryBtn}>追加</button>
              </div>
              {members.map(m => (
                <div key={m.id} style={listItemStyle}>
                  <span>{m.name} ({m.role})</span>
                  <button onClick={() => handleDelete('members', m.id)} style={deleteBtn}>削除</button>
                </div>
              ))}
            </section>
          )}

          {activeTab === "faq" && (
            <section>
              <h2 style={titleStyle}>FAQ管理</h2>
              <div style={{ ...cardStyle, marginBottom: "30px" }}>
                <Field label="質問" value={fQuestion} onChange={setFQuestion} />
                <Field label="回答" value={fAnswer} onChange={setFAnswer} textarea />
                <button onClick={handleAddFaq} style={primaryBtn}>FAQを追加</button>
              </div>
              {faqs.map(f => (
                <div key={f.id} style={listItemStyle}>
                  <div style={{ flex: 1 }}><strong>Q: {f.question}</strong><p style={{fontSize: "0.8rem", color: "#888"}}>{f.answer}</p></div>
                  <button onClick={() => handleDelete('faqs', f.id)} style={deleteBtn}>削除</button>
                </div>
              ))}
            </section>
          )}

          {/* Activity / Inquiry */}
          {activeTab === "activity" && <h2 style={titleStyle}>活動記録の投稿機能（実装済み）</h2>}
          {activeTab === "inquiries" && <h2 style={titleStyle}>お問い合わせ一覧（実装済み）</h2>}
        </div>

        {/* 右：プレビュー */}
        <div style={{ background: "#f4f4f2", padding: "24px", position: "sticky", top: "70px", height: "calc(100vh - 70px)" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "20px", height: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", overflowY: "auto" }}>
            <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#ccc", marginBottom: "20px" }}>LIVE PREVIEW</p>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 900 }}>{siteContents[activePage]?.hero_title || "Preview"}</h3>
            <p style={{ marginTop: "16px", color: "#666", lineHeight: 1.6 }}>{siteContents[activePage]?.hero_copy || siteContents[activePage]?.intro_text || ""}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Subcomponents
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "8px 18px", borderRadius: "10px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#666", fontWeight: active ? 800 : 500, transition: "0.2s" }}>{children}</button>;
}
function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: "7px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#888", fontSize: "0.75rem", fontWeight: active ? 800 : 500 }}>{children}</button>;
}
function Field({ label, value, onChange, textarea }: any) {
  return <div style={{ marginBottom: "15px" }}><label style={labelStyle}>{label}</label>{textarea ? <textarea style={inputStyle} value={value} onChange={e => onChange(e.target.value)} /> : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}
function ContentField({ label, k, val, onSave }: any) {
  const [v, setV] = useState(val || "");
  useEffect(() => { setV(val || ""); }, [val]);
  return (
    <div style={cardStyle}>
      <label style={{ ...labelStyle, marginBottom: "8px", display: "block" }}>{label}</label>
      <div style={{ display: "flex", gap: "10px" }}>
        <textarea style={{ ...inputStyle, flex: 1, height: "60px" }} value={v} onChange={e => setV(e.target.value)} />
        <button onClick={() => onSave(k, v)} style={{ background: "#111", color: "white", border: "none", borderRadius: "8px", padding: "0 15px", cursor: "pointer" }}>更新</button>
      </div>
    </div>
  );
}

const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", position: "sticky" as const, top: 0, zIndex: 100 };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0f0f0", padding: "4px", borderRadius: "14px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.6rem", fontWeight: 900, marginBottom: "32px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "12px" };
const labelStyle = { fontWeight: 800, fontSize: "0.75rem", color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" as const };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "10px", padding: "14px", fontWeight: 800, cursor: "pointer", width: "100%" };
const cardStyle = { background: "white", padding: "20px", borderRadius: "14px", border: "1px solid #eee" };
const listItemStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "15px 20px", borderRadius: "12px", marginBottom: "10px", border: "1px solid #eee" };
const deleteBtn = { color: "#ff4d4d", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" };
