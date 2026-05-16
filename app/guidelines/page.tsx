import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function Guidelines() {
  const { data: contentData } = await supabase.from('site_content').select('*').eq('page_path', 'guidelines');
  const content: Record<string, string> = {};
  contentData?.forEach(item => { content[item.content_key] = item.content_value; });
  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Logo" width={34} height={34} priority /> Nexus</Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">参加する</a>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>GUIDELINES</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            {get('hero_title', 'コミュニティ\nガイドライン').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>Nexusを全員にとって安全で有意義な場にするために。</p>
        </div>
      </header>

      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100" style={{ marginBottom: "32px", whiteSpace: "pre-wrap" }}>
          <p>{get('intro_text', 'Nexusは、学びの意欲があるすべての学生に...')}</p>
        </div>

        <div className="guidelines-list">
          {[1, 2, 3].map((num) => (
            <div key={num} className="guideline-item concept-block animate-slide-up" style={{ animationDelay: `${(num) * 120}ms` }}>
              <div className="guideline-header">
                <span className="guideline-num">0{num}</span>
                <h2>{get(`rule_${num}_title`, '...')}</h2>
              </div>
              <p>{get(`rule_${num}_body`, '...')}</p>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-brand"><Image src="/nexus-icon.png" alt="Logo" width={30} height={30} /> Nexus</div>
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
