import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function FAQ() {
  // データベースからFAQを取得
  const { data: faqs } = await supabase
    .from('faqs')
    .select('*')
    .order('order_index', { ascending: true });

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
          {faqs?.map((item, index) => (
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
