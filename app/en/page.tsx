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

export default async function HomeEn() {
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(3);

  const { data: contentData } = await supabase
    .from('site_content')
    .select('content_key, content_value')
    .eq('page_path', 'en');

  const content: Record<string, string> = {};
  contentData?.forEach(item => { content[item.content_key] = item.content_value; });
  const get = (key: string, fallback: string) => content[key] || fallback;

  return (
    <main className="page-fade-in">
      <Navbar />

      <header className="hero">
        <div className="hero-content stagger-entry">
          <p className="eyebrow">A PLACE FOR CO-CREATION</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '24px' }}>
            {renderText(get('hero_title', 'Learn Together,\nGo Further.'))}
          </h1>
          <p className="hero-copy" style={{ marginBottom: '40px' }}>
            {renderText(get('hero_copy', 'To all ambitious students. A "Co-creation Hub" where disciplines intersect, and an "Observation Hub" to find your own path.'))}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">Join Nexus →</a>
            <Link href="/en/about" className="button button-ghost">About Us</Link>
          </div>
        </div>
      </header>

      <section className="section stagger-entry">
        <p className="eyebrow">ABOUT NEXUS</p>
        <h2 className="section-title">An online community where<br />ambitious students connect.</h2>
        <div className="grid">
          <div className="card">
            <h3>Co-creation</h3>
            <p>Students from different disciplines meet to create new value through projects and dialogue.</p>
          </div>
          <div className="card">
            <h3>Observation</h3>
            <p>By closely observing the challenges and thoughts of others, you can rediscover your own path and interests.</p>
          </div>
          <div className="card">
            <h3>Free for All</h3>
            <p>A place built by students, for students. Accessible to everyone, regardless of location or financial constraints.</p>
          </div>
        </div>
      </section>

      <section className="section stagger-entry" style={{ background: 'var(--accent-pale)', borderRadius: '40px', margin: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Activity Log</h2>
          <Link href="/activity-log" className="button button-ghost">View All →</Link>
        </div>
        <div className="grid">
          {activities?.map((activity) => (
            <div key={activity.id} className="card" style={{ background: 'white' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>{activity.category}</span>
              <h3 style={{ fontSize: '1.2rem', margin: '8px 0' }}>{activity.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>{activity.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}

