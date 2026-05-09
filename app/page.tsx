import Image from "next/image";
import Link from "next/link";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const forWho = [
  {
    mark: "01",
    title: "自分の専門の外と繋がりたい",
    text: "一つの専門だけで生きていく保証がない時代。関連分野や異なる領域を知ることで、新しい価値や仕事を創り出したい人。",
  },
  {
    mark: "02",
    title: "異なる専門を持つ仲間と共創したい",
    text: "技術・ビジネス・表現など、自分の熱中していることを持ち寄り、同じ熱量を持つ学生と新しい何かを形にしたい人。",
  },
  {
    mark: "03",
    title: "何をしたいか、まだわからない",
    text: "高校生や大学生など、自分の進むべき道をこれから探したい人。（まずは読むだけ、見るだけの参加も大歓迎です）",
  },
  {
    mark: "04",
    title: "「本気で活動している人」のリアルを知りたい",
    text: "世の中で実際に何かをしている人が、普段どんなことを考え、どんなやり取りをしているのか。その実態を間近で観察してみたい人。",
  },
];

const activities = [
  {
    num: "01",
    title: "問いを持ち寄る・応える",
    text: "専門外の純粋な疑問をSlackに投稿し合う。異なる背景を持つメンバーが応答することで、そこから新しいアイデアや共創が生まれます。",
  },
  {
    num: "02",
    title: "これ読んだ・観た・聞いた",
    text: "本・記事・動画など、日々のインプットを共有。多様な情報が行き交い、コミュニティ全体の知的な雰囲気を育てます。",
  },
  {
    num: "03",
    title: "活動の「リアル」を観察する",
    text: "何かに熱中しているメンバー同士の議論を眺める。完成品だけでなく、試行錯誤の過程を知ることで、実態に近い世界を学べます。",
  },
];

const topics = [
  "思考力・価値観",
  "社会を動かす仕組み",
  "AI時代の人間と社会",
  "グローバルキャリア",
  "スタートアップ・起業",
  "言語化・発信力",
  "英語・学術英語",
  "ビジネスと社会課題",
  "AI・機械学習",
  "数理・統計",
  "認知科学",
  "量子コンピューティング",
  "音楽・サウンドデザイン",
  "ファッション・文化",
  "ダンス・身体表現",
  "アート・クリエイティブ",
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="メインナビゲーション">
        <a className="nav-logo" href="#top" aria-label="Nexus ホーム">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={34} height={34} priority />
          Nexus
        </a>

        <div className="nav-links">
          <Link href="/about">About</Link>
          <a className="nav-cta" href={joinUrl} target="_blank" rel="noreferrer">
            参加する
          </a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-content animate-slide-up">
          <p className="eyebrow">専門を学ぶ、すべての学生へ。</p>

          <h1>
            やりたいことを極める人。<br />
            やりたいことを探す人。
          </h1>

          <p className="hero-copy">
            変化の激しい時代に、専門性を掛け合わせる「共創の場」であり、<br />
            これから歩む道を探すための「観察の場」。<br />
            Nexusは、意欲あるすべての学生が交わるコミュニティです。
          </p>

          <div className="hero-actions">
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
              Nexus に参加する
              <span aria-hidden="true">→</span>
            </a>

            <Link className="button button-ghost" href="/about">
              詳しく見る
            </Link>
          </div>
        </div>
      </section>

      <section className="about section-band" id="about">
        <div className="section-inner about-grid">
          <div className="animate-slide-up">
            <p className="section-label">About</p>
            <h2>
              専門が交わる場所。<br />
              未来の自分に出会う場所。
            </h2>
            <div className="divider" />
            <div className="body-copy">
              <p>
                一つの分野だけで生き抜くのは難しい時代。専門を越えた繋がりが、思いがけない突破口を生み出します。
              </p>
              <p>
                Nexusは、意欲がある人がお互いの活動を共有したり、お互いの利点を活かして何かを作り上げていく「共創の場」であり、やりたいことを探している人が、情熱をもって取り組んでいることがある人のリアルな姿に触れられる「観察の場」でもあります。
              </p>
              <Link className="button button-ghost" style={{ marginTop: "16px" }} href="/about">
                Nexusの設立背景を読む
              </Link>
            </div>
          </div>

          <div className="stats-grid animate-slide-up delay-200">
            {["無料", "学生", "専門不問", "オンライン"].map((item, index) => (
              <div className="stat-box" key={item}>
                <p>{item}</p>
                <span>{index === 0 ? "参加費用" : index === 3 ? "参加形式" : "対象"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="forwho" id="forwho">
        <div className="section-inner animate-slide-up">
          <p className="section-label">こんな人に</p>
          <h2>「はみ出した」人たちへ。</h2>

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
              <p className="section-label">活動内容</p>
              <h2>
                アウトプットとインプットが、<br />
                成長を加速する。
              </h2>
            </div>
            <p>
              専門が決まっていなくていい。ただ好奇心があれば始められる。
              問い・発見・対話を積み重ねる人たちを見ることで、あなたの言葉や目標も自然と育っていきます。
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

      <section className="topics" id="topics">
        <div className="section-inner animate-slide-up">
          <p className="section-label">扱うテーマ</p>
          <h2>まだ知らない領域に、踏み込む。</h2>

          <div className="topics-grid">
            {topics.map((topic, index) => (
              <span
                key={topic}
                className="animate-slide-up"
                style={{ animationDelay: `${(index % 8) * 50}ms` }}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="join" id="join">
        <div className="section-inner animate-slide-up">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={70} height={70} />

          <p className="section-label">Join Us</p>
          <h2>対話が、思考を変える。</h2>
          <p>専門を学ぶ学生なら誰でも・完全無料。まず覗いてみてください。</p>

          <a className="button button-light" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する
            <span aria-hidden="true">→</span>
          </a>

          <a
            className="instagram-link"
            href="https://www.instagram.com/nex.us_2026/?hl=ja"
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

        <p>専門を学ぶすべての学生へ</p>
      </footer>
    </main>
  );
}