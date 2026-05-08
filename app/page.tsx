import Image from "next/image";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

const forWho = [
  {
    mark: "01",
    title: "自分の専門の外に、本気で踏み込みたい",
    text: "情報・物理・法・経済・歴史・医学。どの専門にいても、隣の領域が気になって仕方ない人。",
  },
  {
    mark: "02",
    title: "起業・プロダクト開発に興味がある",
    text: "技術・ビジネス・社会設計を横断しながら、実際に何かを作りたい人。",
  },
  {
    mark: "03",
    title: "異なる専門を持つ人と、深く話したい",
    text: "ゼミや学科の中だけでは出会えない視点に触れたい人。",
  },
  {
    mark: "04",
    title: "同じ熱量の学生と繋がりたい",
    text: "学校や学部の外に出て、本気で考え・動ける仲間を探している人。",
  },
  {
    mark: "05",
    title: "海外大学院を目指している",
    text: "学部のうちから留学・海外研究を視野に入れ、英語発信や異分野との対話を実践したい人。",
  },
  {
    mark: "06",
    title: "早期に研究へ踏み込みたい",
    text: "研究室配属を待たず、今から論文を読み・問いを立て・動き始めたい人。",
  },
  {
    mark: "07",
    title: "好きなことに本気で向き合っている",
    text: "音楽・ダンス・ファッションなどの表現活動を深めながら、異なる領域の人と話したい人。",
  },
];

const activities = [
  {
    num: "01",
    title: "問いを持ち寄る",
    text: "最近気になっていること・わからないことをSlackに投稿する。純粋な好奇心から始まる問いに、異なる背景を持つメンバーが応答します。",
  },
  {
    num: "02",
    title: "これ読んだ・観た・聞いた",
    text: "本・記事・動画・Podcastなど何でもOK。英語・日本語問わず、インプットの習慣化とコミュニティの知的雰囲気を育てます。",
  },
  {
    num: "03",
    title: "専門スポットライト",
    text: "週次で1つの専門分野を取り上げ、その面白さや意外な側面を短く紹介します。読むだけで参加できます。",
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
          <Image src="/nexus-mark.svg" alt="" width={34} height={34} priority />
          Nexus
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#activities">活動内容</a>
          <a href="#topics">テーマ</a>
          <a className="nav-cta" href="#join">
            参加する
          </a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-content">
          <p className="eyebrow">専門を学ぶ、すべての学生へ。</p>

          <h1>
            専門の壁を、
            <span>対話</span>で越える。
          </h1>

          <p className="hero-copy">
            哲学・情報工学・経済・物理・法学・心理学・建築・医学・歴史。
            専門が違うから、対話に意味がある。Nexus
            は、異なる専門を持つ学生が本気で話し合う場所です。
          </p>

          <div className="hero-actions">
            <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
              Nexus に参加する
              <span aria-hidden="true">→</span>
            </a>

            <a className="button button-ghost" href="#about">
              詳しく見る
            </a>
          </div>
        </div>

        <div className="hero-panel" aria-label="Nexusで交わされる問いの例">
          <Image
            className="hero-logo"
            src="/nexus-mark.svg"
            alt=""
            width={118}
            height={118}
            priority
          />

          <div className="dialogue-card card-one">
            <span>Science</span>
            <p>AI時代に、専門知はどう社会へ接続されるのか。</p>
          </div>

          <div className="dialogue-card card-two">
            <span>Arts</span>
            <p>文化や表現は、技術の使われ方をどう変えるのか。</p>
          </div>

          <div className="dialogue-card card-three">
            <span>Cross Field</span>
            <p>問いを共有すると、自分の専門の輪郭が見えてくる。</p>
          </div>
        </div>
      </section>

      <section className="about section-band" id="about">
        <div className="section-inner about-grid">
          <div>
            <p className="section-label">About</p>

            <h2>
              あなたの専門が、
              <br />
              誰かの突破口になる。
            </h2>

            <div className="divider" />

            <div className="body-copy">
              <p>
                <strong>経済産業省</strong>
                の試算では、2040年にはAI活用を担う人材が339万人不足するとされています。
                <strong>文部科学省</strong>
                はすでに全学部へのデータサイエンス・AI必修化を国策として推進しており、専門の区分を超えた学びが求められています。
              </p>

              <p>
                同時に、世界経済フォーラムの「仕事の未来レポート2025」は、AI時代においても人間中心のスキルが重要であることを示しています。分析し、創造し、他者と対話する力。そして学び続けながら社会に働きかける姿勢が、技術と並んで求められる時代になっています。
              </p>

              <p>
                <strong>Nexus</strong>
                は、領域を越えようとする高校生・専門学生・大学生・大学院生が専門を持ち寄り、その接続を日常にできる場でありたいと思っています。
              </p>
            </div>
          </div>

          <div className="stats-grid">
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
        <div className="section-inner">
          <p className="section-label">こんな人に</p>
          <h2>「はみ出した」人たちへ。</h2>

          <div className="forwho-list">
            {forWho.map((item) => (
              <article className="forwho-item" key={item.title}>
                <span>{item.mark}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="activities section-band" id="activities">
        <div className="section-inner">
          <div className="section-split">
            <div>
              <p className="section-label">活動内容</p>
              <h2>
                アウトプットが、
                <br />
                成長を加速する。
              </h2>
            </div>

            <p>
              専門が決まっていなくていい。好奇心があれば始められる。
              問い・発見・対話を積み重ねることで、自分の言葉で語れる力が育っていきます。
            </p>
          </div>

          <div className="activity-list">
            {activities.map((item) => (
              <article className="activity-item" key={item.title}>
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
        <div className="section-inner">
          <p className="section-label">扱うテーマ</p>
          <h2>まだ知らない領域に、踏み込む。</h2>

          <div className="topics-grid">
            {topics.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="join" id="join">
        <div className="section-inner">
          <Image src="/nexus-mark.svg" alt="" width={70} height={70} />

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
          <Image src="/nexus-mark.svg" alt="" width={30} height={30} />
          Nexus
        </div>

        <p>専門を学ぶすべての学生へ</p>
      </footer>
    </main>
  );
}
