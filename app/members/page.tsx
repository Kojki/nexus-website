import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

// ★ メンバー情報をここに入力してください
const members = [
  {
    name: "Kojki",           // 例: 山田 太郎
    role: "設立者",
    affiliation: "九州工業大学 工学部",
    field: "電気電子、量子アルゴリズム",
    message:  `昔適当に作ったハンドルネームのせいで読み方がわかりずらいと思うのですが、特に私も読み方を決めていないので自由に呼んでいただいて構いません。
    2026年5月にこのコミュニティを立ち上げましたが、本当にゼロのところから何かを作るというのは初めてで、インスタの投稿、サイト構築、メンバー集めなど、全てが手探りの状態でやっています。
    そんな中でも、同じように「何かをしてみたい」と思う学生が集まってくれて、少しずつコミュニティが形になってきているのはとても嬉しいです。
    これから、より活力のあるコミュニティに育てあげていきたいと思っております。よろしくお願いします。 `,
    // photo: "/members/member-a.jpg",  // 写真を使いたい場合はコメントアウトを外してください
  },
];

export default function Members() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>MEMBERS</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            運営メンバー
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            Nexusをつくっている学生たちです。
          </p>
        </div>
      </header>

      <section className="concept-container">

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "80px" }}>
          {members.map((member, index) => (
            <div
              key={member.name}
              className="animate-slide-up"
              style={{
                padding: "36px 32px",
                background: "var(--warm-white)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                animationDelay: `${index * 120}ms`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {/* アバター */}
              <div style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "var(--accent-pale)",
                border: "2px solid var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                color: "var(--accent)",
              }}>
                👤
              </div>

              {/* 役割バッジ */}
              <span style={{
                display: "inline-block",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent)",
                background: "var(--accent-pale)",
                padding: "4px 12px",
                borderRadius: "999px",
                letterSpacing: "0.06em",
                alignSelf: "flex-start",
              }}>
                {member.role}
              </span>

              {/* 名前 */}
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>
                  {member.name}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>
                  {member.affiliation}
                </p>
              </div>

              {/* 専門分野 */}
              <div style={{ padding: "12px 16px", background: "var(--cream)", borderRadius: "10px" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)", margin: "0 0 4px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Field
                </p>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.6 }}>
                  {member.field}
                </p>
              </div>

              {/* メッセージ */}
              <p style={{
                fontSize: "0.95rem",
                color: "var(--ink-soft)",
                margin: 0,
                lineHeight: 1.8,
                fontStyle: "italic",
                borderLeft: "3px solid var(--accent-light)",
                paddingLeft: "12px",
              }}>
                &ldquo;{member.message}&rdquo;
              </p>
            </div>
          ))}
        </div>

        {/* 参加募集 */}
        <div
          className="animate-slide-up"
          style={{
            textAlign: "center",
            padding: "48px 32px",
            background: "var(--cream)",
            borderRadius: "20px",
            border: "1px solid var(--border)",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", margin: "0 0 12px" }}>
            運営に興味がありますか？
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: 1.8 }}>
            Nexusの運営メンバーは随時募集中です。コミュニティを一緒に育てていきたい方は、お気軽にご連絡ください。
          </p>
          <Link className="button button-ghost" href="/contact">
            お問い合わせから連絡する
            <span aria-hidden="true">→</span>
          </Link>
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
