import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function Home() {
  // 最新の活動記録を3件取得
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(3);

  return (
    <main className="page-fade-in">
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/about">ABOUT</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            参加する
          </a>
        </div>
      </nav>

      {/* 刷新されたヒーローセクション */}
      <header className="hero" style={{ 
        position: 'relative', 
        overflow: 'hidden',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5vw'
      }}>
        {/* 背景のビジュアル演出 */}
        <div className="animate-fade-in" style={{
          position: 'absolute',
          top: '10%',
          right: '-5%',
          width: '65%',
          height: '80%',
          zIndex: -1,
          opacity: 0.8,
          filter: 'blur(5px)',
          animation: 'float 8s ease-in-out infinite'
        }}>
          <Image 
            src="/hero-visual.png" 
            alt="Nexus Visual" 
            fill 
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <div className="hero-content stagger-entry" style={{ maxWidth: '850px', zIndex: 1 }}>
          <p className="eyebrow">A PLACE FOR CO-CREATION</p>
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 9vw, 6.5rem)', 
            lineHeight: 1.05,
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            marginBottom: '32px',
            letterSpacing: '-0.02em'
          }}>
            共に学んで、<br />
            <span style={{ color: 'var(--accent)' }}>もっと先へ。</span>
          </h1>
          <p className="hero-copy" style={{ 
            fontSize: '1.25rem', 
            lineHeight: 1.9, 
            maxWidth: '580px',
            color: 'var(--ink-soft)',
            marginBottom: '56px'
          }}>
            意欲あるすべての学生へ。<br />
            専門性を掛け合わせる「共創の場」であり、<br />
            進む道を探すための「観察の場」。
          </p>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
              参加する <span style={{ marginLeft: '8px' }}>→</span>
            </a>
            <Link href="/about" className="button button-ghost">
              Nexusについて
            </Link>
          </div>
        </div>

        {/* スクロールインジケーター */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          opacity: 0.4
        }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.3em', fontWeight: 700 }}>SCROLL</span>
          <div style={{ width: '1px', height: '60px', background: 'var(--ink)', animation: 'scrollLine 2.5s ease-in-out infinite' }} />
        </div>
      </header>

      {/* About Section */}
      <section className="section stagger-entry" id="about">
        <p className="eyebrow">ABOUT NEXUS</p>
        <h2 className="section-title">意欲ある学生が交わる、<br />オンラインコミュニティ。</h2>
        <div className="grid">
          <div className="card">
            <h3>共創の場</h3>
            <p>異なる専門性を持つ学生が出会い、プロジェクトや対話を通じて新しい価値を生み出します。</p>
          </div>
          <div className="card">
            <h3>観察の場</h3>
            <p>他者の挑戦や思考を間近で見ることで、自分自身の進むべき道や興味を再発見できます。</p>
          </div>
          <div className="card">
            <h3>完全無料</h3>
            <p>学生による、学生のための場所。場所や経済的な制約を超えて、誰もが参加可能です。</p>
          </div>
        </div>
      </section>

      {/* Latest Activity Section */}
      <section className="section stagger-entry" style={{ background: 'var(--accent-pale)', borderRadius: '40px', margin: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
          <div>
            <p className="eyebrow">LATEST ACTIVITIES</p>
            <h2 className="section-title" style={{ marginBottom: 0 }}>活動の記録</h2>
          </div>
          <Link href="/activity-log" className="button button-ghost">一覧を見る →</Link>
        </div>
        <div className="grid">
          {activities?.map((activity) => (
            <div key={activity.id} className="card" style={{ background: 'white' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>{activity.category}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{activity.date}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{activity.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginBottom: '20px' }}>{activity.summary}</p>
              {activity.has_detail && (
                <Link href={`/activity-log/${activity.slug}`} style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>
                  詳細を読む →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ textAlign: "center", padding: "120px 24px" }}>
        <h2 className="section-title">さあ、もっと先へ。</h2>
        <p style={{ maxWidth: "600px", margin: "0 auto 40px", lineHeight: 1.8, color: "var(--ink-soft)" }}>
          Nexusは、あなたの専門性や意欲を歓迎します。<br />
          Slackコミュニティへの参加は以下のボタンから。
        </p>
        <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer" style={{ padding: "20px 60px", fontSize: "1.1rem" }}>
          コミュニティに参加する（無料）
        </a>
      </section>

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>意欲あるすべての学生へ</p>
        <nav className="footer-links">
          <Link href="/">トップ</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/guidelines">ガイドライン</Link>
          <Link href="/activity-log">活動記録</Link>
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </nav>
      </footer>
    </main>
  );
}
