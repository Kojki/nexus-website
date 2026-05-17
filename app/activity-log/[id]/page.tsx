import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 静的エクスポート時に未定義のパスを許可しない設定
export const dynamicParams = false;

// ビルド時に全記事のパスを生成
export async function generateStaticParams() {
  try {
    const { data: activities, error } = await supabase.from('activities').select('slug');
    
    if (error || !activities) {
      return [];
    }

    return activities.map((activity) => ({
      id: activity.slug,
    }));
  } catch (e) {
    return [];
  }
}

// ページコンポーネント（Next.js 15/16 対応版）
export default async function ActivityDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 詳細データを取得
  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', id)
    .eq('is_published', true) // ▼ 今回の追加部分
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
      <Footer />
    </main>
  );
}
