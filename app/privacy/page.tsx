import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

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
            最終更新日：2025年5月
          </p>
        </div>
      </header>

      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100">
          <p>
            Nexus（以下「当コミュニティ」）は、本ウェブサイト（nexus-connect.jp）および関連するサービスを通じて取得する個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-200">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            1. 取得する情報
          </span>
          <p>当コミュニティは、以下の情報を取得することがあります。</p>
          <ul style={{ color: "var(--ink-soft)", lineHeight: 2, paddingLeft: "20px" }}>
            <li>お問い合わせフォームにご入力いただいた氏名・メールアドレス・お問い合わせ内容</li>
            <li>本ウェブサイトへのアクセスに関する情報（閲覧ページ、滞在時間、アクセス元など）</li>
          </ul>
        </div>

        <div className="concept-block animate-slide-up delay-300">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            2. 情報の利用目的
          </span>
          <p>取得した情報は、以下の目的のみに使用します。</p>
          <ul style={{ color: "var(--ink-soft)", lineHeight: 2, paddingLeft: "20px" }}>
            <li>お問い合わせへのご返信</li>
            <li>ウェブサイトの改善・利便性向上のための分析</li>
            <li>コミュニティ運営に関する重要なお知らせの送付</li>
          </ul>
          <p>
            取得した個人情報を、上記の目的以外に使用することはありません。また、第三者への提供・販売は一切行いません。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-400">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            3. Google Analytics について
          </span>
          <p>
            本ウェブサイトでは、サイトの利用状況を把握するために <strong>Google Analytics</strong> を使用しています。Google Analyticsはアクセス情報の収集のためにCookieを使用しますが、個人を特定する情報は収集しません。
          </p>
          <p>
            収集された情報はGoogleのプライバシーポリシーに基づいて管理されます。Google Analyticsによるデータ収集を無効にしたい場合は、
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "underline" }}>
              Google アナリティクス オプトアウト アドオン
            </a>
            をご利用ください。
          </p>
        </div>

        <div className="concept-block animate-slide-up">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>
            4. お問い合わせ
          </span>
          <p>
            プライバシーポリシーに関するご質問・ご意見は、
            <Link href="/contact" style={{ color: "var(--accent)", textDecoration: "underline" }}>お問い合わせページ</Link>
            よりお送りください。
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
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
