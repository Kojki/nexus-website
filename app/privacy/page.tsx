"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { renderMarkdown } from "@/lib/markdown";

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

export default function PrivacyPolicy() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData } = await supabase.from('site_content').select('*').eq('page_path', 'privacy');
        const contentMap: Record<string, string> = {};
        contentData?.forEach(item => { contentMap[item.content_key] = item.content_value; });
        setContent(contentMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const get = (key: string, fallback: string) => content[key] || fallback;

  if (loading) {
    return (
      <main className="page-fade-in">
        <Navbar />
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          background: "#f8f7f4", 
          color: "#aaa", 
          fontSize: "0.85rem", 
          fontWeight: 800,
          letterSpacing: "0.15em",
          gap: "16px"
        }}>
          <div style={{
            width: "30px",
            height: "30px",
            border: "2px solid #ddd",
            borderTopColor: "var(--accent, #e65c00)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          LOADING...
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>LEGAL</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center", lineHeight: 1.2 }}>
            {renderText(get('hero_title', 'プライバシーポリシー'))}
          </h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>
            {get('last_updated', '最終更新日：2026年5月')}
          </p>
        </div>
      </header>

      <section className="concept-container">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => (
          get(`section_${num}_title`, '') !== '' && (
            <div key={num} className="concept-block animate-slide-up" style={{ animationDelay: `${num * 50}ms` }}>
              <h2 style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", color: "var(--accent)", marginBottom: "16px", fontWeight: 700 }}>
                {renderText(get(`section_${num}_title`, `${num}. 項目`)) ?? `${num}. 項目`}
              </h2>
              
              {/* 各条項本文（マークダウン対応 ＆ 改行調整） */}
              <div style={{ color: "var(--ink-soft)" }}>
                {renderMarkdown(formatMarkdownText(get(`section_${num}_body`, 'ここにプライバシー条文の詳細が入ります。')))}
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
