import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function HomeEn() {
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(3);

  return (
    <main className="page-fade-in">
      <nav className="site-nav" aria-label="Main Navigation">
        <Link className="nav-logo" href="/en" aria-label="Nexus Home">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/en/about">ABOUT</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            JOIN
          </a>
          <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "8px" }}>
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>JP</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ color: "var(--ink)" }}>EN</span>
          </div>
        </div>
      </nav>

      {/* Simple but sophisticated Hero (No Image dependency) */}
      <header className="hero">
        <div className="hero-content stagger-entry">
          <p className="eyebrow">A PLACE FOR CO-CREATION</p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '24px' }}>
            Learn Together,<br />Go Further.
          </h1>
          <p className="hero-copy" style={{ marginBottom: '40px' }}>
            To all ambitious students. A &quot;Co-creation Hub&quot; where disciplines intersect, and an &quot;Observation Hub&quot; to find your own path.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">Join Nexus →</a>
            <Link href="/en/about" className="button button-ghost">About Us</Link>
          </div>
        </div>
      </header>

      {/* About Section */}
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

      {/* Latest Activity Log */}
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

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>To all students exploring their disciplines.</p>
        <nav className="footer-links">
          <Link href="/en">Home</Link>
          <Link href="/en/about">About</Link>
          <Link href="/faq">FAQ (JP)</Link>
          <Link href="/guidelines">Guidelines (JP)</Link>
          <Link href="/activity-log">Activity Log (JP)</Link>
          <Link href="/contact">Contact (JP)</Link>
          <Link href="/privacy">Privacy Policy (JP)</Link>
          <Link href="/members">Member Profiles (JP)</Link>
        </nav>
      </footer>
    </main>
  );
}
