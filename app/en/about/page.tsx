"use client";

import { useState, useEffect } from "react";
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

export default function About() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // 🌐 ブラウザ（クライアント）側で開いた瞬間に最新のデータをSupabaseから取得する
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: contentData } = await supabase
          .from('site_content')
          .select('content_key, content_value')
          .eq('page_path', 'en_about');

        const contentMap: Record<string, string> = {};
        contentData?.forEach(item => {
          contentMap[item.content_key] = item.content_value;
        });
        setContent(contentMap);
      } catch (err) {
        console.error("Failed to load content:", err);
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
          LOADING ABOUT...
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>About Nexus</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center", lineHeight: 1.2 }}>
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

