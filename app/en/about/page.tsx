import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function About() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main Navigation">
        <Link className="nav-logo" href="/en" aria-label="Nexus Home">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/en">Back to Home</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            JOIN
          </a>
          <div className="lang-toggle" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, alignItems: "center", marginLeft: "8px" }}>
            <Link href="/about" style={{ color: "var(--muted)", textDecoration: "none" }}>JP</Link>
            <span style={{ color: "var(--border)" }}>|</span>
            <span style={{ color: "var(--ink)" }}>EN</span>
          </div>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>About Nexus</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Where disciplines intersect.<br />
            Where you meet<br />
            your future self.
          </h1>
        </div>
      </header>

      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
            Surviving an Era of Rapid Change
          </span>
          <p>
            In a modern era where technological advancement and social changes are faster than ever, there is no guarantee that &quot;learning just this one field will keep you safe for life.&quot;
          </p>
          <p>
            That&apos;s exactly why it is essential not only to deepen your own area of expertise, but also to have the ability to <strong>multiply it with knowledge from related or entirely different fields</strong>. We believe that new jobs and value always emerge from boundaries and fusion.
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-200">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
            A &quot;Co-creation Hub&quot; for those mastering their passions
          </span>
          <p>
            Nexus is a place for ambitious students who already have a specialty or something they want to do, to share their activities and leverage each other&apos;s strengths to build something together.
          </p>
          <p>
            By engaging in dialogue with peers of the same generation who have different perspectives and backgrounds, we aim to be a <strong>hub for &quot;Co-creation&quot;</strong>—shaping ideas you wouldn&apos;t have thought of alone and building something together.
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-300">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
            An &quot;Observation Hub&quot; for those searching for their path
          </span>
          <p>
            On the other hand, there must be many high school and university students who feel &quot;I don&apos;t know what I want to do yet&quot; or &quot;I don&apos;t know exactly what active people are doing.&quot;
          </p>
          <p>
            Nexus is also a place for such individuals to closely watch the interactions of &quot;people who are seriously dedicated to something.&quot; By purely <strong>&quot;observing&quot;</strong> the content of their activities and their trial-and-error processes, we hope you can understand the world in a more realistic form and find the catalyst for your own path.
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost animate-slide-up delay-400" href="/en">
            Back to Home
          </Link>
          <a className="button button-dark animate-slide-up delay-400" href={joinUrl} target="_blank" rel="noreferrer">
            Join Nexus
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>To all students exploring their disciplines.</p>
        <nav className="footer-links" aria-label="Footer Navigation">
          <Link href="/en">Home</Link>
          <Link href="/en/about">About</Link>
          <Link href="/faq">FAQ (JP)</Link>
          <Link href="/guidelines">Guidelines (JP)</Link>
          <Link href="/activity-log">Activity Log (JP)</Link>
          <Link href="/contact">Contact (JP)</Link>
            <Link href="/privacy">Privacy Policy</Link>
        </nav>
      </footer>
    </main>
  );
}
