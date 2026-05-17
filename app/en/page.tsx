import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

// 改行（\n）を正しく <br /> に変換する共通関数
const renderText = (text: string) => {
  if (!text) return null;
  return text.split(/(?:\r\n|\r|\n|\\n)/).map((line, i) => (
    <span key={i}>{line}<br /></span>
  ));
};

export default async function HomeEn() {
  // 1. 最新の活動記録を取得
  const { data: activitiesData } = await supabase
    .from('activities')
    .select('*')
    .eq('is_published', true)
    .order('date', { ascending: false })
    .limit(3);

  // 2. 英語版のコンテンツを取得 (page_path = 'en')
  const { data: contentData } = await supabase
    .from('site_content')
    .select('content_key, content_value')
    .eq('page_path', 'en');

  const content: Record<string, string> = {};
  contentData?.forEach(item => {
    content[item.content_key] = item.content_value;
  });

  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <Navbar />

      {/* HERO SECTION */}
      <header className="hero" id="top">
        <div className="hero-content animate-slide-up">
          <p className="eyebrow">TO ALL AMBITIOUS STUDENTS</p>

          <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)" }}>
            {renderText(get('hero_title', 'Connect, Create,\nGo Beyond.'))}
          </h1>

          <p className="hero-copy">
            {renderText(get('hero_copy', 'Nexus is a co-creation community where ambitious students gather to share their expertise, interests, and passions. We aim to be a space where you can discover your direction through new perspectives.'))}
          </p>

          <div className="hero-actions">
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
              Join Nexus
              <span aria-hidden="true">→</span>
            </a>

            <Link className="button button-ghost" href="/en/about">
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* ABOUT SECTION */}
      <section className="about section-band" id="about">
        <div className="section-inner about-grid">
          <div className="animate-slide-up">
            <p className="section-label">ABOUT</p>
            <h2>
              {renderText(get('about_title', 'Where Disciplines Intersect.\nWhere You Meet Your Future Self.'))}
            </h2>
            <div className="divider" />
            <div className="body-copy">
              <p>{renderText(get('about_body_1', 'Surviving on a single expertise is becoming harder. Connections that cross disciplinary boundaries spark unexpected breakthroughs.'))}</p>
              <p>{renderText(get('about_body_2', 'Nexus is a "Co-creation space" where members share outputs and build things together. It is also an "Observation space" where students seeking their path can witness the raw endeavors of highly passionate peers.'))}</p>
              <Link className="button button-ghost" style={{ marginTop: "16px" }} href="/en/about">
                Read Background & Mission
              </Link>
            </div>
          </div>

          <div className="stats-grid animate-slide-up delay-200">
            {[
              { label: "Free", sub: "Participation Fee" },
              { label: "Students", sub: "Target Audience" },
              { label: "Slack", sub: "Primary Tool" },
              { label: "Global", sub: "Region & Reach" }
            ].map((item) => (
              <div className="stat-box" key={item.label}>
                <p>{item.label}</p>
                <span>{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO SECTION */}
      <section className="forwho" id="forwho">
        <div className="section-inner animate-slide-up">
          <p className="section-label">FOR WHO</p>
          <h2>{get('forwho_title', 'All You Need is Curiosity.')}</h2>

          <div className="forwho-list">
            {[
              {
                mark: "01",
                title: get('forwho_1_title', 'Expand Beyond Your Field'),
                text: get('forwho_1_text', 'In an era where no single field guarantees the future, connect with diverse realms to create new value.')
              },
              {
                mark: "02",
                title: get('forwho_2_title', 'Co-create with Peers'),
                text: get('forwho_2_text', 'Bring your passion—be it tech, business, or design—and collaborate with like-minded students.')
              },
              {
                mark: "03",
                title: get('forwho_3_title', 'Seeking a Direction'),
                text: get('forwho_3_text', 'High school and college students looking for their path are highly welcome to start by observing and reading.')
              },
              {
                mark: "04",
                title: get('forwho_4_title', 'Witness Real Endeavors'),
                text: get('forwho_4_text', 'Observe how active peers brainstorm, fail, and succeed in real-time to understand the real world.')
              }
            ].map((item, index) => (
              <article
                className="forwho-item animate-slide-up"
                key={item.title}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span>{item.mark}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVITIES SECTION */}
      <section className="activities section-band" id="activities">
        <div className="section-inner animate-slide-up">
          <div className="section-split">
            <div>
              <p className="section-label">ACTIVITIES</p>
              <h2>{renderText(get('activity_title', 'Output and Input\nAccelerate Growth.'))}</h2>
            </div>
            <p>{renderText(get('activity_copy', 'Share daily insights and explore perspectives of peers in different fields. Small interactions build unexpected ideas and bonds.'))}</p>
          </div>

          <div className="activity-list">
            {[
              {
                num: "01",
                title: get('activity_1_title', 'Ask & Answer Questions'),
                text: get('activity_1_text', 'Share interdisciplinary questions on Slack. Unique answers from different backgrounds spark new collaborations.')
              },
              {
                num: "02",
                title: get('activity_2_title', 'Share What You Learn'),
                text: get('activity_2_text', 'Post books, articles, or videos. Active knowledge sharing builds a vibrant intellectual atmosphere.')
              },
              {
                num: "03",
                title: get('activity_3_title', 'Observe the Process'),
                text: get('activity_3_text', 'Watch discussions unfold. Learning from trials and errors is far richer than just seeing the final output.')
              }
            ].map((item, index) => (
              <article
                className="activity-item animate-slide-up"
                key={item.title}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span>{item.num}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST ACTIVITY LOG SECTION (美しい英語カード表示) */}
      <section className="section" style={{ background: 'var(--accent-pale)', borderRadius: '40px', margin: '0 24px 80px', padding: '60px 40px' }}>
        <div className="section-inner" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '8px' }}>LATEST POSTS</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', margin: 0, fontWeight: 900 }}>Activity Log</h2>
            </div>
            <Link href="/activity-log" className="button button-ghost">View All Log →</Link>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {!activitiesData || activitiesData.length === 0 ? (
              <div style={{ color: "var(--muted)", padding: "20px" }}>No posts found.</div>
            ) : (
              activitiesData.map((act) => (
                <div key={act.id} className="card" style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.3s ease' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 800, background: 'var(--accent-pale)', padding: '4px 10px', borderRadius: '99px' }}>
                        {act.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{act.date}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '12px', lineHeight: 1.4 }}>{act.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>{act.summary}</p>
                  </div>
                  {act.has_detail && (
                    <Link href={`/activity-log/${act.slug}`} style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginTop: 'auto' }}>
                      Read Detail →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* JOIN US SECTION */}
      <section className="join" id="join">
        <div className="section-inner animate-slide-up">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={70} height={70} />
          <p className="section-label">JOIN US</p>
          <h2>{renderText(get('join_title', 'Dialogue Expands Thinking.'))}</h2>
          <p>{renderText(get('join_copy', 'To all ambitious students. Completely free. Come take a look.'))}</p>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Join Nexus →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
