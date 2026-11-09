import Link from "next/link";
import { readDb } from "@/lib/db";
import { HeroScene, Banner, PatternBand, TellerImage } from "@/components/Art";
import TellerCard, { Stars } from "@/components/TellerCard";
import { publishedTellers } from "@/lib/view";
import { formatJpDate } from "@/lib/time";
import { DEMO_ACCOUNTS } from "@/lib/seed";

export default function Home() {
  const db = readDb();
  const { settings } = db;
  const tellers = publishedTellers(db);
  const waiting = tellers.filter((t) => t.teller.status === "waiting");
  const minPrice = Math.min(...tellers.map((t) => t.teller.pricePerMin));
  const reviews = db.reviews.filter((r) => r.status === "published").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const posts = db.posts.filter((p) => p.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <section className="hero">
        <HeroScene className="hero-bg" />
        <div className="container hero-content">
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroText}</p>
          <div className="badges">
            <span>アプリ不要</span><span>通話料 0円</span><span>1分 {minPrice}円〜</span><span>承認制の安心予約</span>
          </div>
          <div className="flex">
            <Link href="/tellers?status=waiting" className="btn btn-shu btn-lg">今すぐ占える占い師</Link>
            <Link href="/register" className="btn btn-outline btn-lg">無料会員登録（{settings.signupPoints.toLocaleString()}pt）</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head"><span className="en">Waiting now</span><h2>ただいま待機中の占い師</h2></div>
          {waiting.length ? (
            <div className="grid g4">{waiting.slice(0, 8).map((t) => <TellerCard key={t.teller.id} teller={t.teller} rating={t.rating} reviewCount={t.reviewCount} today={t.today} />)}</div>
          ) : <div className="empty">現在待機中の占い師はいません。日時を指定して予約リクエストができます。</div>}
          <div className="center mt-3"><Link href="/tellers" className="btn btn-outline">すべての占い師を見る</Link></div>
        </div>
      </section>

      <section className="section section-soft" style={{ position: "relative" }}>
        <div style={{ position: "absolute", inset: 0 }}><PatternBand kind="asanoha" /></div>
        <div className="container" style={{ position: "relative" }}>
          <div className="sec-head"><span className="en">Features</span><h2>月あかりが選ばれる理由</h2></div>
          <div className="grid g3">
            <div className="card feature"><div className="num">POINT 01</div><div className="big">通話料 0円</div><h3>アプリ不要のブラウザ通話</h3><p className="small muted">スマホ・PCのブラウザから、ボタン一つで高音質通話。電話回線を使わないので通話料はかかりません。</p></div>
            <div className="card feature"><div className="num">POINT 02</div><div className="big">1分 {minPrice}円〜</div><h3>鑑定料を適正価格に</h3><p className="small muted">通話料と過度な広告費をなくし、その分を鑑定料に還元。質の高い鑑定をお求めやすい価格でお届けします。</p></div>
            <div className="card feature"><div className="num">POINT 03</div><div className="big">対面実績</div><h3>占い館出身の本格派</h3><p className="small muted">対面鑑定の現場で経験を積んだ占い師だけが在籍。審査を通過した確かな鑑定力でお応えします。</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head"><span className="en">Plans</span><h2>2つの鑑定スタイル</h2></div>
          <div className="grid g2">
            <div className="card">
              <span className="tag tag-gold">時間指定</span>
              <h3 className="mt-1">20分・30分・45分・60分の定額鑑定</h3>
              <p className="muted small">あらかじめ時間を決めて予約。終了時間が近づくとお知らせし、時間になると自動で終了するので「気づいたら高額に」がありません。</p>
              <p className="mb-0">例：1分150円の占い師で30分 → <b className="shu">4,500円</b></p>
            </div>
            <div className="card">
              <span className="tag tag-gold">従量制</span>
              <h3 className="mt-1">納得いくまで話せる1分単位の鑑定</h3>
              <p className="muted small">時間を決めずに、お話が終わるまで鑑定が続きます。料金は通話した分だけ。ポイント残高が上限なので使いすぎの心配もありません。</p>
              <p className="mb-0">例：1分150円の占い師で18分 → <b className="shu">2,700円</b></p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container narrow">
          <div className="sec-head"><span className="en">Flow</span><h2>ご利用の流れ</h2></div>
          <div className="steps">
            <div className="step"><div><h3>無料会員登録</h3><p className="small muted mb-0">メールアドレスだけで登録完了。今なら{settings.signupPoints.toLocaleString()}ptをプレゼント。</p></div></div>
            <div className="step"><div><h3>占い師に鑑定リクエスト</h3><p className="small muted mb-0">「今すぐ」または希望日時と、時間指定／従量制を選んでリクエスト。</p></div></div>
            <div className="step"><div><h3>占い師が承認して予約確定</h3><p className="small muted mb-0">占い師が内容を確認して承認すると確定。メールとマイページでお知らせします。</p></div></div>
            <div className="step"><div><h3>ブラウザから入室して鑑定</h3><p className="small muted mb-0">時間になったらマイページの「入室する」を押すだけ。アプリも電話番号の入力も不要です。</p></div></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sec-head"><span className="en">Voices</span><h2>お客様の口コミ</h2></div>
          <div className="grid g3">
            {reviews.map((r) => {
              const t = db.tellers.find((x) => x.id === r.tellerId)!;
              return (
                <div key={r.id} className="card">
                  <div className="flex" style={{ alignItems: "center" }}>
                    <div style={{ width: 48, height: 58, overflow: "hidden", border: "1px solid var(--line)" }}><TellerImage teller={t} /></div>
                    <div><Link href={`/tellers/${t.id}`}><b>{t.name}</b></Link> 先生<br /><Stars value={r.rating} /></div>
                  </div>
                  <p className="small mt-2 mb-0">{r.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="sec-head"><span className="en">News &amp; Events</span><h2>お知らせ・イベント</h2></div>
          <div className="grid g4">
            {posts.map((p, i) => (
              <Link key={p.id} href={`/news/${p.slug}`} className="tcard">
                <div className="ph" style={{ aspectRatio: "5/3" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.coverImage ? <img src={p.coverImage} alt="" /> : <Banner seed={i + (p.type === "event" ? 2 : 0)} />}
                </div>
                <div className="body">
                  <span className="small muted">{formatJpDate(p.createdAt)} <span className="tag">{p.type === "event" ? "イベント" : "お知らせ"}</span></span>
                  <span className="name" style={{ fontSize: 15 }}>{p.title}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="center mt-3"><Link href="/news" className="btn btn-outline">一覧を見る</Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow center">
          <h2>あなたの心に、月あかりを。</h2>
          <p className="muted">悩みを一人で抱え込まずに、まずは話してみませんか。</p>
          <Link href="/register" className="btn btn-shu btn-lg">無料会員登録はこちら</Link>
          <div className="demo-box mt-4" style={{ textAlign: "left" }}>
            <b>デモ用ログイン情報</b>（確認用のテンプレートアカウントです）
            <table className="mt-1"><tbody>{DEMO_ACCOUNTS.map((a) => <tr key={a.email}><td>{a.role}</td><td>{a.email}</td><td>{a.password}</td></tr>)}</tbody></table>
            <div className="mt-1"><Link href="/login">ログイン画面へ →</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
