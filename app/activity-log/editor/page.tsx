"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "members" | "faq" | "inquiries";
type PagePath = "home" | "about" | "en" | "guidelines" | "privacy";

export default function NexusStudioUltimate() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [activePage, setActivePage] = useState<PagePath>("home");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- データベースデータ ---
  const [siteContents, setSiteContents] = useState<Record<string, Record<string, string>>>({});
  const [members, setMembers] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);

  // --- 入力フォーム用 ---
  // 活動記録
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  // メンバー
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mAffiliation, setMAffiliation] = useState("");
  const [mField, setMField] = useState("");
  const [mMessage, setMMessage] = useState("");
  const [mPhotoUrl, setMPhotoUrl] = useState("");
  // FAQ
  const [fQuestion, setFQuestion] = useState("");
  const [fAnswer, setFAnswer] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // 1. サイトコンテンツ
      const { data: cData, error: cError } = await supabase.from('site_content').select('*');
      if (cError) throw cError;
      const cMap: any = { home: {}, about: {}, en: {}, guidelines: {}, privacy: {} };
      cData?.forEach(item => { if (cMap[item.page_path]) cMap[item.page_path][item.content_key] = item.content_value; });
      setSiteContents(cMap);

      // 2. メンバー
      const { data: mData } = await supabase.from('members').select('*').order('order_index');
      setMembers(mData || []);

      // 3. FAQ
      const { data: fData } = await supabase.from('faqs').select('*').order('order_index');
      setFaqs(fData || []);

      // 4. お問い合わせ
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(iData || []);

    } catch (e: any) {
      setErrorMsg("データの取得に失敗しました: " + e.message);
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

  // --- 画像アップロード ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('activity-images').upload(fileName, file);
    if (error) {
      alert("アップロード失敗: " + error.message);
    } else {
      const { data } = supabase.storage.from('activity-images').getPublicUrl(fileName);
      setUrl(data.publicUrl);
    }
    setUploading(false);
  };

  // --- 保存・削除アクション ---
  const handleUpdateContent = async (key: string, value: string) => {
    const { error } = await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    if (error) alert("更新エラー: " + error.message);
    else fetchData();
  };

  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, date, category, summary, content, slug, image_url: imageUrl, has_detail: !!content }]);
    if (error) alert(error.message);
    else { alert("記事を公開しました！"); setTitle(""); setSlug(""); setImageUrl(""); fetchData(); }
    setPublishing(false);
  };

  const handleAddMember = async () => {
    const { error } = await supabase.from('members').insert([{ name: mName, role: mRole, affiliation: mAffiliation, field: mField, message: mMessage, photo_url: mPhotoUrl, order_index: members.length + 1 }]);
    if (error) alert(error.message);
    else { alert("メンバーを追加しました"); setMName(""); setMMessage(""); setMPhotoUrl(""); fetchData(); }
  };

  const handleAddFaq = async () => {
    const { error } = await supabase.from('faqs').insert([{ question: fQuestion, answer: fAnswer, order_index: faqs.length + 1 }]);
    if (error) alert(error.message);
    else { setFQuestion(""); setFAnswer(""); fetchData(); }
  };

  const handleDelete = async (table: string, id: string) => {
    if (confirm("本当に削除しますか？")) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) alert(error.message);
      else fetchData();
    }
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center", fontFamily: "sans-serif" }}>Nexus Studio 起動中...</div>;

  return (
    <main style={{ background: "#fcfbf9", minHeight: "100vh", color: "#111", fontFamily: "var(--font-jp), sans-serif" }}>
      {/* ナビゲーションバー */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1.1rem", fontWeight: 900, letterSpacing: "-0.02em" }}>NEXUS STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>活動記録</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>サイト編集</NavBtn>
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")}>メンバー</NavBtn>
          <NavBtn active={activeTab === "faq"} onClick={() => setActiveTab("faq")}>FAQ</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>ログアウト</button>
      </header>

      {errorMsg && <div style={errorBanner}>{errorMsg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", minHeight: "calc(100vh - 70px)" }}>
        
        {/* 左側：メイン編集エリア */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee", overflowY: "auto" }}>
          
          {/* タブ1: 活動記録 */}
          {activeTab === "activity" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={titleStyle}>活動記録を投稿する</h2>
              <div style={formStack}>
                <Field label="記事タイトル" value={title} onChange={setTitle} placeholder="例：新プロジェクトが始動しました" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <Field label="日付" value={date} onChange={setDate} />
                  <div style={groupStyle}>
                    <label style={labelStyle}>カテゴリ</label>
                    <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="NEWS">NEWS</option>
                      <option value="PROJECT">PROJECT</option>
                      <option value="DIALOGUE">DIALOGUE</option>
                    </select>
                  </div>
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>メイン画像</label>
                  <input type="file" onChange={(e) => handleUpload(e, setImageUrl)} style={inputStyle} />
                  {uploading && <p style={{fontSize: "0.8rem", color: "blue"}}>アップロード中...</p>}
                </div>
                <Field label="URL用スラッグ (英数字)" value={slug} onChange={setSlug} placeholder="project-nexus-2024" />
                <Field label="要約 (一覧に表示される短い文章)" value={summary} onChange={setSummary} textarea />
                <Field label="本文 (詳細ページがある場合のみ記入)" value={content} onChange={setContent} textarea large />
                <button onClick={handlePublishActivity} disabled={publishing || uploading} style={primaryBtn}>
                  {publishing ? "公開処理中..." : "この記事をサイトに公開する"}
                </button>
              </div>
            </div>
          )}

          {/* タブ2: サイト文言編集 */}
          {activeTab === "content" && (
            <div style={{ maxWidth: "700px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <h2 style={{ ...titleStyle, marginBottom: 0 }}>全ページ文言編集</h2>
                <div style={{ display: "flex", gap: "6px", background: "#f0f0f0", padding: "4px", borderRadius: "10px" }}>
                  {(["home", "about", "en", "guidelines", "privacy"] as PagePath[]).map(p => (
                    <PageTabBtn key={p} active={activePage === p} onClick={() => setActivePage(p)}>{p.toUpperCase()}</PageTabBtn>
                  ))}
                </div>
              </div>
              <div style={formStack}>
                {siteContents[activePage] && Object.keys(siteContents[activePage]).length > 0 ? (
                  Object.keys(siteContents[activePage]).map(key => (
                    <div key={`${activePage}-${key}`} style={cardStyle}>
                      <label style={labelStyle}>{key}</label>
                      <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                        <textarea 
                          style={{ ...inputStyle, minHeight: "80px" }} 
                          defaultValue={siteContents[activePage][key]} 
                          onBlur={(e) => {
                            if (e.target.value !== siteContents[activePage][key]) {
                              handleUpdateContent(key, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: "center", color: "#999", padding: "40px"}}>データが読み込まれていないか、空です。</p>
                )}
              </div>
            </div>
          )}

          {/* タブ3: メンバー管理 */}
          {activeTab === "members" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={titleStyle}>メンバー管理</h2>
              <div style={{ ...cardStyle, border: "2px solid #eee", marginBottom: "40px" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>＋ 新しいメンバーを登録</h3>
                <div style={formStack}>
                  <Field label="名前" value={mName} onChange={setMName} />
                  <Field label="役割" value={mRole} onChange={setMRole} placeholder="設立者、デザイナーなど" />
                  <Field label="所属" value={mAffiliation} onChange={setMAffiliation} placeholder="〇〇大学 〇〇学部" />
                  <div style={groupStyle}>
                    <label style={labelStyle}>写真</label>
                    <input type="file" onChange={(e) => handleUpload(e, setMPhotoUrl)} style={inputStyle} />
                  </div>
                  <Field label="メッセージ" value={mMessage} onChange={setMMessage} textarea />
                  <button onClick={handleAddMember} style={primaryBtn}>メンバーを追加する</button>
                </div>
              </div>
              <h3 style={{ fontSize: "1rem", marginBottom: "20px" }}>登録済みリスト</h3>
              {members.map(m => (
                <div key={m.id} style={listItemStyle}>
                  <img src={m.photo_url || "/nexus-icon.png"} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}><strong>{m.name}</strong> <span style={{fontSize: "0.8rem", color: "#888"}}>{m.role}</span></div>
                  <button onClick={() => handleDelete('members', m.id)} style={deleteBtn}>削除</button>
                </div>
              ))}
            </div>
          )}

          {/* タブ4: FAQ管理 */}
          {activeTab === "faq" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={titleStyle}>よくある質問 (FAQ)</h2>
              <div style={{ ...cardStyle, marginBottom: "40px" }}>
                <Field label="質問 (Q)" value={fQuestion} onChange={setFQuestion} />
                <Field label="回答 (A)" value={fAnswer} onChange={setFAnswer} textarea />
                <button onClick={handleAddFaq} style={primaryBtn}>FAQを追加する</button>
              </div>
              {faqs.map(f => (
                <div key={f.id} style={{ ...listItemStyle, flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <strong>Q: {f.question}</strong>
                    <button onClick={() => handleDelete('faqs', f.id)} style={deleteBtn}>削除</button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>A: {f.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* タブ5: お問い合わせ */}
          {activeTab === "inquiries" && (
            <div>
              <h2 style={titleStyle}>お問い合わせ履歴</h2>
              {inquiries.length === 0 ? <p>まだお問い合わせはありません。</p> : inquiries.map(i => (
                <div key={i.id} style={{ ...cardStyle, marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <strong>{i.name} 様</strong>
                    <span style={{ fontSize: "0.8rem", color: "#aaa" }}>{new Date(i.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#4285F4", marginBottom: "10px" }}>{i.email}</p>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{i.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右側：ライブプレビューエリア */}
        <div style={{ background: "#f0f0f0", padding: "24px", position: "sticky", top: "70px", height: "calc(100vh - 70px)" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 900, color: "#bbb", marginBottom: "12px", letterSpacing: "0.1em" }}>LIVE PREVIEW</div>
          <div style={{ background: "white", padding: "32px", borderRadius: "20px", height: "calc(100% - 30px)", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
            {activeTab === "content" ? (
              <div>
                <h4 style={{ fontSize: "1.4rem", fontWeight: 900, marginBottom: "16px" }}>{siteContents[activePage]?.hero_title || "Preview Title"}</h4>
                <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {siteContents[activePage]?.hero_copy || siteContents[activePage]?.about_body_1 || siteContents[activePage]?.intro_text || "ここにプレビューが表示されます。"}
                </p>
              </div>
            ) : activeTab === "activity" ? (
              <div>
                {imageUrl && <img src={imageUrl} style={{ width: "100%", borderRadius: "10px", marginBottom: "15px" }} />}
                <h4 style={{ fontSize: "1.2rem", fontWeight: 900 }}>{title || "記事タイトル"}</h4>
                <p style={{ fontSize: "0.85rem", color: "#888", marginTop: "10px" }}>{summary}</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#ccc", marginTop: "100px" }}>このタブのプレビューは現在準備中です</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// スタイル補助コンポーネント
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "10px 20px", borderRadius: "12px", border: "none", cursor: "pointer", background: active ? "#111" : "transparent", color: active ? "white" : "#666", fontWeight: active ? 800 : 500, transition: "0.2s" }}>{children}</button>;
}
function PageTabBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#888", fontSize: "0.75rem", fontWeight: active ? 800 : 500 }}>{children}</button>;
}
function Field({ label, value, onChange, textarea, large, placeholder }: any) {
  return (
    <div style={groupStyle}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea style={{ ...inputStyle, height: large ? "250px" : "100px" }} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

// スタイル定数
const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", position: "sticky" as const, top: 0, zIndex: 100 };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0f0f0", padding: "5px", borderRadius: "16px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.8rem", fontWeight: 900, marginBottom: "32px", letterSpacing: "-0.02em" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "24px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const labelStyle = { fontWeight: 800, fontSize: "0.7rem", color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const inputStyle = { width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "0.95rem", boxSizing: "border-box" as const, fontFamily: "inherit" };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "12px", padding: "16px", fontWeight: 800, cursor: "pointer", fontSize: "1rem" };
const cardStyle = { background: "white", padding: "24px", borderRadius: "16px", border: "1px solid #eee" };
const listItemStyle = { display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid #eee", marginBottom: "10px" };
const deleteBtn = { color: "#ff4d4d", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" };
const errorBanner = { background: "#fff5f5", color: "#c53030", padding: "15px 40px", fontSize: "0.9rem", borderBottom: "1px solid #fed7d7" };
