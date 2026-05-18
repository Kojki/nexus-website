"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function Navbar() {
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  // 現在のページが英語版（/en から始まるパス）かどうかを判定
  const isEn = pathname.startsWith("/en");

  // JP（日本語）クリック時の遷移先を動的に決定
  const jpLink = isEn 
    ? pathname.replace(/^\/en/, "") || "/" 
    : pathname;

  // EN（英語）クリック時の遷移先を動的に決定
  const enLink = isEn 
    ? pathname 
    : (pathname === "/" ? "/en" : (pathname === "/about" ? "/en/about" : "/en"));

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
      <Link className="nav-logo" href={isEn ? "/en" : "/"} aria-label="Nexus ホーム">
        <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
        Nexus
      </Link>
      
      <div className="nav-links" style={{ display: "flex", alignItems: "center" }}>
        {/* 英語サイト滞在時は ABOUT メニューも自動的に英語版のアバウトページを指すように切り替え */}
        <Link href={isEn ? "/en/about" : "/about"}>ABOUT</Link>
        <Link href="/activity-log">ACTIVITY</Link> 
        <Link href="/projects">PROJECTS</Link>     
        <Link href="/members">MEMBERS</Link>       
        <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
          {isEn ? "Join Us" : "参加する"}
        </a>
        
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

        <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "12px" }}>
          {isEn ? (
            <Link href={jpLink} style={{ color: "var(--muted)", textDecoration: "none" }}>JP</Link>
          ) : (
            <span style={{ color: "var(--ink)" }}>JP</span>
          )}
          
          <span style={{ color: "var(--border)" }}>|</span>
          
          {isEn ? (
            <span style={{ color: "var(--ink)" }}>EN</span>
          ) : (
            <Link href={enLink} style={{ color: "var(--muted)", textDecoration: "none" }}>EN</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
