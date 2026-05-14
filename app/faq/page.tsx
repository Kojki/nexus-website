import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const faqs = [
  {
    q: "まだ自分の専門や「やりたいこと」がなくても参加していいですか？",
    a: "はい、大歓迎です！Nexusは「やりたいことを探すための場」でもあります。まずは他のメンバーの活動や議論を見ているだけでも全く問題ありません。興味を持った話題にだけ反応するというスタイルでも十分です。",
  },
  {
    q: "参加費はかかりますか？",
    a: "完全無料です。意欲ある学生が誰でも平等に参加できる場を目指しているため、費用は一切いただきません。",
  },
  {
    q: "どんな学生が参加していますか？",
    a: "テクノロジー・ビジネス・デザイン・研究など、様々な分野に興味を持つ高校生・大学生が参加しています。「専門を持っている」「専門を探している」どちらの学生も大歓迎です。",
  },
  {
    q: "忙しくて頻繁に発信できなくても大丈夫ですか？",
    a: "大丈夫です。ご自身のペースで参加してください。気になる話題があった時だけ反応したり、質問を投げかけたりするだけでも立派な参加です。毎日投稿する義務は一切ありません。",
  },
  {
    q: "高校生でも参加できますか？",
    a: "はい、参加できます！「これから自分の進む道を探したい」という高校生の方も大歓迎です。大学生や様々な分野で活動する学生のリアルな姿を間近で見られる機会になると思います。",
  },
  {
    q: "退会したい時はどうすればいいですか？",
    a: "Slackのワークスペースからいつでも自由に退会していただけます。退会の手続きは非常に簡単で、Slackのアプリ上から数タップで完了します。退会を申請する必要はありません。",
  },
  {
    q: "英語が話せなくても大丈夫ですか？",
    a: "はい、日本語での参加が基本です。現在は日本の学生がメインで活動しており、コミュニケーションは基本的に日本語で行われています。",
  },
];

export default function FAQ() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>FAQ</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center"}}>
            よくある質問
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            参加を迷っている方へ。気になる疑問にお答えします。
          </p>
        </div>
      </header>

      <section className="concept-container">
        <div className="faq-list">
          {faqs.map((item, index) => (
            <div
              key={index}
              className="faq-item animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="faq-q">
                <span className="faq-mark">Q</span>
                <h2>{item.q}</h2>
              </div>
              <div className="faq-a">
                <span className="faq-mark faq-mark-a">A</span>
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost animate-slide-up" href="/guidelines">
            コミュニティガイドラインを読む
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
          <Link href="/members">メンバー紹介</Link>
        </nav>
      </footer>
    </main>
  );
}
