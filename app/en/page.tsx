import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const forWho = [
  {
    mark: "01",
    title: "Connect beyond your specialty",
    text: "In an era where relying on a single specialty isn't guaranteed. For those who want to create new value and careers by exploring related fields and entirely different domains.",
  },
  {
    mark: "02",
    title: "Co-create with peers from different disciplines",
    text: "Bring your passion—whether in tech, business, or creative arts—and shape something new with students who share the same level of enthusiasm.",
  },
  {
    mark: "03",
    title: "Still figuring out what you want to do",
    text: "High school and university students who are searching for their path. (Just reading and observing is perfectly welcome!)",
  },
  {
    mark: "04",
    title: "See the reality of people taking serious action",
    text: "For those who want to closely observe what active people are actually thinking and discussing on a daily basis.",
  },
];

const activities = [
  {
    num: "01",
    title: "Bring and Answer Questions",
    text: "Post genuine questions outside your expertise on Slack. When members with different backgrounds respond, it sparks new ideas and co-creation.",
  },
  {
    num: "02",
    title: "Read, Watched, Listened",
    text: "Share your daily inputs—books, articles, videos. The exchange of diverse information cultivates an intellectual atmosphere across the community.",
  },
  {
    num: "03",
    title: "Observe the 'Real' Action",
    text: "Watch discussions between passionate members. By seeing the trial and error process, not just the finished product, you learn about the world in its truest form.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main Navigation">
        <a className="nav-logo" href="#top" aria-label="Nexus Home">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </a>

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

      <section className="hero" id="top">
        <div className="hero-content animate-slide-up">
          <p className="eyebrow">To all ambitious students.</p>

          <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)" }}>
            Learn together.<br />
            Build further.
          </h1>

          <p className="hero-copy">
            Nexus is a community where ambitious students gather to connect by bringing their expertise and interests.<br />
            It's a place designed to help you find your path while exposing you to new fields and values.
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
      </section>

      <section className="about section-band" id="about">
        <div className="section-inner about-grid">
          <div className="animate-slide-up">
            <p className="section-label">ABOUT</p>
            <h2>
              Where disciplines intersect.<br />
              Where you meet your future self.
            </h2>
            <div className="divider" />
            <div className="body-copy">
              <p>
                In an era where it's hard to survive on a single discipline, connections beyond your specialty create unexpected breakthroughs.
              </p>
              <p>
                Nexus is a &quot;Co-creation Hub&quot; where ambitious individuals share activities and leverage each other&apos;s strengths. It&apos;s also an &quot;Observation Hub&quot; for those searching for what they want to do, allowing them to witness the real lives of passionate people.
              </p>
              <Link className="button button-ghost" style={{ marginTop: "16px" }} href="/en/about">
                Read Our Founding Story
              </Link>
            </div>
          </div>

          <div className="stats-grid animate-slide-up delay-200">
            {["Free", "Students", "Slack", "Anywhere"].map((item, index) => (
              <div className="stat-box" key={item}>
                <p style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>{item}</p>
                <span>{index === 0 ? "Fee" : index === 1 ? "Target" : index === 2 ? "Platform" : "Region"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="forwho" id="forwho">
        <div className="section-inner animate-slide-up">
          <p className="section-label">FOR WHO</p>
          <h2>It all starts with curiosity.</h2>

          <div className="forwho-list">
            {forWho.map((item, index) => (
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

      <section className="activities section-band" id="activities">
        <div className="section-inner animate-slide-up">
          <div className="section-split">
            <div>
              <p className="section-label">ACTIVITIES</p>
              <h2>Accelerate your growth<br />through continuous input and output.</h2>
            </div>
            <p>
              Casually share your daily learnings and interests, and experience the perspectives of peers active in different fields.<br />
              The accumulation of these small interactions creates ideas and connections you wouldn&apos;t have thought of alone.
            </p>
          </div>

          <div className="activity-list">
            {activities.map((item, index) => (
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

      <section className="join" id="join">
        <div className="section-inner animate-slide-up">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={70} height={70} />

          <p className="section-label">JOIN US</p>
          <h2>Dialogue expands your thinking.</h2>
          <p>To all ambitious students. Completely free. Come take a look inside.</p>

          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Join Nexus
            <span aria-hidden="true">→</span>
          </a>

          <a
            className="instagram-link"
            href="https://www.instagram.com/nex.us_2026/?hl=en"
            target="_blank"
            rel="noreferrer"
          >
            @nex.us_2026
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>

        <p>To all students exploring their disciplines.</p>
      </footer>
    </main>
  );
}
