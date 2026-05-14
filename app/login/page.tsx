"use client";

import { supabase } from "@/lib/supabase"; // パスは適宜調整してください
import Image from "next/image";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/editor`, // ログイン後にエディタへ
      },
    });

    if (error) {
      alert("ログインエラー: " + error.message);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ background: "white", padding: "48px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "400px", width: "90%" }}>
        <Image src="/nexus-icon.png" alt="Nexus Logo" width={60} height={60} style={{ marginBottom: "24px" }} />
        <h1 style={{ fontSize: "1.5rem", marginBottom: "8px", fontWeight: 700 }}>Admin Login</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: "32px", fontSize: "0.9rem" }}>
          運営メンバー専用のログイン画面です。
        </p>

        <button 
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600,
            transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
        >
          {/* Googleのアイコン（簡易的にテキストで代用、必要に応じてImageに変更してください） */}
          <span style={{ color: "#4285F4", fontSize: "1.2rem", fontWeight: "bold" }}>G</span>
          Googleでログイン
        </button>

        <div style={{ marginTop: "32px" }}>
          <Link href="/" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>
            ← トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

// Linkを使いたいのでインポートを追加
import Link from "next/link";
