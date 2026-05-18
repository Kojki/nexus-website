import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";
const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

// 改行（\n や 実際の改行コード）を正しく <br /> に変換する共通関数
const renderText = (text: string) => {
  if (!text) return null;
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};

// マークダウンパーサーに渡す前に \n などの文字列改行を実際の改行に事前置換する関数
const formatMarkdownText = (text: string) => {
  if (!text) return "";
  return text.replace(/\\n/g, "\n");
};

export default async function Guidelines() {
  const { data: contentData } = await supabase.from('site_content').select('*').eq('page_path', 'guidelines');
  const content: Record<string, string> = {};
  contentData?.forEach(item => { content[item.content_key] = item.content_value; });
  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>GUIDELINES</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center", lineHeight: 1.2 }}>
            {renderText(get('hero_title', 'コミュニティ\nガイドライン'))}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            Nexusを全員にとって安全で有意義な場にするために。
          </p>
        </div>
      </header>

      <section className="concept-container">
        {/* 前文（マークダウン対応 ＆ 改行調整） */}
        <div className="concept-block animate-slide-up delay-100" style={{ marginBottom: "32px" }}>
          {renderMarkdown(formatMarkdownText(get('intro_text', 'Nexusは、学びの意欲があるすべての学生に向けたコミュニティです。')))}
        </div>

        <div className="guidelines-list">
          {[1, 2, 3].map((num) => (
            <div key={num} className="guideline-item concept-block animate-slide-up" style={{ animationDelay: `${(num) * 120}ms` }}>
              <div className="guideline-header">
                <span className="guideline-num">0{num}</span>
                <h2>{renderText(get(`rule_${num}_title`, `ルール 0${num}`)) ?? `ルール 0${num}`}</h2>
              </div>
              
              {/* ルール詳細本文（マークダウン対応 ＆ 改行調整） */}
              <div>
                {renderMarkdown(formatMarkdownText(get(`rule_${num}_body`, 'ここにルールの詳細が入ります。')))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

