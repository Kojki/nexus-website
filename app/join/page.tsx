import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const steps = [
  {
    num: "01",
    title: "Slackに参加する",
    body: "上部または下部の「参加する」ボタンから、NexusのSlackワークスペースに参加します。メールアドレスだけで登録できます。費用は一切かかりません。",
    note: "所要時間：約2分",
  },
  {
    num: "02",
    title: "自己紹介チャンネルに投稿する",
    body: "参加後は #自己紹介 チャンネルに、自分の専門・興味・参加の理由などを自由に投稿してみてください。どんな内容でも大歓迎です。",
    note: "書くのが難しければ、「見るだけ」も全然OKです",
  },
  {
    num: "03",
    title: "気になる会話に参加してみる",
    body: "各チャンネルを眺めて、気になった話題にリアクション（絵文字）を押したり、コメントしてみましょう。それだけで立派な参加です。",
    note: "まずは観察するだけでも大丈夫です",
  },
];

const channels = [
  { name: "#自己紹介", desc: "参加したらまずここへ。どんな人でも歓迎します。" },
  { name: "#問いを持ち寄る", desc: "専門外の疑問や気になることを気軽に投稿しましょう。" },
  { name: "#これ読んだ観た聞いた", desc: "おすすめの本・記事・動画を共有するチャンネル。" },
  { name: "#活動報告", desc: "自分の活動・進捗・取り組みを共有する場所。" },
  { name: "#雑談", desc: "なんでもOKの自由な場所。" },
];

export default function JoinPage() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>HOW TO JOIN</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            参加の流れ
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            3ステップで、すぐに始められます。
          </p>
        </div>
      </header>

      <section className="concept-container">

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "80px" }}>
          {steps.map((step, index) => (
            <div
              key={step.num}
              className="animate-slide-up"
              style={{
                display: "flex",
                gap: "32px",
                padding: "48px 0",
                borderBottom: index < steps.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "flex-start",
                animationDelay: `${index * 120}ms`,
              }}
            >
              {/* Step Number */}
              <div style={{
                flexShrink: 0,
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "var(--accent-pale)",
                border: "2px solid var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display), serif",
                fontSize: "1.4rem",
                fontWeight: 500,
                color: "var(--accent)",
              }}>
                {step.num}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: "0 0 16px", color: "var(--ink)" }}>
                  {step.title}
                </h2>
                <p style={{ color: "var(--ink-soft)", lineHeight: 1.8, margin: "0 0 12px", fontSize: "1rem" }}>
                  {step.body}
                </p>
                <span style={{
                  fontSize: "0.82rem",
                  color: "var(--accent)",
                  fontWeight: 600,
                  background: "var(--accent-pale)",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  display: "inline-block",
                }}>
                  💡 {step.note}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="animate-slide-up"
          style={{
            textAlign: "center",
            padding: "56px 40px",
            background: "var(--accent-pale)",
            borderRadius: "20px",
            border: "1px solid var(--accent-light)",
            marginBottom: "80px",
          }}
        >
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 16px" }}>
            準備はできましたか？
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: 1.8 }}>
            参加は完全無料。メールアドレスがあればすぐに始められます。<br />
            まずは眺めるだけでも大歓迎です。
          </p>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Channels Preview */}
        <div className="animate-slide-up">
          <p className="section-label" style={{ marginBottom: "24px" }}>参加後に使えるチャンネル（一例）</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {channels.map((ch) => (
              <div
                key={ch.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 24px",
                  background: "var(--warm-white)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                }}
              >
                <span style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontSize: "0.95rem",
                  flexShrink: 0,
                  minWidth: "200px",
                }}>
                  {ch.name}
                </span>
                <span style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>{ch.desc}</span>
              </div>
            ))}
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
          <Link href="/members">メンバー紹介</Link>
        </nav>
      </footer>
    </main>
  );
}
