import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const renderText = (text: string) => {
  if (!text) return null;
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};

export default async function About() {
  // 英語版AboutページのコンテンツをSupabaseから取得
  const { data: contentData } = await supabase
    .from('site_content')
    .select('content_key, content_value')
    .eq('page_path', 'en_about');

  const content: Record<string, string> = {};
  contentData?.forEach(item => {
    content[item.content_key] = item.content_value;
  });

  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>About Nexus</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            {renderText(get('hero_title', 'Where disciplines intersect.\nWhere you meet\nyour future self.'))}
          </h1>
        </div>
      </header>

      <section className="concept-container">
        {[1, 2, 3].map((num) => (
          <div key={num} className={`concept-block animate-slide-up delay-${num}00`}>
            <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
              {renderText(get(`block_${num}_title`, '...'))}
            </span>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
              <p>{renderText(get(`block_${num}_body`, '...'))}</p>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost" href="/en">
            Back to Home
          </Link>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Join Nexus
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}

