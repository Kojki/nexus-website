import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const joinUrl =
  "https://join.slack.com/t/nexus-45x8670/shared_invite/zt-3x2vq5935-O7CsSen0PLwlDjNAQvpjgA";

export default async function Home() {
  // 1. 最新の活動記録を取得
  const { data: activitiesData } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: false })
    .limit(3);

  // 2. ページコンテンツを取得
  const { data: contentData } = await supabase
    .from('site_content')
    .select('content_key, content_value')
    .eq('page_path', 'home');

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
          <p className="eyebrow">意欲あるすべての学生へ。</p>

          <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)" }}>
            {get('hero_title', '共に学んで、\nもっと先へ。').split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>

          <p className="hero-copy">
            {get('hero_copy', 'Nexusは、意欲ある学生たちが集まり、専門性や興味を持ち寄ってつながるコミュニティです。\n新しい分野や価値観に触れながら、自分の進みたい方向を見つけられる場を目指しています。')}
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
      </header>

      {/* ABOUT SECTION */}
      <section className="about section-band" id="about">
        <div className="section-inner about-grid">
          <div className="animate-slide-up">
            <p className="section-label">ABOUT</p>
            <h2>
              {get('about_title', '専門が交わる場所。\n未来の自分に出会う場所。').split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
            <div className="divider" />
            <div className="body-copy">
              <p>{get('about_body_1', '一つの分野だけで生き抜くのは難しい時代。専門を越えた繋がりが、思いがけない突破口を生み出します。')}</p>
              <p>{get('about_body_2', 'Nexusは、意欲がある人がお互いの活動を共有したり、お互いの利点を活かして何かを作り上げていく「共創の場」であり、やりたいことを探している人でも、情熱をもって取り組んでいることがある人のリアルな姿に触れられる「観察の場」でもあります。')}</p>
              <Link className="button button-ghost" style={{ marginTop: "16px" }} href="/about">
                Nexusの設立背景を読む
              </Link>
            </div>
          </div>

          <div className="stats-grid animate-slide-up delay-200">
            {["無料", "学生", "Slack", "全ての地域"].map((item, index) => (
              <div className="stat-box" key={item}>
                <p>{item}</p>
                <span>{index === 0 ? "参加費用" : index === 1 ? "対象" : index === 2 ? "ツール" : "地域"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHO SECTION */}
      <section className="forwho" id="forwho">
        <div className="section-inner animate-slide-up">
          <p className="section-label">こんな人に</p>
          <h2>好奇心があれば、始められる。</h2>

          <div className="forwho-list">
            {[
              { mark: "01", title: "自分の専門の外と繋がりたい", text: "一つの専門だけで生きていく保証がない時代。関連分野や異なる領域を知ることで、新しい価値や仕事を創り出したい人。" },
              { mark: "02", title: "異なる専門を持つ仲間と共創したい", text: "技術・ビジネス・表現など、自分の熱中していることを持ち寄り、同じ熱量を持つ学生と新しい何かを形にしたい人。" },
              { mark: "03", title: "何をしたいか、まだわからない", text: "高校生や大学生など、自分の進むべき道をこれから探したい人。（まずは読むだけ、見るだけの参加も大歓迎です）" },
              { mark: "04", title: "「本気で活動している人」のリアルを知りたい", text: "世の中で実際に何かをしている人が、普段どんなことを考え、どんなやり取りをしているのか。その実態を間近で観察してみたい人。" }
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
              <p className="section-label">活動内容</p>
              <h2>{get('activity_title', 'アウトプットとインプットが、成長を加速する。')}</h2>
            </div>
            <p>{get('activity_copy', '日々の学びや興味を気軽に発信し、異なる分野で活動する仲間の視点に触れる。その小さなやり取りの積み重ねが、一人では思いつかなかったアイデアや新しい繋がりを生み出します。')}</p>
          </div>

          <div className="activity-list">
            {[
              { num: "01", title: "問いを持ち寄る・応える", text: "専門外の純粋な疑問をSlackに投稿し合う。異なる背景を持つメンバーが応答することで、そこから新しいアイデアや共創が生まれます。" },
              { num: "02", title: "これ読んだ・観た・聞いた", text: "本・記事・動画など、日々のインプットを共有。多様な情報が行き交い、コミュニティ全体の知的な雰囲気を育てます。" },
              { num: "03", title: "活動の「リアル」を観察する", text: "何かに熱中しているメンバー同士の議論を眺める。完成品だけでな、試行錯誤の過程を知ることで、実態に近い世界を学べます。" }
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

      {/* JOIN US SECTION */}
      <section className="join" id="join">
        <div className="section-inner animate-slide-up">
          <Image src="/nexus-icon.png" alt="Nexus Logo" width={70} height={70} />
          <p className="section-label">JOIN US</p>
          <h2>{get('join_title', '対話が、思考を広げる。')}</h2>
          <p>{get('join_copy', '意欲あるすべての学生へ。完全無料。まずは覗いてみてください。')}</p>
          <a className="button button-dark" href={joinUrl} target="_blank" rel="noreferrer">
            Nexus に参加する →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
