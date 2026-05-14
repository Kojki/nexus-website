"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // パスを確認してください
import { useRouter } from "next/navigation";
import { ActivityCategory } from "../types";

export default function NexusEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // フォームの状態
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0].replace(/-/g, '.'));
  const [category, setCategory] = useState<ActivityCategory>("DIALOGUE");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [hasDetail, setHasDetail] = useState(true);
  const [slug, setSlug] = useState("");

  // 1. ログインチェック
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // ログインしていなければログイン画面へ
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // 2. データベースへ保存（公開）
  const handlePublish = async () => {
    setPublishing(true);
    const { error } = await supabase
      .from('activities')
      .insert([
        { 
          title, 
          date, 
          category, 
          summary, 
          content, 
          has_detail: hasDetail, 
          slug 
        }
      ]);

    if (error) {
      alert("公開エラー: " + error.message);
    } else {
      alert("公開しました！");
      router.push("/activity-log"); // 公開後は一覧へ
    }
    setPublishing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>読み込み中...</div>;

  return (
    <main style={{ background: "#f8f9fa", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h1 style={{ fontWeight: 700 }}>Nexus Editor</h1>
          <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }}>ログアウト</button>
        </div>
        
        <section style={{ background: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <label style={labelStyle}>タイトル: <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="例：Nexus 公式サイト 公開" /></label>
            <label style={labelStyle}>日付: <input style={inputStyle} value={date} onChange={e => setDate(e.target.value)} /></label>
            <label style={labelStyle}>Slug (URL用のID): <input style={inputStyle} value={slug} onChange={e => setSlug(e.target.value)} placeholder="例：website-launch" /></label>
            <label style={labelStyle}>カテゴリ: 
              <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value as ActivityCategory)}>
                <option value="DIALOGUE">DIALOGUE (対話)</option>
                <option value="KNOWLEDGE">KNOWLEDGE (知見)</option>
                <option value="PROJECT">PROJECT (共創)</option>
                <option value="COMMUNITY">COMMUNITY (運営)</option>
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 600 }}>
              詳細ページの有無: 
              <input type="checkbox" checked={hasDetail} onChange={e => setHasDetail(e.target.checked)} />
            </label>
            <label style={labelStyle}>要約 (一覧に表示): <textarea style={{...inputStyle, height: "80px"}} value={summary} onChange={e => setSummary(e.target.value)} /></label>
            <label style={labelStyle}>本文 (詳細ページの内容): <textarea style={{...inputStyle, height: "200px"}} value={content} onChange={e => setContent(e.target.value)} /></label>
            
            <button 
              onClick={handlePublish}
              disabled={publishing}
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "var(--accent)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: publishing ? "not-allowed" : "pointer",
                opacity: publishing ? 0.7 : 1
              }}
            >
              {publishing ? "公開中..." : "この記事を公開する"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const labelStyle = { fontWeight: 600, display: "block" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px", boxSizing: "border-box" as const };
