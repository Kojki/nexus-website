import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// ビルド時にSupabaseから全記事のID（slug）を取得して、ページを生成する
export async function generateStaticParams() {
  const { data: activities } = await supabase.from('activities').select('slug');
  
  if (!activities) return [];

  return activities.map((activity) => ({
    id: activity.slug,
  }));
}

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  // サーバーサイドでデータを取得
  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', params.id)
    .single();

  if (!activity) {
    notFound();
  }

  return (
    <main>
      <nav className="site-nav">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Logo" width={34} height={34} /> Nexus</Link>
        <div className="nav-links"><Link href="/activity-log">一覧に戻る</Link></div>
      </nav>

      <article className="concept-container" style={{ paddingTop: "120px", maxWidth: "800px" }}>
        <div className="animate-slide-up">
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ background: "var(--accent-pale)", color: "var(--accent)", padding: "4px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700 }}>
              {activity.category}
            </span>
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{activity.date}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", marginBottom: "40px", lineHeight: 1.3 }}>{activity.title}</h1>
          
          <div style={{ 
            color: "var(--ink-soft)", 
            lineHeight: 2, 
            fontSize: "1.05rem",
            whiteSpace: "pre-wrap",
            marginBottom: "60px"
          }}>
            {activity.content}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "40px", textAlign: "center" }}>
            <Link href="/activity-log" className="button button-ghost">一覧へ戻る</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
