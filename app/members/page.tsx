import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl = "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function Members() {
  // データベースからメンバー一覧を取得
  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('is_published', true) // ▼ 今回の追加部分
    .order('order_index', { ascending: true });

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>MEMBERS</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", margin: "0 auto", textAlign: "center" }}>運営メンバー</h1>
          <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "1.05rem" }}>Nexusをつくっている学生たちです。</p>
        </div>
      </header>

      <section className="concept-container">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "80px" }}>
          {members?.map((member, index) => (
            <div key={member.id} className="animate-slide-up" style={{
              padding: "36px 32px", background: "var(--warm-white)", border: "1px solid var(--border)",
              borderRadius: "20px", display: "flex", flexDirection: "column", gap: "16px",
              animationDelay: `${index * 120}ms`, transition: "0.3s ease"
            }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--accent-pale)", border: "2px solid var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", color: "var(--accent)" }}>
                {member.photo_url ? <img src={member.photo_url} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : "👤"}
              </div>
              <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", background: "var(--accent-pale)", padding: "4px 12px", borderRadius: "999px", alignSelf: "flex-start" }}>
                {member.role}
              </span>
              <div>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 4px", color: "var(--ink)" }}>{member.name}</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>{member.affiliation}</p>
              </div>
              <div style={{ padding: "12px 16px", background: "var(--cream)", borderRadius: "10px" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--accent)", margin: "0 0 4px", textTransform: "uppercase" }}>Field</p>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-soft)", margin: 0 }}>{member.field}</p>
              </div>
              <p style={{ fontSize: "0.95rem", color: "var(--ink-soft)", margin: 0, lineHeight: 1.8, fontStyle: "italic", borderLeft: "3px solid var(--accent-light)", paddingLeft: "12px" }}>
                &ldquo;{member.message}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="animate-slide-up" style={{ textAlign: "center", padding: "48px 32px", background: "var(--cream)", borderRadius: "20px", border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "1.5rem", margin: "0 0 12px" }}>運営に興味がありますか？</h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 auto 28px", maxWidth: "480px", lineHeight: 1.8 }}>Nexusの運営メンバーは随時募集中です。コミュニティを一緒に育てていきたい方は、お気軽にご連絡ください。</p>
          <Link className="button button-ghost" href="/contact">お問い合わせから連絡する →</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
