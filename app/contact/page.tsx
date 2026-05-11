
import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSeSnsHqJZIojBum9DuyC5aWzTL_t6117dk4IQaUOqhaB5l_9g/viewform?usp=publish-editor";

export default function Contact() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>CONTACT</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            お問い合わせ
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            ご質問・ご意見・取材のご依頼など、お気軽にどうぞ。
          </p>
        </div>
      </header>

      <section className="concept-container">

        {/* Google Form カード */}
        <div
          className="animate-slide-up delay-100"
          style={{
            padding: "48px 40px",
            background: "var(--warm-white)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "2rem", margin: "0 0 16px", lineHeight: 1 }}>📬</p>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 12px" }}>
            お問い合わせフォーム
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: 1.8 }}>
            ご質問・ご意見・企業や大学関係者の方からのご連絡など、以下のフォームよりお送りください。通常2〜3営業日以内にご返信いたします。
          </p>
          <a className="button button-dark" href={googleFormUrl} target="_blank" rel="noreferrer">
            フォームを開く
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* SNSリンク */}
        <div
          className="animate-slide-up delay-200"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "20px",
            marginBottom: "64px",
          }}
        >
          <a href={joinUrl} target="_blank" rel="noreferrer" className="contact-sns-card">
            <div className="contact-sns-icon" style={{ background: "#4A154B" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>Slack</p>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>コミュニティに参加する</p>
            </div>
          </a>

          <a href="https://www.instagram.com/nex.us_2026/?hl=ja" target="_blank" rel="noreferrer" className="contact-sns-card">
            <div className="contact-sns-icon" style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>Instagram</p>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.85rem" }}>@nex.us_2026</p>
            </div>
          </a>
        </div>

        <div className="animate-slide-up delay-300" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.8 }}>
            ※ 参加方法についてはまず <Link href="/faq" style={{ color: "var(--accent)", textDecoration: "underline" }}>FAQ</Link> をご覧ください。<br />
            ※ コミュニティへの参加はSlackのリンクから直接行えます。
          </p>
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
