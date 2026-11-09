import Link from "next/link";
import { readDb } from "@/lib/db";
import { TellerImage, TopicIcon, MethodIcon, Crown, SignEmblem, MoonPhaseIcon } from "@/components/Art";
import TellerCard, { Stars } from "@/components/TellerCard";
import { SecHead } from "@/components/Section";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import { PostCard, NewsRow } from "@/components/PostCards";
import { publishedTellers, ranking, TOPICS, METHODS } from "@/lib/view";
import { dailyHoroscope } from "@/lib/horoscope";
import { moonPhase, nextPhase } from "@/lib/moon";
import { formatJpDate, formatDate, jstDateStr } from "@/lib/time";
import { DEMO_ACCOUNTS } from "@/lib/seed";

const TRUST = [
  { title: "通話料 0円", note: "ブラウザ通話で電話代は不要", icon: <path d="M10 6h8l3 8-5 3c2 4 5 7 9 9l3-5 8 3v8c0 2-2 4-4 4C18 36 8 26 6 10c0-2 2-4 4-4Z" /> },
  { title: "アプリ不要", note: "スマホ・PCからすぐ繋がる", icon: <><rect x="12" y="4" width="20" height="36" /><path d="M19 35h6M12 10h20" /></> },
  { title: "承認制の予約", note: "占い師が確認して予約確定", icon: <><rect x="6" y="9" width="32" height="29" /><path d="M6 17h32M13 5v8M31 5v8M15 28l5 4 9-9" /></> },
  { title: "占い館の実績", note: "対面鑑定で培った確かな力", icon: <><path d="M4 12c12-4 24-4 36 0M8 18h28M12 18v22M32 18v22M6 12l2 6M38 12l-2 6" /></> },
];

