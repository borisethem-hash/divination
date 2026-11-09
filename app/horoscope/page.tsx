import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";
import { SignEmblem, MoonPhaseIcon, Crown, TellerImage } from "@/components/Art";
import { Stars } from "@/components/TellerCard";
import { dailyHoroscope } from "@/lib/horoscope";
import { moonPhase, nextPhase } from "@/lib/moon";
import { publishedTellers } from "@/lib/view";
import { formatJpDate, formatDate, jstDateStr } from "@/lib/time";

export const metadata = { title: "今日の星座占い", description: "12星座の今日の運勢ランキング。恋愛運・仕事運・金運とラッキーカラーを毎日お届けします。" };

export default function HoroscopePage() {
  const list = dailyHoroscope();
  const moon = moonPhase();
  const astro = publishedTellers(readDb()).filter((t) => t.teller.methods.some((m) => m.includes("占星術"))).slice(0, 4);
  return (
    <>
      <PageHead title="今日の星座占い" en="Daily horoscope" lead={`${formatJpDate(new Date().toISOString())}の12星座ランキング。毎日0時に更新されます。`} image="/images/photos/milkyway-trees.webp" />
      <div className="container section" style={{ paddingTop: 32 }}>
        <div className="horo-wrap">
          <div>
            <div className="horo-list">
              {list.map((h) => (
                <div key={h.sign.key} id={h.sign.key} className={`horo-row${h.rank <= 3 ? " top" : ""}`}>
                  <div className="rk">{h.rank <= 3 ? <Crown rank={h.rank} size={44} /> : <>{h.rank}<small>位</small></>}</div>
                  <SignEmblem char={h.sign.char} size={56} />
                  <div>
                    <h3>{h.sign.name}<small>{h.sign.range}</small></h3>
                    <p>{h.message}</p>
                  </div>
                  <div className="horo-luck">
                    <span><span className="k">恋愛運</span><Stars value={h.love} /></span>
                    <span><span className="k">仕事運</span><Stars value={h.work} /></span>
                    <span><span className="k">金運</span><Stars value={h.money} /></span>
                    <span><span className="k">ラッキーカラー</span>{h.color}</span>
                    <span><span className="k">ラッキーアイテム</span>{h.item}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="small muted mt-2">※ 星座占いは生まれた日の太陽の位置による簡易的な占いです。娯楽としてお楽しみください。より詳しく知りたい方は、占星術の占い師にホロスコープ鑑定をご依頼ください。</p>
          </div>
          <aside>
            <div className="moon-widget">
              <span className="k">Moon phase</span>
              <MoonPhaseIcon age={moon.age} size={96} />
              <b>{moon.name}</b>
              <span className="small">月齢 {moon.age.toFixed(1)}</span>
              <p>{moon.note}</p>
              <small>次の満月 {formatDate(jstDateStr(nextPhase("full")))}<br />次の新月 {formatDate(jstDateStr(nextPhase("new")))}</small>
            </div>
            <div className="side-box mt-2" style={{ border: "1px solid var(--line)", padding: 18 }}>
              <h3 style={{ fontSize: 15, borderBottom: "1px solid var(--line)", paddingBottom: 8 }}>星を読む占い師</h3>
              {astro.map((t) => (
                <Link key={t.teller.id} href={`/tellers/${t.teller.id}`} className="side-post" style={{ gridTemplateColumns: "48px 1fr" }}>
                  <span className="th" style={{ aspectRatio: "5/6" }}><TellerImage teller={t.teller} /></span>
                  <span><b>{t.teller.name}</b><br /><small className="muted">{t.teller.methods.join("・")}</small></span>
                </Link>
              ))}
              <div className="mt-1 small"><Link href={`/tellers?method=${encodeURIComponent("西洋占星術")}`}>占星術の占い師をもっと見る →</Link></div>
            </div>
            <div className="mt-2"><Link href="/column/moon-phases" className="btn btn-outline btn-block">コラム：満月と新月の過ごし方</Link></div>
          </aside>
        </div>
      </div>
    </>
  );
}
