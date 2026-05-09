import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default function About() {
  return (
    <main>
      <nav className="site-nav" aria-label="メインナビゲーション">
        <Link className="nav-logo" href="/" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </Link>
        <div className="nav-links">
          <Link href="/">トップへ戻る</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            参加する
          </a>
        </div>
      </nav>

      <header className="concept-header">
        <div className="animate-slide-up">
          <p className="eyebrow" style={{ justifyContent: "center" }}>About Nexus</p>
          <h1>
            専門が交わる場所。<br />
            未来の自分に<br />
            出会う場所。
          </h1>
        </div>
      </header>

      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            激動の時代を生き抜くために
          </span>
          <p>
            テクノロジーの進化や社会の変化がかつてなく速い現代において、「この分野だけを学んでいれば一生安泰」という保証はどこにもありません。
          </p>
          <p>
            だからこそ、自分の専門領域を深めるだけでなく、<strong>関連分野やまったく異なる領域の知見を掛け合わせる能力</strong>が不可欠になります。私たちは新しい仕事や価値は、常に境界線や融合から生まれると考えています。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-200">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            やりたいことを極める人の「共創の場」
          </span>
          <p>
            Nexusは、すでに専門ややりたいことがある意欲的な学生が、お互いの活動を共有したり、お互いの利点を活かして何かを作り上げていく場所です。
          </p>
          <p>
            異なる視点やバックグラウンドを持つ同世代と対話することで、一人では思いつかなかったアイデアを形にし、ともに何かを創り上げる<strong>「共創」のためのハブ</strong>を目指しています。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-300">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            やりたいことを見つける人の「観察の場」
          </span>
          <p>
            一方で、高校生や大学生の中には「自分が何をしたいのかまだわからない」「実際に活動している人が何をしているのか具体的に知らない」という人も多いはずです。
          </p>
          <p>
            Nexusは、そうした人たちが「何かを本気で取り組んでいる人たちのやり取り」を間近で見るための場所でもあります。活動の内容や試行錯誤のプロセスをありのままに<strong>「観察」</strong>することで、実態に近い形で世の中を知り、自分の進む道を見つけるきっかけにしてほしいと願っています。
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "80px", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="button button-ghost animate-slide-up delay-400" href="/">
            トップページへ戻る
          </Link>
          <a className="button button-dark animate-slide-up delay-400" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={30} height={30} />
          Nexus
        </div>
        <p>専門を学ぶすべての学生へ</p>
      </footer>
    </main>
  );
}