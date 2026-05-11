import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const placeholders = [
  {
    tag: "対話",
    title: "Coming Soon...",
    desc: "異なる専門を持つメンバーが、ある問いをきっかけに議論を交わした記録が、ここに残ります。",
  },
  {
    tag: "共創",
    title: "Coming Soon...",
    desc: "専門を持ち寄って何かを一緒に形にした、共創プロジェクトの記録が、ここに残ります。",
  },
  {
    tag: "発見",
    title: "Coming Soon...",
    desc: "メンバーが共有した本・記事・動画が、思いがけない繋がりを生んだ瞬間の記録が、ここに残ります。",
  },
];

export default function ActivityLog() {
  return (
    <main>
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            参加する
          </a>
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

        {/* Coming Soon メッセージ */}
        <div
          className="animate-slide-up"
          style={{
            textAlign: "center",
            padding: "48px 32px",
            background: "var(--accent-pale)",
            borderRadius: "20px",
            border: "1px dashed var(--accent-light)",
            marginBottom: "64px",
          }}
        >
          <p style={{ fontSize: "2rem", margin: "0 0 16px", lineHeight: 1 }}>🌱</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" }}>
            Nexusはまだ始まったばかりです。
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto", maxWidth: "520px", lineHeight: 1.8 }}>
            このページは、コミュニティの成長とともに育っていきます。<br />
            対話の記録、共創の軌跡、発見の瞬間——<br />
            あなたの参加が、Nexus最初の活動記録になります。
          </p>
          <a
            className="button button-dark"
            href={joinUrl}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: "28px", display: "inline-flex" }}
          >
            最初のメンバーになる
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* プレースホルダーカード */}
        <p className="section-label" style={{ marginBottom: "24px" }}>こんな記録が増えていく予定です</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {placeholders.map((item, index) => (
            <div
              key={index}
              className="animate-slide-up"
              style={{
                padding: "32px",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                background: "var(--warm-white)",
                opacity: 0.5,
                animationDelay: `${(index + 1) * 100}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--accent)",
                  background: "var(--accent-pale)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  letterSpacing: "0.06em",
                }}>
                  {item.tag}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>準備中</span>
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: "1.1rem", color: "var(--muted)", fontWeight: 600 }}>
                {item.title}
              </h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </section>

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>意欲あるすべての学生へ</p>
        <nav className="footer-links" aria-label="フッターナビゲーション">
          <Link href="/">トップ</Link>
          <Link href="/about">About</Link>
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
