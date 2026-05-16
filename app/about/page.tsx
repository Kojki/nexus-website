import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <Navbar />

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

      <Footer />
    </main>
  );
}
