"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "members" | "faq" | "inquiries";
type PagePath = "home" | "about" | "en" | "guidelines" | "privacy";

export default function NexusStudioPro() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Data States ---
  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});
  const [liveData, setLiveData] = useState<Record<string, string>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // --- Form States ---
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // Member Form
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mAffiliation, setMAffiliation] = useState("");
  const [mField, setMField] = useState("");
  const [mMessage, setMMessage] = useState("");
  const [mPhotoUrl, setMPhotoUrl] = useState("");
  // FAQ Form
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: cData, error: cError } = await supabase.from('site_content').select('*');
      if (cError) throw cError;
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
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
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

  // --- Handlers ---
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
    const { error } = await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    if (error) alert(error.message);
    else fetchData();
  };

  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, date, category, summary, content, slug, image_url: imageUrl, has_detail: !!content }]);
    if (error) alert(error.message);
    else { alert("公開完了！"); setTitle(""); setSlug(""); setImageUrl(""); fetchData(); }
    setPublishing(false);
  };

  const handleAddMember = async () => {
    const { error } = await supabase.from('members').insert([{ name: mName, role: mRole, affiliation: mAffiliation, field: mField, message: mMessage, photo_url: mPhotoUrl, order_index: members.length + 1 }]);
    if (error) alert(error.message);
    else { setMName(""); setMMessage(""); setMPhotoUrl(""); fetchData(); }
  };

  const handleAddFaq = async () => {
    const { error } = await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1 }]);
    if (error) alert(error.message);
    else { setFQuestion(""); setFAnswer(""); fetchData(); }
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("本当に削除しますか？")) {
      await supabase.from(table).delete().eq('id', id);
      fetchData();
    }
  };

  if (loading) return <div style={loadingStyle}>NEXUS STUDIO INITIALIZING...</div>;

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh", color: "#1a1a1a", fontFamily: "inherit" }}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.05em" }}>NEXUS STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon="✍️">活動記録</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")} icon="🌐">サイト編集</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")} icon="👤">メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => setActiveTab("faq")} icon="❓">FAQ</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")} icon="📩">お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>SIGN OUT</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 450px", height: "calc(100vh - 70px)" }}>
        
        {/* LEFT PANEL */}
        <div style={{ padding: "40px", overflowY: "auto", borderRight: "1px solid #e5e0d8" }}>
          
          {/* TAB: CONTENT EDIT */}
          {activeTab === "content" && (
            <div style={{ maxWidth: "800px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <h2 style={sectionTitleStyle}>全ページ文言管理</h2>
                <div style={pageToggleStyle}>
                  {(["home", "about", "en", "guidelines", "privacy"] as PagePath[]).map(p => (
                    <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>{p.toUpperCase()}</PageTabBtn>
                  ))}
                </div>
              </div>
              <div style={formStack}>
                {Object.keys(siteContents[activePage] || {}).map(key => (
                  <div key={`${activePage}-${key}`} style={editorCard}>
                    <label style={fieldLabelStyle}>{key}</label>
                    <textarea 
                      style={textAreaStyle} 
                      value={liveData[key] || ""} 
                      onChange={(e) => setLiveData(prev => ({ ...prev, [key]: e.target.value }))}
                      onBlur={(e) => handleUpdateContent(key, e.target.value)}
                    />
                    <div style={autoSaveHint}>枠外をクリックで自動保存</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === "activity" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={sectionTitleStyle}>新しい活動記録を投稿</h2>
              <div style={formStack}>
                <InputField label="記事タイトル" value={title} onChange={setTitle} placeholder="プロジェクトの進捗など" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <InputField label="日付" value={date} onChange={setDate} />
                  <div style={groupStyle}>
                    <label style={fieldLabelStyle}>カテゴリ</label>
                    <select style={selectStyle} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="NEWS">NEWS</option>
                      <option value="PROJECT">PROJECT</option>
                      <option value="DIALOGUE">DIALOGUE</option>
                    </select>
                  </div>
                </div>
                <div style={groupStyle}>
                  <label style={fieldLabelStyle}>メイン画像</label>
                  <div style={uploadBox}>
                    <input type="file" onChange={(e) => handleUpload(e, setImageUrl)} style={fileInputHidden} id="file-upload" />
                    <label htmlFor="file-upload" style={uploadLabel}>{uploading ? "Uploading..." : imageUrl ? "画像を切り替える" : "ファイルを選択"}</label>
                  </div>
                </div>
                <InputField label="スラッグ (URL用英数字)" value={slug} onChange={setSlug} placeholder="my-new-post" />
                <InputField label="要約 (一覧に表示)" value={summary} onChange={setSummary} textarea />
                <InputField label="本文 (詳細ページ用)" value={content} onChange={setContent} textarea large />
                <button onClick={handlePublishActivity} disabled={publishing || uploading} style={primaryActionBtn}>
                  {publishing ? "公開中..." : "記事を公開する"}
                </button>
              </div>
            </div>
          )}

          {/* TAB: MEMBERS */}
          {activeTab === "members" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={sectionTitleStyle}>メンバー管理</h2>
              <div style={{ ...editorCard, marginBottom: "40px", border: "2px solid #e5e0d8" }}>
                <h3 style={{ fontSize: "0.9rem", marginBottom: "20px", fontWeight: 800 }}>＋ メンバー新規登録</h3>
                <div style={formStack}>
                  <InputField label="氏名" value={mName} onChange={setMName} />
                  <InputField label="役割" value={mRole} onChange={setMRole} placeholder="Founder / Designer" />
                  <InputField label="所属" value={mAffiliation} onChange={setMAffiliation} placeholder="University" />
                  <div style={groupStyle}>
                    <label style={fieldLabelStyle}>プロフィール写真</label>
                    <input type="file" onChange={(e) => handleUpload(e, setMPhotoUrl)} style={inputStyle} />
                  </div>
                  <InputField label="メッセージ" value={mMessage} onChange={setMMessage} textarea />
                  <button onClick={handleAddMember} style={primaryActionBtn}>メンバーを保存</button>
                </div>
              </div>
              <div style={listContainer}>
                {members.map(m => (
                  <div key={m.id} style={listItem}>
                    <img src={m.photo_url || "/nexus-icon.png"} style={avatarSmall} />
                    <div style={{ flex: 1 }}><strong>{m.name}</strong> <span style={{fontSize: "0.8rem", color: "#888"}}>{m.role}</span></div>
                    <button onClick={() => handleDelete('members', m.id)} style={dangerBtn}>削除</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === "faq" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={sectionTitleStyle}>FAQ管理</h2>
              <div style={{ ...editorCard, marginBottom: "40px" }}>
                <InputField label="質問 (Question)" value={fQuestion} onChange={setFQuestion} />
                <InputField label="回答 (Answer)" value={fAnswer} onChange={setFAnswer} textarea />
                <button onClick={handleAddFaq} style={primaryActionBtn}>FAQを追加</button>
              </div>
              <div style={listContainer}>
                {faqs.map(f => (
                  <div key={f.id} style={{ ...listItem, flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <strong>Q: {f.question}</strong>
                      <button onClick={() => handleDelete('faqs', f.id)} style={dangerBtn}>削除</button>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "8px" }}>A: {f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INQUIRIES */}
          {activeTab === "inquiries" && (
            <div>
              <h2 style={sectionTitleStyle}>お問い合わせ履歴</h2>
              {inquiries.length === 0 ? <div style={emptyState}>メッセージはありません。</div> : inquiries.map(i => (
                <div key={i.id} style={{ ...editorCard, marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontWeight: 800 }}>{i.name} 様</span>
                    <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString()}</span>
                  </div>
                  <div style={{ color: "#4285F4", fontSize: "0.85rem", marginBottom: "12px" }}>{i.email}</div>
                  <p style={{ lineHeight: 1.7, fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>{i.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: PREVIEW */}
        <div style={{ background: "#f0efeb", padding: "24px", position: "sticky", top: "70px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "#999", letterSpacing: "0.15em" }}>LIVE PREVIEW</span>
            <span style={{ background: "#111", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800 }}>{activePage.toUpperCase()}</span>
          </div>
          <div style={previewWindow}>
            <div style={{ animation: "fadeIn 0.4s" }}>
              <p style={{ fontSize: "0.55rem", fontWeight: 900, color: "var(--accent)", marginBottom: "10px", letterSpacing: "0.2em" }}>NEXUS / CONCEPT</p>
              <h3 style={previewTitle}>
                {(liveData.hero_title || liveData.about_title || "Previewing...").split('\\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </h3>
              <div style={previewBody}>
                {liveData.hero_copy || liveData.about_body_1 || liveData.intro_text || "サイト上での見え方がここに表示されます。"}
              </div>
              {liveData.about_body_2 && <div style={previewSecondaryBody}>{liveData.about_body_2}</div>}
              <div style={previewActivity}>
                {imageUrl && <img src={imageUrl} style={{ width: "100%", borderRadius: "8px", marginBottom: "12px" }} />}
                <div style={{ fontWeight: 800 }}>{title || "Activity Title"}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

// STYLED COMPONENTS (INTERNAL)
function NavBtn({ children, active, onClick, icon }: any) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", borderRadius: "12px", border: "none", cursor: "pointer",
      background: active ? "#111" : "transparent",
      color: active ? "white" : "#666",
      fontWeight: active ? 800 : 500,
      display: "flex", alignItems: "center", gap: "8px", transition: "0.2s"
    }}>
      <span style={{ fontSize: "1rem" }}>{icon}</span>
      {children}
    </button>
  );
}
function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#888", fontSize: "0.7rem", fontWeight: active ? 800 : 500, boxShadow: active ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>{children}</button>;
}
function InputField({ label, value, onChange, textarea, large, placeholder }: any) {
  return (
    <div style={groupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      {textarea ? (
        <textarea style={{ ...inputStyle, minHeight: large ? "250px" : "100px" }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

// STYLES
const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e0d8", position: "sticky" as const, top: 0, zIndex: 100 };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0efeb", padding: "4px", borderRadius: "16px" };
const logoutBtn = { fontSize: "0.65rem", fontWeight: 900, color: "#888", border: "1px solid #ddd", background: "white", padding: "6px 12px", borderRadius: "8px", cursor: "pointer" };
const sectionTitleStyle = { fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.03em" };
const pageToggleStyle = { display: "flex", gap: "4px", background: "#f0efeb", padding: "4px", borderRadius: "10px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "28px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "10px" };
const fieldLabelStyle = { fontWeight: 900, fontSize: "0.65rem", color: "#888", textTransform: "uppercase" as const, letterSpacing: "0.1em" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #dcd7cc", background: "white", fontSize: "0.95rem", boxSizing: "border-box" as const, outline: "none", fontFamily: "inherit" };
const textAreaStyle = { ...inputStyle, minHeight: "100px", lineHeight: 1.6 };
const selectStyle = { ...inputStyle, cursor: "pointer" };
const editorCard = { background: "white", padding: "30px", borderRadius: "20px", border: "1px solid #e5e0d8" };
const autoSaveHint = { fontSize: "0.6rem", color: "#bbb", marginTop: "8px", textAlign: "right" as const };
const primaryActionBtn = { background: "#111", color: "white", border: "none", borderRadius: "12px", padding: "18px", fontSize: "1rem", fontWeight: 800, cursor: "pointer", width: "100%", transition: "0.2s" };
const listContainer = { display: "flex", flexDirection: "column" as const, gap: "12px" };
const listItem = { display: "flex", alignItems: "center", gap: "16px", background: "white", padding: "16px", borderRadius: "14px", border: "1px solid #e5e0d8" };
const avatarSmall = { width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" as const };
const dangerBtn = { color: "#ff4d4d", fontSize: "0.75rem", fontWeight: 800, border: "none", background: "none", cursor: "pointer" };
const previewWindow = { background: "white", padding: "40px", borderRadius: "28px", height: "calc(100% - 40px)", overflowY: "auto" as const, boxShadow: "0 25px 60px rgba(0,0,0,0.06)" };
const previewTitle = { fontSize: "1.6rem", fontWeight: 900, lineHeight: 1.25, marginBottom: "20px", letterSpacing: "-0.01em" };
const previewBody = { fontSize: "0.9rem", color: "#555", lineHeight: 1.85, whiteSpace: "pre-wrap" as const };
const previewSecondaryBody = { marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed #eee", fontSize: "0.85rem", color: "#777", lineHeight: 1.8 };
const previewActivity = { marginTop: "32px", padding: "20px", background: "#fcfbf9", borderRadius: "16px", border: "1px solid #eee", fontSize: "0.8rem" };
const emptyState = { textAlign: "center", padding: "60px", color: "#aaa", border: "2px dashed #eee", borderRadius: "20px" };
const loadingStyle = { padding: "100px", textAlign: "center" as const, fontSize: "0.7rem", fontWeight: 900, color: "#aaa", letterSpacing: "0.2em" };
const uploadBox = { border: "2px dashed #dcd7cc", borderRadius: "12px", padding: "20px", textAlign: "center" as const };
const fileInputHidden = { display: "none" };
const uploadLabel = { fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)", cursor: "pointer" };
