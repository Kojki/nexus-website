import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function About() {
  // コンテンツ取得
  const { data: contentData } = await supabase
    .from('site_content')
    .select('content_key, content_value')
    .eq('page_path', 'about');

  const content: Record<string, string> = {};
  contentData?.forEach(item => { content[item.content_key] = item.content_value; });
  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority /> Nexus</Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
          <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "8px" }}>
            <span style={{ color: "var(--ink)" }}>JP</span>
            <span style={{ color: "var(--border)" }}>|</span>
            <Link href="/en/about" style={{ color: "var(--muted)", textDecoration: "none" }}>EN</Link>
          </div>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>About Nexus</p>
          <h1>
            {get('hero_title', '専門が交わる場所。\n未来の自分に\n出会う場所。').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
        </div>
      </header>

      <section className="concept-container">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`concept-block animate-slide-up delay-${num}00`}>
            <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
              {get(`block_${num}_title`, '...')}
            </span>
            <div style={{ whiteSpace: "pre-wrap" }}>
              <p>{get(`block_${num}_body`, '...')}</p>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost" href="/">トップページへ戻る</Link>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><Image src="/nexus-icon.png" alt="Logo" width={30} height={30} /> Nexus</div>
        <p>意欲あるすべての学生へ</p>
        <nav className="footer-links">
          <Link href="/">トップ</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/guidelines">ガイドライン</Link>
          <Link href="/activity-log">活動記録</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/members">メンバー紹介</Link>
          <Link href="/login" style={{ opacity: 0.3, fontSize: '0.7rem' }}>Admin</Link>
        </nav>
      </footer>
    </main>
  );
}
