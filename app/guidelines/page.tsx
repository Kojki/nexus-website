import Image from "next/image";
import Link from "next/link";
const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";
const guidelines = [
  {
    num: "01",
    title: "多様性を尊重する",
    body: "Nexusには、様々な専門・バックグラウンド・価値観を持つ学生が集まります。専門外からの素朴な疑問や、自分とは異なる意見・価値観を否定せず、リスペクトを持って対話することを大切にしてください。",
  },
  {
    num: "02",
    title: "心理的安全性を守る",
    body: "誰もが気兼ねなく発信できる場を作るために、攻撃的な発言・マウンティング（自分の優位性を必要以上にアピールすること）・過度な批判は禁止します。",
  },
  {
    num: "03",
    title: "過度な営業・勧誘の禁止",
    body: "純粋な学びと共創の場を守るため、ネットワークビジネス・宗教・過度な営利目的の勧誘活動はお断りしています。自身のプロジェクトや活動を共有することは歓迎しますが、参加者への押しつけは禁止します。",
  },
];
export default function Guidelines() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>GUIDELINES</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            コミュニティ<br />ガイドライン
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            Nexusを全員にとって安全で有意義な場にするために。
          </p>
        </div>
      </header>
      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100" style={{ marginBottom: "16px" }}>
          <p>
            Nexusは、学びの意欲があるすべての学生に開かれたコミュニティです。多様なバックグラウンドを持つ参加者が安心して発信・対話できる場を守るために、以下のガイドラインを設けています。
          </p>
          <p>
            Slackへの参加をもって、このガイドラインへの同意とみなします。
          </p>
        </div>
        <div className="guidelines-list">
          {guidelines.map((item, index) => (
            <div
              key={index}
              className="guideline-item concept-block animate-slide-up"
              style={{ animationDelay: `${(index + 1) * 120}ms` }}
            >
              <div className="guideline-header">
                <span className="guideline-num">{item.num}</span>
                <h2>{item.title}</h2>
              </div>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="concept-block animate-slide-up" style={{ marginTop: "48px", padding: "32px", background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "1.1rem" }}>ガイドライン違反への対応</h3>
          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            ガイドラインに反する言動が確認された場合、運営メンバーが注意・警告を行います。改善が見られない場合や、悪質と判断した場合には、ワークスペースから削除することがあります。快適な場の維持にご協力ください。
          </p>
        </div>
        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost animate-slide-up" href="/faq">
            よくある質問を読む
          </Link>
          <a className="button button-dark animate-slide-up" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する
            <span aria-hidden="true">→</span>
          </a>
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