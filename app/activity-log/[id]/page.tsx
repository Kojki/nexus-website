import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// 1. 静的書き出しの挙動を明示的に指定
export const dynamic = "force-static";
export const dynamicParams = false;

// 2. generateStaticParams を確実にエクスポート
export async function generateStaticParams() {
  console.log("--- generateStaticParams started ---"); // 実行されているか確認用のログ
  
  try {
    const { data, error } = await supabase.from('activities').select('slug');
    
    if (error) {
      console.error("Supabase Error:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn("No activities found in Supabase.");
      // ページが一つもないと export 時にエラーになることがあるため、ダミーを返すか検討
      return [];
    }

    const params = data.map((item) => ({ id: String(item.slug) }));
    console.log("Generated params:", params);
    return params;
    
  } catch (err) {
    console.error("Critical Error in generateStaticParams:", err);
    return [];
  }
}

// 3. ページコンポーネント
export default async function ActivityDetailPage(props: { 
  params: Promise<{ id: string }> 
}) {
  const params = await props.params;
  const { id } = params;

  const { data: activity } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', id)
    .single();

  if (!activity) {
    notFound();
  }

  return (
    <main>
      {/* 既存の JSX コンテンツ */}
      <nav className="site-nav">
        <Link className="nav-logo" href="/"><Image src="/nexus-icon.png" alt="Logo" width={34} height={34} /> Nexus</Link>
        <div className="nav-links"><Link href="/activity-log">一覧に戻る</Link></div>
      </nav>
      <article className="concept-container" style={{ paddingTop: "120px", maxWidth: "800px" }}>
        <div className="animate-slide-up">
          <h1>{activity.title}</h1>
          <div style={{ whiteSpace: "pre-wrap" }}>{activity.content}</div>
        </div>
      </article>
    </main>
  );
}
