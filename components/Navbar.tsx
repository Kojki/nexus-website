import Image from "next/image";
import Link from "next/link";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function Navbar() {
  return (
    <nav className="site-nav" aria-label="メインナビゲーション">
      <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
        <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
        Nexus
      </Link>
           <div className="nav-links">
        <Link href="/about">ABOUT</Link>
        <Link href="/activity-log">ACTIVITY</Link> 
        <Link href="/projects">PROJECTS</Link>     
        <Link href="/members">MEMBERS</Link>       
        <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        {/* 言語切り替えボタン（全ページ共通化） */}
        <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "8px" }}>
          <span style={{ color: "var(--ink)" }}>JP</span>
          <span style={{ color: "var(--border)" }}>|</span>
          <Link href="/en" style={{ color: "var(--muted)", textDecoration: "none" }}>EN</Link>
        </div>
      </div>

    </nav>
  );
}
