"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // 送り先を正しいパス（/activity-log/editor）に修正
        redirectTo: `${window.location.origin}/activity-log/editor`,
      },
    });

    if (error) {
      alert("ログインエラー: " + error.message);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
      <div style={{ background: "white", padding: "48px", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", maxWidth: "400px", width: "90%" }}>
        <div style={{ marginBottom: "24px" }}>
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={60} height={60} />
        </div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "8px", fontWeight: 700 }}>Admin Login</h1>
        <p style={{ color: "var(--ink-soft)", marginBottom: "32px", fontSize: "0.9rem" }}>
          運営メンバー専用のログイン画面です。
        </p>

        <button 
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 600
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Googleでログイン
        </button>

        <div style={{ marginTop: "32px" }}>
          <Link href="/" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>
            ← サイトに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
