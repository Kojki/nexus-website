import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const headingStyle = {
  fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
  color: "var(--accent)",
  marginBottom: "16px",
  fontFamily: "var(--font-jp), sans-serif",
  fontWeight: 700,
};

const policySections = [
  {
    title: "1. 事業者情報",
    content: [
      "Nexus（以下「当コミュニティ」）は、本ウェブサイトおよび関連サービスにおけるユーザー情報の取り扱いについて、以下の通りプライバシーポリシーを定めます。",
      "運営に関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。",
    ],
  },
  {
    title: "2. 取得する情報",
    content: [
      "当コミュニティでは、以下の情報を取得する場合があります。",
      "・氏名、メールアドレスその他お問い合わせ時に入力された情報",
      "・閲覧ページ、アクセス日時等のアクセスログ",
      "・Cookieその他類似技術によって取得される利用情報",
    ],
  },
  {
    title: "3. 利用目的",
    content: [
      "取得した情報は、以下の目的の範囲内で利用します。",
      "・お問い合わせへの対応",
      "・コミュニティ運営および利用者サポート",
      "・サービス改善およびコンテンツ品質向上",
      "・不正利用の防止および安全性確保",
      "・アクセス解析による利用状況の把握",
      "・重要なお知らせ等の通知",
    ],
  },
  {
    title: "4. Cookieの利用について",
    content: [
      "当サイトでは、利便性向上および利用状況分析、広告配信のためにCookieを使用しています。",
      "Cookieは、ユーザーのブラウザを識別するための仕組みであり、個人を直接特定する情報を含むものではありません。",
      "ユーザーは、ブラウザ設定によりCookieを無効化することができます。ただし、一部機能が正常に利用できなくなる場合があります。",
    ],
  },
  {
    title: "5. アクセス解析ツールについて",
    content: [
      "当サイトでは、Google LLC が提供する Google Analytics を利用しています。",
      "Google Analytics は、Cookieを利用して利用状況を収集します。収集される情報は匿名であり、個人を特定するものではありません。",
      "Google Analytics に関する詳細は、Google社の関連ポリシーをご確認ください。",
    ],
  },
  {
    title: "6. 広告配信について",
    content: [
      "当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。",
      "広告配信事業者は、ユーザーの興味関心に応じた広告を表示するため、Cookie等を利用することがあります。これらの情報には、氏名、住所、メールアドレス等の個人を特定する情報は含まれません。",
    ],
  },
  {
    title: "7. 第三者提供について",
    content: [
      "当コミュニティは、法令に基づく場合を除き、本人の同意なく個人情報を第三者へ提供しません。",
    ],
  },
  {
    title: "8. 安全管理措置",
    content: [
      "当コミュニティは、取得した情報について、漏えい、滅失、改ざん等を防止するため、適切な安全管理措置を講じます。",
    ],
  },
  {
    title: "9. 開示・訂正・削除等について",
    content: [
      "ユーザー本人から、自己の個人情報について開示、訂正、削除等の請求があった場合には、合理的な範囲で速やかに対応します。ご希望の場合は、お問い合わせフォームよりご連絡ください。",
    ],
  },
  {
    title: "10. プライバシーポリシーの変更",
    content: [
      "当コミュニティは、必要に応じて本ポリシーを変更することがあります。変更後の内容は、本ページに掲載した時点で効力を生じるものとします。",
    ],
  },
  {
    title: "11. お問い合わせ",
    content: [
      "本ポリシーに関するお問い合わせは、当サイトのお問い合わせフォームよりご連絡ください。",
    ],
  },
];

export default function PrivacyPolicy() {
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            プライバシーポリシー
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            最終更新日：2026年5月
          </p>
        </div>
      </header>

      <section className="concept-container">
        {policySections.map((section, index) => (
          <div 
            key={section.title} 
            className="concept-block animate-slide-up"
            style={{ animationDelay: `${(index + 1) * 50}ms` }}
          >
            <h2 style={headingStyle}>{section.title}</h2>
            {section.content.map((paragraph, pIndex) => (
              <p 
                key={pIndex} 
                style={{ 
                  marginBottom: pIndex === section.content.length - 1 ? 0 : "12px",
                  color: "var(--ink-soft)",
                  lineHeight: 1.8 
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "60px", paddingBottom: "40px" }}>
          <Link className="button button-ghost animate-slide-up" href="/">
            トップページへ戻る
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
