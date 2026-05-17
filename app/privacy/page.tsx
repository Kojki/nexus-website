import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const renderText = (text: string) => {
  if (!text) return null;
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};

export default async function PrivacyPolicy() {
  const { data: contentData } = await supabase.from('site_content').select('*').eq('page_path', 'privacy');
  const content: Record<string, string> = {};
  contentData?.forEach(item => { content[item.content_key] = item.content_value; });
  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>
            {renderText(get('hero_title', 'プライバシーポリシー'))}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            {renderText(get('last_updated', '最終更新日：2026年5月'))}
          </p>
        </div>
      </header>

      <section className="concept-container">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
          get(`section_${num}_title`, '') !== '' && (
            <div key={num} className="concept-block animate-slide-up" style={{ animationDelay: `${num * 50}ms` }}>
              <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: "var(--accent)", marginBottom: "16px", fontWeight: 700 }}>
                {renderText(get(`section_${num}_title`, `${num}. 項目`))}
              </h2>
              <div style={{ whiteSpace: "pre-wrap", color: "var(--ink-soft)", lineHeight: 1.8 }}>
                <p>{renderText(get(`section_${num}_body`, '...'))}</p>
              </div>
            </div>
          )
        ))}

        <div style={{ textAlign: "center", marginTop: "60px", paddingBottom: "40px" }}>
          <Link className="button button-ghost" href="/">トップページへ戻る</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
