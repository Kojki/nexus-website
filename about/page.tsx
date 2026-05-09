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
            あなたの専門が、<br />誰かの突破口になる。
          </h1>
        </div>
      </header>

      <section className="concept-container">
        <div className="concept-block animate-slide-up delay-100">
          <span className="concept-stat-highlight">339万人</span>
          <p>
            <strong>経済産業省</strong>の試算では、2040年にはAI活用を担う人材がこれだけ不足するとされています。
            これを受け、<strong>文部科学省</strong>はすでに全学部へのデータサイエンス・AI必修化を国策として推進しており、
            専門の区分を超えた学びがかつてないほど求められています。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-200">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            人間中心のスキル
          </span>
          <p>
            同時に、世界経済フォーラムの「仕事の未来レポート2025」は、AI時代においても人間ならではのスキルが重要であることを示しています。
          </p>
          <p>
            <strong>分析し、創造し、他者と対話する力。</strong>
          </p>
          <p>
            そして学び続けながら社会に働きかける姿勢が、高度な技術力と並んで求められる時代になっています。
          </p>
        </div>

        <div className="concept-block animate-slide-up delay-300">
          <span className="concept-stat-highlight" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Nexusの役割
          </span>
          <p>
            私たちは、領域を越えようとする高校生・専門学生・大学生・大学院生がそれぞれの専門を持ち寄り、
            その<strong>「異なる知の接続」を日常にできる場</strong>でありたいと思っています。
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