export default function Home() {
  const db = readDb();
  const { settings } = db;
  const tellers = publishedTellers(db);
  const waiting = tellers.filter((t) => t.teller.status === "waiting");
  const minPrice = tellers.length ? Math.min(...tellers.map((t) => t.teller.pricePerMin)) : 0;
  const ranks = ranking(db).slice(0, 3);
  const reviews = db.reviews.filter((r) => r.status === "published").sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const published = db.posts.filter((p) => p.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const columns = published.filter((p) => p.type === "column").slice(0, 3);
  const news = published.filter((p) => p.type !== "column").slice(0, 5);
  const banners = db.banners.filter((b) => b.published).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 4);
  const horo = dailyHoroscope().slice(0, 3);
  const moon = moonPhase();
  const nextFull = jstDateStr(nextPhase("full"));
  const nextNew = jstDateStr(nextPhase("new"));
  const showcase = waiting.length ? waiting : tellers;

  return (
    <>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/photos/moonlight-water.webp" alt="" className="hero-bg" fetchPriority="high" />
        <div className="container hero-inner">
          <div className="hero-content">
            <p className="hero-kicker">アプリ不要・通話料0円の電話占い</p>
            <h1>{settings.heroTitle}</h1>
            <p className="hero-text">{settings.heroText}</p>
            <ul className="hero-points">
              <li><b>0</b>円<small>通話料</small></li>
              <li><b>{minPrice}</b>円〜<small>1分あたり</small></li>
              <li><b>{tellers.length}</b>名<small>在籍占い師</small></li>
            </ul>
            <div className="hero-cta">
              <Link href="/tellers?status=waiting" className="btn btn-shu btn-lg">今すぐ占える占い師</Link>
              <Link href="/register" className="btn btn-outline-invert btn-lg">無料会員登録（{settings.signupPoints.toLocaleString()}pt）</Link>
            </div>
          </div>
          <aside className="hero-panel hide-sp" aria-label="ただいま待機中の占い師">
            <div className="hp-head"><span className="pulse" />ただいま待機中<b>{waiting.length}</b>名</div>
            {waiting.slice(0, 3).map((t) => (
              <Link key={t.teller.id} href={`/tellers/${t.teller.id}`} className="hp-row">
                <span className="hp-ph"><TellerImage teller={t.teller} /></span>
                <span className="hp-info"><b>{t.teller.name}</b><small>{t.teller.methods.join("・")}</small><span className="small"><Stars value={t.rating} /> {t.rating ? t.rating.toFixed(1) : "-"}</span></span>
                <span className="hp-price"><b>{t.teller.pricePerMin}</b>円/分</span>
              </Link>
            ))}
            {!waiting.length && <p className="small muted" style={{ padding: "16px 18px", margin: 0 }}>現在待機中の占い師はいません。日時を指定して予約リクエストができます。</p>}
            <Link href="/tellers?status=waiting" className="hp-more">待機中の占い師をすべて見る →</Link>
          </aside>
        </div>
      </section>

      <section className="trust" aria-label="月あかりの特長">
        <div className="container trust-inner">
          {TRUST.map((t) => (
            <div key={t.title} className="trust-item">
              <svg className="ic" width="40" height="40" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{t.icon}</svg>
              <span><b>{t.title}</b><small>{t.note}</small></span>
            </div>
          ))}
        </div>
      </section>

      {banners.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <div className="promo-grid">
              {banners.map((b) => (
                <Link key={b.id} href={b.link || "/"} className="promo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image} alt="" loading="lazy" />
                  <span className="promo-body"><span className="promo-label">{b.label}</span><b>{b.title}</b><small>{b.subtitle}</small></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <SecHead left en="Waiting now" title="ただいま待機中の占い師" lead={waiting.length ? `${waiting.length}名の占い師が待機中です。「今すぐ鑑定」をリクエストすると、承認後すぐに通話できます。` : "現在待機中の占い師はいません。日時を指定して予約リクエストができます。"} more={{ href: "/tellers?status=waiting", label: "待機中の占い師一覧" }} />
          <div className="grid g4">{showcase.slice(0, 8).map((t) => <TellerCard key={t.teller.id} teller={t.teller} rating={t.rating} reviewCount={t.reviewCount} today={t.today} />)}</div>
          <div className="center mt-4"><Link href="/tellers" className="btn btn-outline btn-lg">すべての占い師を見る（{tellers.length}名）</Link></div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead en="Search" title="お悩み・占術から探す" lead="気になるテーマや占術を選ぶと、得意な占い師が見つかります。" />
          <h3 className="sub-head">相談内容から探す</h3>
          <div className="topic-grid">
            {TOPICS.map((t) => (
              <Link key={t.name} href={`/tellers?specialty=${encodeURIComponent(t.name)}`} className="topic">
                <span className="ic"><TopicIcon name={t.name} size={34} /></span><b>{t.name}</b><small>{t.note}</small>
              </Link>
            ))}
          </div>
          <h3 className="sub-head mt-4">占術から探す</h3>
          <div className="method-grid">
            {METHODS.map((m) => (
              <Link key={m.name} href={`/tellers?method=${encodeURIComponent(m.name)}`} className="method">
                <span className="ic"><MethodIcon name={m.name} size={52} /></span><b>{m.name}</b><small>{m.note}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="ranking">
        <div className="container">
          <SecHead left en="Ranking" title="今月の人気占い師ランキング" lead="直近30日間の鑑定数をもとに集計しています。" more={{ href: "/tellers?sort=popular", label: "鑑定数順で見る" }} />
          <div className="rank-grid">
            {ranks.map((t, i) => (
              <Link key={t.teller.id} href={`/tellers/${t.teller.id}`} className={`rank-card r${i + 1}`}>
                <div className="rank-ph"><TellerImage teller={t.teller} /><span className="rank-crown"><Crown rank={i + 1} size={40} /></span></div>
                <div className="rank-body">
                  <span className="rank-no">No.{i + 1}</span>
                  <b className="name">{t.teller.name}<small>{t.teller.kana}</small></b>
                  <div className="tags">{t.teller.methods.map((m) => <span key={m} className="tag">{m}</span>)}</div>
                  <p className="copy">{t.teller.catchcopy}</p>
                  <div className="rank-meta"><span><Stars value={t.rating} /> {t.rating ? t.rating.toFixed(1) : "-"}</span><span>今月の鑑定 <b>{t.recent}</b>件</span><span>1分 <b className="shu">{t.teller.pricePerMin}</b>円</span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead left en="Today's schedule" title="本日の出演スケジュール" lead={`${formatDate(jstDateStr())}の待機予定です。気になる占い師の時間に合わせて予約リクエストをどうぞ。`} more={{ href: "/tellers", label: "占い師一覧へ" }} />
          <ScheduleTimeline db={db} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SecHead en="Features" title="月あかりが選ばれる理由" />
          <div className="grid g3">
            {[
              { img: "phone-hands", num: "01", big: "通話料 0円", title: "アプリ不要のブラウザ通話", text: "スマホ・PCのブラウザから、ボタン一つで高音質通話。電話回線を使わないので通話料はかかりません。" },
              { img: "candles-glass", num: "02", big: `1分 ${minPrice}円〜`, title: "鑑定料を適正価格に", text: "通話料と過度な広告費をなくし、その分を鑑定料に還元。質の高い鑑定をお求めやすい価格でお届けします。" },
              { img: "kyoto-alley", num: "03", big: "対面実績", title: "占い館出身の本格派", text: "対面鑑定の現場で経験を積んだ占い師だけが在籍。審査を通過した確かな鑑定力でお応えします。" },
            ].map((f) => (
              <div key={f.num} className="feature-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="ph"><img src={`/images/photos/${f.img}.webp`} alt="" loading="lazy" /><span className="num">Point {f.num}</span></div>
                <div className="body"><div className="big">{f.big}</div><h3>{f.title}</h3><p className="small muted mb-0">{f.text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead en="Plans" title="2つの鑑定スタイル" lead="予算を決めて安心の「時間指定」と、納得いくまで話せる「従量制」から選べます。" />
          <div className="grid g2">
            <div className="plan">
              <span className="plan-label">Fixed time</span>
              <h3>時間指定（定額）</h3>
              <p className="small muted">20分・30分・45分・60分から選んで予約。時間になると自動で終了するので「気づいたら高額に」がありません。</p>
              <ul className="checks"><li>はじめての方におすすめ</li><li>終了3分前にお知らせ</li><li>占い師都合の早期終了は実時間分のみ</li></ul>
              <div className="example">例：1分150円の占い師で30分 → <b className="shu">4,500円</b></div>
            </div>
            <div className="plan alt">
              <span className="plan-label">Pay as you go</span>
              <h3>従量制（通話終了まで）</h3>
              <p className="small muted">時間を決めずに、お話が終わるまで鑑定が続きます。料金は通話した分だけ。ポイント残高が上限なので使いすぎの心配もありません。</p>
              <ul className="checks"><li>じっくり相談したい方に</li><li>1分単位の明朗会計</li><li>残高がなくなると自動終了</li></ul>
              <div className="example">例：1分150円の占い師で18分 → <b className="shu">2,700円</b></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SecHead en="Flow" title="ご利用の流れ" />
          <ol className="flow">
            <li><span className="no">01</span><h3>無料会員登録</h3><p>メールアドレスだけで登録完了。今なら{settings.signupPoints.toLocaleString()}ptをプレゼント。</p></li>
            <li><span className="no">02</span><h3>鑑定リクエスト</h3><p>「今すぐ」または希望日時と、時間指定／従量制を選んでリクエスト。</p></li>
            <li><span className="no">03</span><h3>占い師が承認</h3><p>占い師が内容を確認して承認すると予約確定。メールとマイページでお知らせします。</p></li>
            <li><span className="no">04</span><h3>ブラウザで鑑定</h3><p>時間になったら「入室する」を押すだけ。アプリも電話番号の入力も不要です。</p></li>
          </ol>
          <div className="center mt-4"><Link href="/guide" className="btn btn-outline">ご利用ガイド・料金を詳しく見る</Link></div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead left en="Horoscope" title="今日の星座占い" lead={`${formatJpDate(new Date().toISOString())}の運勢ランキング TOP3`} more={{ href: "/horoscope", label: "12星座すべて見る" }} />
          <div className="horo-wrap">
            <div className="horo-top">
              {horo.map((h) => (
                <Link key={h.sign.key} href={`/horoscope#${h.sign.key}`} className="horo-card">
                  <span className="rank"><Crown rank={h.rank} size={30} /></span>
                  <SignEmblem char={h.sign.char} size={56} />
                  <b>{h.sign.name}</b><small>{h.sign.range}</small>
                  <p>{h.message}</p>
                  <span className="lucky">ラッキーカラー：{h.color}</span>
                </Link>
              ))}
            </div>
            <div className="moon-widget">
              <span className="k">Moon phase</span>
              <MoonPhaseIcon age={moon.age} size={88} />
              <b>{moon.name}</b>
              <span className="small">月齢 {moon.age.toFixed(1)}</span>
              <p>{moon.note}</p>
              <small>次の満月 {formatDate(nextFull)} ／ 次の新月 {formatDate(nextNew)}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SecHead en="Voices" title="お客様の口コミ" lead="実際に鑑定を受けたお客様の声です。掲載前に運営が内容を確認しています。" />
          <div className="grid g3">
            {reviews.map((r) => {
              const t = db.tellers.find((x) => x.id === r.tellerId);
              const u = db.users.find((x) => x.id === r.userId);
              if (!t) return null;
              return (
                <div key={r.id} className="review-card">
                  <div className="rv-head"><span><Stars value={r.rating} /> <span className="muted">{u ? `${u.name.slice(0, 1)}＊＊ 様` : "匿名"}</span></span><time>{formatJpDate(r.createdAt)}</time></div>
                  <p className="rv-body">{r.body}</p>
                  <Link href={`/tellers/${t.id}`} className="rv-teller"><span className="rv-ph"><TellerImage teller={t} /></span><span><small>鑑定した占い師</small><b>{t.name} 先生</b></span></Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead left en="Column" title="占いコラム" lead="占術の基礎知識から、毎日に役立つ開運のヒントまで。" more={{ href: "/column", label: "コラム一覧" }} />
          <div className="grid g3">{columns.map((p, i) => <PostCard key={p.id} post={p} seed={i} />)}</div>
          <div className="news-block">
            <SecHead left en="News & Events" title="お知らせ・イベント" more={{ href: "/news", label: "一覧を見る" }} />
            <div className="news-list">{news.map((p) => <NewsRow key={p.id} post={p} />)}</div>
          </div>
        </div>
      </section>

      <section className="section story">
        <div className="container story-inner">
          <figure className="story-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/photos/hiroshige-tama.webp" alt="歌川広重「玉川秋月」" loading="lazy" />
            <figcaption>歌川広重「江戸近郊八景之内 玉川秋月」 メトロポリタン美術館所蔵（パブリックドメイン）</figcaption>
          </figure>
          <div className="story-text">
            <span className="en">Our story</span>
            <h2>占い館で10年。<br />対面鑑定のぬくもりを、電話でも。</h2>
            <p>月あかりは、街の占い館を約10年にわたり運営してきた経験から生まれた電話占いサービスです。対面鑑定の現場で大切にしてきた「じっくり話を聞くこと」「その方に合った言葉で伝えること」を、オンラインでもそのままお届けします。</p>
            <p>通話料や過度な広告費をなくし、その分を鑑定の質と適正な料金に還元する。それが、私たちの考える「やさしい電話占い」です。</p>
            <Link href="/about" className="btn btn-outline">月あかりについて</Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/photos/moon-clouds.webp" alt="" className="bg" loading="lazy" />
        <div className="container narrow">
          <span className="en">Begin tonight</span>
          <h2>あなたの心に、月あかりを。</h2>
          <p>悩みを一人で抱え込まずに、まずは話してみませんか。<br className="hide-sp" />今なら新規登録で{settings.signupPoints.toLocaleString()}ptをプレゼントしています。</p>
          <div className="cta-actions">
            <Link href="/register" className="btn btn-shu btn-lg">無料会員登録はこちら</Link>
            <Link href="/tellers" className="btn btn-outline-invert btn-lg">占い師を探す</Link>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="container narrow">
          <div className="demo-box">
            <b>デモ用ログイン情報</b>（確認用のテンプレートアカウントです）
            <table className="mt-1"><tbody>{DEMO_ACCOUNTS.map((a) => <tr key={a.email}><td>{a.role}</td><td>{a.email}</td><td>{a.password}</td></tr>)}</tbody></table>
            <div className="mt-1"><Link href="/login">ログイン画面へ →</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
