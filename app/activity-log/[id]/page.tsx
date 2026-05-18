import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { renderMarkdown } from "@/lib/markdown"; 

// 静的エクスポート（output: export）に対応するため false に設定
export const dynamicParams = false;

// 1. 各個別ページのタイトル・説明文を動的に生成するメタデータ関数を追加
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const { data: activity } = await supabase
    .from('activities')
    .select('title, category')
    .eq('slug', id)
    .single();

  if (!activity) {
    return {
      title: "活動記録 - Nexus",
    };
  }

  return {
    title: `${activity.title} | Nexus 活動記録`,
    description: `Nexusの活動ログ：カテゴリ「${activity.category}」に関する「${activity.title}」の記事詳細ページです。`,
  };
}

export async function generateStaticParams() {
  try {
    const { data: activities, error } = await supabase.from('activities').select('slug');
    if (error || !activities) return [];
    return activities.map((activity) => ({ id: activity.slug }));
  } catch (e) {
    return [];
  }
}

export default async function ActivityDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', id)
    .eq('is_published', true)
    .single();

  if (!activity) {
    notFound();
  }

  return (
    <main>
      <Navbar />

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
            marginBottom: "60px"
          }}>
            {renderMarkdown(activity.content)}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "40px", textAlign: "center" }}>
            <Link href="/activity-log" className="button button-ghost">一覧へ戻る</Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  );
}
