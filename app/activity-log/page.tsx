import Image from "next/image";
import Link from "next/link";
import { activities } from "./data";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

// 新方針に基づいた予定カテゴリ
const futureCategories = [
  { tag: "DIALOGUE", label: "対話", desc: "専門の異なるメンバーが、ある問いをきっかけに議論を交わした記録。" },
  { tag: "KNOWLEDGE", label: "知見", desc: "メンバーが共有した本や論文が、新しい視点を生んだ瞬間の記録。" },
  { tag: "PROJECT", label: "共創", desc: "専門を持ち寄って何かを一緒に形にした、共創プロジェクトの軌跡。" },
  { tag: "COMMUNITY", label: "運営", desc: "コミュニティの歩みや、運営に関する重要なお知らせの記録。" },
];

export default function ActivityLogIndex() {
  return (
    <main>
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>ACTIVITY LOG</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            活動の記録
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            Nexusの歩みを、ここに残していきます。
          </p>
        </div>
      </header>

      <section className="concept-container">
        {/* 導入メッセージ */}
        <div
          className="animate-slide-up"
          style={{
            textAlign: "center",
            padding: "56px 32px",
            background: "var(--accent-pale)",
            borderRadius: "24px",
            border: "1px dashed var(--accent-light)",
            marginBottom: "80px",
          }}
        >
          <p style={{ fontSize: "2rem", margin: "0 0 16px", lineHeight: 1 }}>🌱</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 70
