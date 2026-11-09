import Link from "next/link";
import PageHead from "@/components/PageHead";
import { SecHead } from "@/components/Section";
import { readDb } from "@/lib/db";

export const metadata = { title: "月あかりについて", description: "占い館を約10年運営してきた経験から生まれた電話占い「月あかり」の想いと、安心してご利用いただくための取り組みをご紹介します。" };

const PRINTS = [
  { src: "hiroshige-takanawa", title: "東都名所 高輪之明月", note: "江戸の海辺に昇る満月と、列をなして渡る雁。" },
  { src: "hiroshige-ishiyama", title: "近江八景之内 石山秋月", note: "琵琶湖のほとり、石山寺から眺める秋の月。" },
  { src: "hiroshige-tama", title: "江戸近郊八景之内 玉川秋月", note: "柳の向こうに浮かぶ、静かな川辺の月。" },
];

export default async function AboutPage() {
  const { tellers, settings } = await readDb();
  return (
    <>
      <PageHead title="月あかりについて" en="About us" lead="対面鑑定のぬくもりを、アプリ不要・通話料0円の電話占いで。" image="/images/photos/moonlight-water.webp" />

      <section className="section">
        <div className="container about-grid">
          <div>
            <span className="gold" style={{ fontFamily: "var(--en)", fontStyle: "italic", fontSize: 19, letterSpacing: ".12em" }}>Our story</span>
            <h2 style={{ fontSize: 27, letterSpacing: ".1em", lineHeight: 1.7 }}>街の占い館から、<br />夜をやさしく照らす電話占いへ。</h2>
            <p>月あかりは、対面の占い館を約10年にわたり運営してきた経験から生まれました。占い館では、お客様と向き合い、じっくりお話を伺うことを何より大切にしてきました。</p>
            <p>一方で、「近くに占い館がない」「人に会わずに相談したい」「夜遅くにしか時間が取れない」という声も多く寄せられていました。電話占いならその声に応えられますが、既存のサービスは通話料や広告費の影響で、どうしても料金が高くなりがちです。</p>
            <p>そこで月あかりでは、アプリ不要のブラウザ通話で通話料をなくし、占い師自身の発信によるご紹介（アフィリエイト）で広告費を抑えることで、本格的な鑑定を適正な料金でお届けしています。</p>
          </div>
          <figure className="print-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/photos/hiroshige-takanawa.webp" alt="歌川広重「東都名所 高輪之明月」" />
            <figcaption>歌川広重「東都名所 高輪之明月」 メトロポリタン美術館所蔵（パブリックドメイン）</figcaption>
          </figure>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead en="Our promise" title="月あかりの3つの約束" />
          <div className="values">
            <div><span className="no">01</span><h3>じっくり、あなたのペースで</h3><p className="small muted mb-0">対面鑑定で培った「聞く力」を大切に。うまく話せなくても大丈夫です。占い師がやさしく質問しながら、気持ちの整理をお手伝いします。</p></div>
            <div><span className="no">02</span><h3>わかりやすく、適正な料金</h3><p className="small muted mb-0">通話料0円。鑑定料は1分単位の明朗会計で、時間指定なら定額。残高を超えて請求されることはありません。</p></div>
            <div><span className="no">03</span><h3>安心してご利用いただく仕組み</h3><p className="small muted mb-0">予約は占い師の承認制。口コミは実際に鑑定を受けた方だけが投稿でき、運営が内容を確認してから掲載しています。</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid rev">
          <div>
            <span className="gold" style={{ fontFamily: "var(--en)", fontStyle: "italic", fontSize: 19, letterSpacing: ".12em" }}>Our fortune tellers</span>
            <h2 style={{ fontSize: 25, letterSpacing: ".1em" }}>在籍しているのは、<br />審査を通過した{tellers.filter((t) => t.published).length}名の占い師です。</h2>
            <p>月あかりの占い師は、占い館や対面鑑定での実績をもとに、運営による面談と模擬鑑定を経て在籍しています。占術の知識だけでなく、お客様の気持ちに寄り添う姿勢を大切にしています。</p>
            <ul className="checks"><li>有償鑑定の経験が1年以上</li><li>運営スタッフによる面談・模擬鑑定</li><li>在籍後もお客様の口コミを定期的に確認</li></ul>
            <Link href="/tellers" className="btn btn-outline">占い師一覧を見る</Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/photos/kyoto-canal.webp" alt="夕暮れの京都・白川沿いの町並み" style={{ aspectRatio: "4/3", objectFit: "cover" }} />
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead en="Moon & culture" title="名前に込めた想い" lead="日本では古くから、月を眺め、その満ち欠けに季節や心の移ろいを重ねてきました。暗い夜道をそっと照らす月あかりのように、迷ったときの道しるべになれたら。そんな想いを名前に込めています。" />
          <div className="grid g3">
            {PRINTS.map((p) => (
              <figure key={p.src} className="print-frame">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/photos/${p.src}.webp`} alt={`歌川広重「${p.title}」`} loading="lazy" style={{ aspectRatio: "3/2", objectFit: "cover" }} />
                <figcaption><b style={{ color: "var(--ink)", fontSize: 13 }}>歌川広重「{p.title}」</b><br />{p.note}</figcaption>
              </figure>
            ))}
          </div>
          <p className="small muted mt-2 mb-0">浮世絵画像：メトロポリタン美術館 Open Access（CC0・パブリックドメイン）</p>
        </div>
      </section>

      <section className="cta-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/photos/moon-clouds.webp" alt="" className="bg" loading="lazy" />
        <div className="container narrow">
          <span className="en">Begin tonight</span>
          <h2>まずは、話してみませんか。</h2>
          <p>新規登録で{settings.signupPoints.toLocaleString()}ptをプレゼントしています。</p>
          <div className="cta-actions">
            <Link href="/register" className="btn btn-shu btn-lg">無料会員登録</Link>
            <Link href="/contact" className="btn btn-outline-invert btn-lg">お問い合わせ</Link>
          </div>
        </div>
      </section>
    </>
  );
}
