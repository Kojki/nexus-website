"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "inquiries";
type PagePath = "home" | "about" | "en";

export default function NexusUltimateDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 活動記録用
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // 全ページのコンテンツ保持
  const [siteContents, setSiteContents] = useState<Record<PagePath, Record<string, string>>>({
    home: {}, about: {}, en: {}
  });
  
  const [inquiries, setInquiries] = useState<any[]>([]);

  const fetchAllContents = async () => {
    const { data } = await supabase.from('site_content').select('*');
    const newContents: any = { home: {}, about: {}, en: {} };
    data?.forEach(item => {
      if (newContents[item.page_path]) {
        newContents[item.page_path][item.content_key] = item.content_value;
      }
    });
    setSiteContents(newContents);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      await fetchAllContents();
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(iData || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploading(true);
    const file = event.target.files?.[0];
    if (!file) return;
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from('activity-images').upload(fileName, file);
    if (!error) {
      const { data } = supabase.storage.from('activity-images').getPublicUrl(fileName);
      setImageUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, date, category, summary, content, slug, image_url: imageUrl, has_detail: !!content }]);
    if (!error) { alert("記事を公開しました！"); setSlug(""); setTitle(""); setImageUrl(""); }
    setPublishing(false);
  };

  const handleUpdateContent = async (key: string, value: string) => {
    const { error } = await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    if (!error) {
      alert(`「${activePage}」の「${key}」を更新しました`);
      fetchAllContents();
    }
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Nexus Studio Initializing...</div>;

  return (
    <main style={{ background: "#fcfbf9", minHeight: "100vh" }}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1.1rem", fontWeight: 800 }}>NEXUS STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>活動記録</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>全ページ編集</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>Logout</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", minHeight: "calc(100vh - 70px)" }}>
        
        {/* 左側：編集エリア */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee", overflowY: "auto" }}>
          {activeTab === "activity" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>新しい活動記録を投稿</h2>
              <div style={formStack}>
                <Field label="記事タイトル" value={title} onChange={setTitle} />
                <div style={groupStyle}><label style={labelStyle}>画像</label><input type="file" onChange={handleFileUpload} style={inputStyle} /></div>
                <Field label="要約" value={summary} onChange={setSummary} textarea />
                <button onClick={handlePublishActivity} disabled={publishing || uploading} style={primaryBtn}>公開する</button>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div style={{ maxWidth: "700px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ ...titleStyle, marginBottom: 0 }}>ページ編集</h2>
                <div style={{ display: "flex", gap: "8px", background: "#eee", padding: "4px", borderRadius: "8px" }}>
                  <PageTabBtn active={activePage === "home"} onClick={() => setActivePage("home")}>Home</PageTabBtn>
                  <PageTabBtn active={activePage === "about"} onClick={() => setActivePage("about")}>About</PageTabBtn>
                  <PageTabBtn active={activePage === "en"} onClick={() => setActivePage("en")}>EN</PageTabBtn>
                </div>
              </div>

              <div style={formStack}>
                {Object.keys(siteContents[activePage]).length === 0 ? (
                  <p style={{ color: "#aaa" }}>このページにはまだ編集可能な項目がありません。</p>
                ) : (
                  Object.keys(siteContents[activePage]).map(key => (
                    <ContentField 
                      key={`${activePage}-${key}`} 
                      label={key} 
                      k={key} 
                      val={siteContents[activePage][key]} 
                      onSave={handleUpdateContent} 
                      textarea={siteContents[activePage][key].length > 40}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "inquiries" && (
            <div>
              <h2 style={titleStyle}>届いているお問い合わせ</h2>
              {inquiries.map(i => (
                <div key={i.id} style={cardStyle}>
                  <p><strong>{i.name}</strong> ({i.email})</p>
                  <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>{i.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右側：プレビューエリア */}
        <div style={{ background: "#f0f0f0", padding: "20px", position: "sticky", top: "70px", height: "calc(100vh - 70px)" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, marginBottom: "10px", color: "#aaa" }}>LIVE PREVIEW ({activePage.toUpperCase()})</div>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", height: "calc(100% - 30px)", overflowY: "auto" }}>
             {/* ここで activePage に応じたプレビューを切り替え表示 */}
             <h4 style={{ fontSize: "1.1rem", fontWeight: 800 }}>{siteContents[activePage].hero_title || "Previewing..."}</h4>
             <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "10px", whiteSpace: "pre-wrap" }}>
               {siteContents[activePage].hero_copy || siteContents[activePage].block_1_body || ""}
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// 補助コンポーネント
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#666", fontWeight: active ? 700 : 500 }}>{children}</button>;
}
function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "4px 12px", borderRadius: "6px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", fontSize: "0.8rem", fontWeight: active ? 700 : 400 }}>{children}</button>;
}
function Field({ label, value, onChange, textarea }: any) {
  return <div style={groupStyle}><label style={labelStyle}>{label}</label>{textarea ? <textarea style={inputStyle} value={value} onChange={e => onChange(e.target.value)} /> : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}
function ContentField({ label, k, val, onSave, textarea }: any) {
  const [v, setV] = useState(val);
  useEffect(() => { setV(val); }, [val]);
  return (
    <div style={{ marginBottom: "20px", background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #eee" }}>
      <label style={{ ...labelStyle, display: "block", marginBottom: "8px" }}>{label}</label>
      <div style={{ display: "flex", gap: "10px" }}>
        {textarea ? <textarea style={{ ...inputStyle, flex: 1, minHeight: "100px" }} value={v} onChange={e => setV(e.target.value)} /> : <input style={{ ...inputStyle, flex: 1 }} value={v} onChange={e => setV(e.target.value)} />}
        <button onClick={() => onSave(k, v)} style={{ background: "#111", color: "white", border: "none", borderRadius: "8px", padding: "0 15px", cursor: "pointer", height: "42px" }}>更新</button>
      </div>
    </div>
  );
}

const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0f0f0", padding: "4px", borderRadius: "12px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.5rem", fontWeight: 800, marginBottom: "30px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "10px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const labelStyle = { fontWeight: 700, fontSize: "0.8rem", color: "#555" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" as const };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, cursor: "pointer" };
const cardStyle = { background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "12px" };
