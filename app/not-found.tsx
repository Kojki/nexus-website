import Image from "next/image";
import Link from "next/link";
const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";
export default function NotFound() {
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
      <section
        className="hero"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        <div className="hero-content animate-slide-up">
          <p style={{
            fontFamily: "var(--font-display), serif",
            fontSize: "clamp(6rem, 20vw, 14rem)",
            fontWeight: 400,
            color: "var(--accent-pale)",
            lineHeight: 1,
            margin: "0 0 8px",
            letterSpacing: "-0.02em",
          }}>
            404
          </p>
          <p className="eyebrow" style={{ marginBottom: "20px" }}>
            PAGE NOT FOUND
          </p>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", marginBottom: "20px" }}>
            このページは見つかりませんでした。
          </h1>
          <p className="hero-copy" style={{ marginBottom: "40px" }}>
            URLが間違っているか、ページが移動・削除された可能性があります。<br />
            トップページから改めてご確認ください。
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/">
              トップページへ戻る
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="button button-ghost" href="/faq">
              FAQ を見る
            </Link>
          </div>
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