"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 初回ロード時に保存されたテーマまたはOS設定を確認して適用
    const savedTheme = localStorage.getItem("nexus-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.body.classList.add("dark-theme");
    } else {
      setIsDark(false);
      document.body.classList.remove("dark-theme");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("nexus-theme", "light");
      setIsDark(false);
    } else {
      document.body.classList.add("dark-theme");
      localStorage.setItem("nexus-theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <nav className="site-nav" aria-label="メインナビゲーション">
      <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
        <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
        Nexus
      </Link>
      
      <div className="nav-links" style={{ display: "flex", alignItems: "center" }}>
        <Link href="/about">ABOUT</Link>
        <Link href="/activity-log">ACTIVITY</Link> 
        <Link href="/projects">PROJECTS</Link>     
        <Link href="/members">MEMBERS</Link>       
        <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        
        {/* 🌙 / ☀️ テーマ切替スイッチ */}
        <button 
          onClick={toggleTheme}
          aria-label="テーマ切り替え"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.15rem",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            color: "var(--ink)",
            transition: "transform 0.2s ease",
            marginLeft: "8px"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1.0)"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>

        {/* 言語切り替え */}
        <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "12px" }}>
          <span style={{ color: "var(--ink)" }}>JP</span>
          <span style={{ color: "var(--border)" }}>|</span>
          <Link href="/en" style={{ color: "var(--muted)", textDecoration: "none" }}>EN</Link>
        </div>
      </div>
    </nav>
  );
}

