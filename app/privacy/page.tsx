import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function PrivacyPolicy() {
  const { data: contentData } = await supabase.from('site_content').select('*').eq('page_path', 'privacy');
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            {get('hero_title', 'プライバシーポリシー')}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            {get('last_updated', '最終更新日：2026年5月')}
          </p>
        </div>
      </header>

      <section className="concept-container">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
          <div key={num} className="concept-block animate-slide-up" style={{ animationDelay: `${num * 50}ms` }}>
            <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: "var(--accent)", marginBottom: "16px", fontWeight: 700 }}>
              {get(`section_${num}_title`, `${num}. 項目`)}
            </h2>
            <div style={{ whiteSpace: "pre-wrap", color: "var(--ink-soft)", lineHeight: 1.8 }}>
              <p>{get(`section_${num}_body`, '...')}</p>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "60px", paddingBottom: "40px" }}>
          <Link className="button button-ghost" href="/">トップページへ戻る</Link>
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

