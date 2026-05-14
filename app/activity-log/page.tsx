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
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
            Nexusはまだ始まったばかりです。
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto", maxWidth: "520px", lineHeight: 1.8 }}>
            対話の記録、共創の軌跡、発見の瞬間——<br />
            あなたの参加が、Nexus最初の活動記録になります。
          </p>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer" style={{ marginTop: "28px" }}>
            最初のメンバーになる →
          </a>
        </div>

        {/* 実際の活動ログ（data.tsから取得） */}
        {activities.length > 0 && (
          <div style={{ marginBottom: "80px" }}>
            <p className="section-label" style={{ marginBottom: "32px" }}>最新の活動</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {activities.map((item, index) => (
                <Link 
                  key={item.id} 
                  href={`/activity-log/${item.id}`}
                  className="animate-slide-up"
                  style={{ 
                    display: "block",
                    padding: "32px",
                    background: "var(--warm-white)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    textDecoration: "none",
                    transition: "transform 0.3s ease",
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", background: "var(--accent-pale)", padding: "4px 12px", borderRadius: "999px" }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{item.date}</span>
                  </div>
                  <h3 style={{ fontSize: "1.25rem", color: "var(--ink)", marginBottom: "8px" }}>{item.title}</h3>
                  <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{item.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 将来の予定カテゴリ（プレースホルダー） */}
        <p className="section-label" style={{ marginBottom: "32px" }}>これからの活動予定</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "80px" }}>
          {futureCategories.map((item, index) => (
            <div
              key={item.tag}
              className="animate-slide-up"
              style={{
                padding: "32px",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                background: "var(--cream)",
                opacity: 0.6,
                animationDelay: `${(index + activities.length + 1) * 100}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: "4px" }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>準備中</span>
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", color: "var(--ink)", opacity: 0.8 }}>
                {item.label}の記録
              </h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* フッター（共通） */}
      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>専門を学ぶすべての学生へ</p>
        <nav className="footer-links">
          <Link href="/">トップ</Link>
          <Link href="/about">About</Link>
          <Link href="/join">参加の流れ</Link>
          <Link href="/members">運営メンバー</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/guidelines">ガイドライン</Link>
          <Link href="/activity-log">活動記録</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </nav>
      </footer>
    </main>
  );
}
