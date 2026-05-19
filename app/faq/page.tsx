"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function FAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌐 ブラウザ（クライアント）側で開いた瞬間に最新のデータをSupabaseから取得する
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data } = await supabase
          .from('faqs')
          .select('*')
          .eq('is_published', true)
          .order('order_index', { ascending: true });

        if (data) setFaqs(data);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

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
          LOADING FAQ...
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
          <p className="eyebrow" style={{ justifyContent: "center" }}>FAQ</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center"}}>よくある質問</h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>参加を迷っている方へ。気になる疑問にお答えします。</p>
        </div>
      </header>

      <section className="concept-container">
        <div className="faq-list">
          {faqs.map((item, index) => (
            <div key={item.id} className="faq-item animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
              <div className="faq-q">
                <span className="faq-mark">Q</span>
                <h2>{item.question}</h2>
              </div>
              <div className="faq-a">
                <span className="faq-mark faq-mark-a">A</span>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost" href="/guidelines">コミュニティガイドラインを読む</Link>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

