"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Tab = "activity" | "content" | "members" | "inquiries"; // membersを追加
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

  // メンバー管理用
  const [members, setMembers] = useState<any[]>([]);
  const [mName, setMName] = useState("");
  const [mRole, setMRole] = useState("");
  const [mAffiliation, setMAffiliation] = useState("");
  const [mField, setMField] = useState("");
  const [mMessage, setMMessage] = useState("");
  const [mPhotoUrl, setMPhotoUrl] = useState("");

  // 全ページのコンテンツ保持
  const [siteContents, setSiteContents] = useState<Record<PagePath, Record<string, string>>>({
    home: {}, about: {}, en: {}
  });
  
  const [inquiries, setInquiries] = useState<any[]>([]);

  // データの再取得
  const fetchData = async () => {
    // コンテンツ
    const { data: cData } = await supabase.from('site_content').select('*');
    const newContents: any = { home: {}, about: {}, en: {} };
    cData?.forEach(item => { if (newContents[item.page_path]) newContents[item.page_path][item.content_key] = item.content_value; });
    setSiteContents(newContents);

    // メンバー
    const { data: mData } = await supabase.from('members').select('*').order('order_index', { ascending: true });
    setMembers(mData || []);

    // お問い合わせ
    const { data: iData } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    setInquiries(iData || []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      await fetchData();
      setLoading(false);
    };
    init();
  }, [router]);

  // 画像アップロード共通
  const uploadFile = async (file: File, bucket: string) => {
    setUploading(true);
    const fileName = `${Date.now()}.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) { alert("アップロード失敗"); setUploading(false); return null; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  // メンバー保存
  const handleAddMember = async () => {
    const { error } = await supabase.from('members').insert([{
      name: mName, role: mRole, affiliation: mAffiliation, field: mField, message: mMessage, photo_url: mPhotoUrl, order_index: members.length + 1
    }]);
    if (!error) { alert("メンバーを追加しました！"); setMName(""); setMMessage(""); setMPhotoUrl(""); fetchData(); }
  };

  // メンバー削除
  const handleDeleteMember = async (id: string) => {
    if (confirm("本当にこのメンバーを削除しますか？")) {
      await supabase.from('members').delete().eq('id', id);
      fetchData();
    }
  };

  const handleUpdateContent = async (key: string, value: string) => {
    await supabase.from('site_content').upsert({ page_path: activePage, content_key: key, content_value: value }, { onConflict: 'page_path,content_key' });
    alert(`「${activePage}」を更新しました`);
    fetchData();
  };

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Initializing...</div>;

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
          <NavBtn active={activeTab === "members"} onClick={() => setActiveTab("members")}>メンバー管理</NavBtn>
          <NavBtn active={activeTab === "inquiries"} onClick={() => setActiveTab("inquiries")}>お問い合わせ</NavBtn>
        </nav>
        <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} style={logoutBtn}>Logout</button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", minHeight: "calc(100vh - 70px)" }}>
        
        {/* 左側：編集フォーム */}
        <div style={{ padding: "40px", borderRight: "1px solid #eee", overflowY: "auto" }}>
          
          {activeTab === "members" && (
            <div style={{ maxWidth: "700px" }}>
              <h2 style={titleStyle}>メンバー管理</h2>
              
              {/* 新規追加フォーム */}
              <div style={{ ...cardStyle, marginBottom: "40px", border: "2px solid var(--accent-light)" }}>
                <h3 style={{ marginBottom: "20px", fontSize: "1rem" }}>＋ 新しいメンバーを追加</h3>
                <div style={formStack}>
                  <Field label="名前" value={mName} onChange={setMName} />
                  <Field label="役割 (例: 設立者, デザイナー)" value={mRole} onChange={setMRole} />
                  <Field label="所属 (例: 九州工業大学 3年)" value={mAffiliation} onChange={setMAffiliation} />
                  <Field label="専門分野 (例: 電気電子、AI)" value={mField} onChange={setMField} />
                  <div style={groupStyle}>
                    <label style={labelStyle}>プロフィール写真</label>
                    <input type="file" onChange={async (e) => {
                      const url = await uploadFile(e.target.files![0], 'activity-images');
                      if (url) setMPhotoUrl(url);
                    }} style={inputStyle} />
                    {mPhotoUrl && <img src={mPhotoUrl} style={{ width: "60px", height: "60px", borderRadius: "50%", marginTop: "10px" }} />}
                  </div>
                  <Field label="ひとことメッセージ" value={mMessage} onChange={setMMessage} textarea />
                  <button onClick={handleAddMember} style={primaryBtn}>メンバーを登録する</button>
                </div>
              </div>

              {/* 既存リスト */}
              <h3 style={{ marginBottom: "20px", fontSize: "1rem" }}>登録済みメンバー</h3>
              {members.map(m => (
                <div key={m.id} style={{ ...cardStyle, display: "flex", gap: "20px", alignItems: "center", marginBottom: "12px" }}>
                  <img src={m.photo_url || "/nexus-icon.png"} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>{m.role} / {m.affiliation}</div>
                  </div>
                  <button onClick={() => handleDeleteMember(m.id)} style={{ color: "red", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem" }}>削除</button>
                </div>
              ))}
            </div>
          )}

          {/* Activity / Content / Inquiries のコードは前回と同じ（略） */}
          {activeTab === "activity" && <div style={{maxWidth: "600px"}}><h2 style={titleStyle}>活動記録</h2>{/* ...前回と同じ */}</div>}
          {activeTab === "content" && <div style={{maxWidth: "700px"}}><h2 style={titleStyle}>ページ編集</h2>{/* ...前回と同じ */}</div>}
          {activeTab === "inquiries" && <div><h2 style={titleStyle}>お問い合わせ</h2>{/* ...前回と同じ */}</div>}

        </div>

        {/* 右側：プレビュー */}
        <div style={{ background: "#f0f0f0", padding: "20px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 800, marginBottom: "10px", color: "#aaa" }}>LIVE PREVIEW</div>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", height: "100%", overflowY: "auto" }}>
            {activeTab === "members" ? (
              <div>
                <div style={{ background: "var(--accent-pale)", padding: "10px", borderRadius: "8px", fontSize: "0.6rem", fontWeight: 800, color: "var(--accent)", display: "inline-block" }}>{mRole || "ROLE"}</div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "12px" }}>{mName || "氏名"}</h4>
                <p style={{ fontSize: "0.8rem", color: "#888" }}>{mAffiliation || "所属大学・学部など"}</p>
                <div style={{ marginTop: "16px", padding: "12px", background: "#f9f9f9", borderRadius: "8px", fontSize: "0.75rem", fontStyle: "italic" }}>
                  &ldquo;{mMessage || "メッセージがここに表示されます..."}&rdquo;
                </div>
              </div>
            ) : (
              <p style={{ color: "#ccc" }}>Preview available for this tab</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// 共通コンポーネント（前回と同じ）
function NavBtn({ children, active, onClick }: any) {
  return <button onClick={onClick} style={{ padding: "6px 16px", borderRadius: "8px", border: "none", cursor: "pointer", background: active ? "white" : "transparent", color: active ? "black" : "#666", fontWeight: active ? 700 : 500 }}>{children}</button>;
}
function Field({ label, value, onChange, textarea }: any) {
  return <div style={groupStyle}><label style={labelStyle}>{label}</label>{textarea ? <textarea style={inputStyle} value={value} onChange={e => onChange(e.target.value)} /> : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />}</div>;
}

const headerStyle = { background: "white", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" };
const tabNavStyle = { display: "flex", gap: "4px", background: "#f0f0f0", padding: "4px", borderRadius: "12px" };
const logoutBtn = { fontSize: "0.8rem", color: "#888", border: "none", background: "none", cursor: "pointer" };
const titleStyle = { fontSize: "1.5rem", fontWeight: 800, marginBottom: "30px" };
const formStack = { display: "flex", flexDirection: "column" as const, gap: "16px" };
const groupStyle = { display: "flex", flexDirection: "column" as const, gap: "8px" };
const labelStyle = { fontWeight: 700, fontSize: "0.8rem", color: "#555" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.9rem", boxSizing: "border-box" as const };
const primaryBtn = { background: "#111", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontWeight: 700, cursor: "pointer" };
const cardStyle = { background: "white", padding: "20px", borderRadius: "12px", border: "1px solid #eee" };
