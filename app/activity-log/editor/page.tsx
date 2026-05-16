"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "inquiries";

export default function NexusUploadDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // フォーム状態
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('ja-JP').replace(/\//g, '.'));
  const [category, setCategory] = useState("NEWS");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [homeContent, setHomeContent] = useState<Record<string, string>>({});
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: cData } = await supabase.from('site_content').select('*').eq('page_path', 'home');
      const cMap: Record<string, string> = {};
      cData?.forEach(item => cMap[item.content_key] = item.content_value);
      setHomeContent(cMap);
      const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
      setInquiries(iData || []);
      setLoading(false);
    };
    init();
  }, [router]);

  // --- 画像アップロード処理 ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // ファイル名をユニークにする（日付 + 名前）
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage にアップロード
      const { error: uploadError } = await supabase.storage
        .from('activity-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data } = supabase.storage
        .from('activity-images')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
      alert("画像をアップロードしました！");
    } catch (error: any) {
      alert("アップロード失敗: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePublishActivity = async () => {
    setPublishing(true);
    const { error } = await supabase.from('activities').insert([{ title, date, category, summary, content, slug, image_url: imageUrl, has_detail: !!content }]);
    if (error) alert("エラー: " + error.message);
    else { alert("公開完了！"); setSlug(""); setTitle(""); setImageUrl(""); }
    setPublishing(false);
  };

  const handleUpdateContent = async (key: string, value: string) => {
    const { error } = await supabase.from('site_content').upsert({ page_path: 'home', content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    if (!error) alert("更新しました！");
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>;

  return (
    <main style={{ background: "#fcfbf9", minHeight: "100vh" }}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image src="/nexus-icon.png" alt="Logo" width={28} height={28} />
          <h1 style={{ fontSize: "1.1rem", fontWeight: 800 }}>NEXUS STUDIO</h1>
        </div>
        <nav style={tabNavStyle}>
          <NavBtn active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>活動記録</NavBtn>
          <NavBtn active={activeTab === "content"} onClick={() => setActiveTab("content")}>サイト編集</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>Logout</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", minHeight: "calc(100vh - 70px)" }}>
        
        {/* 左側：編集フォーム */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee" }}>
          {activeTab === "activity" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>新しい活動記録</h2>
              <div style={formStack}>
                <Field label="記事タイトル" value={title} onChange={setTitle} />
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

                {/* アップロードボタン */}
                <div style={groupStyle}>
                  <label style={labelStyle}>画像アップロード</label>
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={inputStyle} />
                  {uploading && <p style={{ fontSize: "0.8rem", color: "var(--accent)" }}>アップロード中...</p>}
                </div>

                <Field label="Slug (URL末尾)" value={slug} onChange={setSlug} />
                <Field label="要約" value={summary} onChange={setSummary} textarea />
                <Field label="本文" value={content} onChange={setContent} textarea large />
                <button onClick={handlePublishActivity} disabled={publishing || uploading} style={primaryBtn}>
                  {publishing ? "公開中..." : "記事を公開する"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div style={{ maxWidth: "600px" }}>
              <h2 style={titleStyle}>サイトコンテンツ編集</h2>
              <div style={formStack}>
                {Object.keys(homeContent).map(key => (
                  <ContentField key={key} label={key} k={key} val={homeContent[key]} onSave={handleUpdateContent} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右側：プレビュー */}
        <div style={{ background: "#f0f0f0", padding: "20px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, marginBottom: "10px", color: "#aaa" }}>LIVE PREVIEW</div>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            {imageUrl && (
              <div style={{ width: "100%", height: "180px", position: "relative", marginBottom: "20px", borderRadius: "8px", overflow: "hidden" }}>
                <img src={imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{title || "タイトル"}</h3>
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "10px" }}>{summary}</p>
          </div>
        </div>

      </div>
    </main>
  );
}

// 共通パーツ
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#666", fontWeight: active ? 700 : 500, boxShadow: active ? "0 2px 8px rgba(0,0,0,0.05)" : "none" }}>{children}</button>;
}
function Field({ label, value, onChange, textarea, large }: any) {
  return <div style={groupStyle}><label style={labelStyle}>{label}</label>{textarea ? <textarea style={{ ...inputStyle, height: large ? "200px" : "100px" }} value={value} onChange={e => onChange(e.target.value)} /> : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}
function ContentField({ label, k, val, onSave }: any) {
  const [v, setV] = useState(val);
  return <div style={{ marginBottom: "20px" }}><label style={labelStyle}>{label}</label><div style={{ display: "flex", gap: "10px" }}><input style={inputStyle} value={v} onChange={e => setV(e.target.value)} /><button onClick={() => onSave(k, v)} style={{ ...primaryBtn, width: "80px", padding: "0" }}>更新</button></div></div>;
}

const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0f0f0", padding: "4px", borderRadius: "12px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.5rem", fontWeight: 800, marginBottom: "30px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "20px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const labelStyle = { fontWeight: 700, fontSize: "0.8rem", color: "#555" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" as const };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, cursor: "pointer" };
