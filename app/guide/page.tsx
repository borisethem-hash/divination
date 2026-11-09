import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";
import { SecHead } from "@/components/Section";
import { FIXED_DURATIONS } from "@/lib/logic";

export const metadata = { title: "ご利用ガイド・料金" };

const PACKS = [3000, 5000, 10000, 20000, 30000];
const bonusOf = (p: number) => (p >= 20000 ? Math.floor(p * 0.1) : p >= 10000 ? Math.floor(p * 0.05) : 0);

export default function GuidePage() {
  const { settings, tellers } = readDb();
  const prices = [...new Set(tellers.filter((t) => t.published).map((t) => t.pricePerMin))].sort((a, b) => a - b);
  const min = prices[0] ?? 0, max = prices[prices.length - 1] ?? 0;
  // 料金シミュレーション用に最大5段階の価格帯を抜き出す
  const tiers = prices.length <= 5 ? prices : [0, 0.25, 0.5, 0.75, 1].map((q) => prices[Math.round(q * (prices.length - 1))]).filter((v, i, a) => a.indexOf(v) === i);
  return (
    <>
      <PageHead title="ご利用ガイド・料金" en="Guide & Price" lead="会員登録から鑑定・精算までの流れと、わかりやすい料金のしくみをご案内します。" image="/images/photos/garden-waterfall.webp" />

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container narrow">
          <SecHead en="Price" title="料金について" />
          <div className="table-wrap mb-3">
            <table className="table">
              <tbody>
                <tr><th>通話料</th><td><b className="shu">0円</b>（ブラウザ通話のため通話料はかかりません）</td></tr>
                <tr><th>鑑定料</th><td>1分 {min}円〜{max}円（占い師ごとに異なります）</td></tr>
                <tr><th>お支払い方法</th><td>事前購入のポイント制（1pt＝1円）。クレジットカード・銀行振込</td></tr>
                <tr><th>新規登録特典</th><td>{settings.signupPoints.toLocaleString()}ptプレゼント</td></tr>
                <tr><th>まとめ購入ボーナス</th><td>10,000円以上で5%、20,000円以上で10%のボーナスpt</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="sub-head mt-4">料金シミュレーション（時間指定の場合）</h3>
          <div className="table-wrap">
            <table className="table price-table">
              <thead><tr><th>1分あたりの鑑定料</th>{FIXED_DURATIONS.map((d) => <th key={d}>{d}分</th>)}</tr></thead>
              <tbody>{tiers.map((p) => <tr key={p}><th>{p}円</th>{FIXED_DURATIONS.map((d) => <td key={d}>{(p * d).toLocaleString()}円</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="small muted mt-1">※ 従量制の場合は、通話した分数 × 1分あたりの鑑定料です（1分未満は切り上げ、開始5秒以内は無料）。</p>

          <h3 className="sub-head mt-4">ポイント購入ボーナス</h3>
          <div className="table-wrap">
            <table className="table price-table">
              <thead><tr><th>購入金額</th><th>ボーナス</th><th>ご利用いただけるポイント</th></tr></thead>
              <tbody>{PACKS.map((p) => <tr key={p}><th>{p.toLocaleString()}円</th><td className={bonusOf(p) ? "shu" : "muted"}>{bonusOf(p) ? `+${bonusOf(p).toLocaleString()}pt` : "—"}</td><td><b>{(p + bonusOf(p)).toLocaleString()}pt</b></td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container narrow">
          <SecHead en="Plans" title="2つの鑑定タイプ" />
          <div className="grid g2">
            <div className="plan"><span className="plan-label">Fixed time</span><h3>時間指定（定額）</h3><p className="small mb-0">20分・30分・45分・60分から選択。料金は「鑑定時間 × 1分の鑑定料」の定額です。予約時間になると自動で終了します。占い師都合や回線トラブルで早く終了した場合は、実際に通話した時間分のみ頂戴します。</p></div>
            <div className="plan alt"><span className="plan-label">Pay as you go</span><h3>従量制</h3><p className="small mb-0">お話が終わるまで鑑定が続き、1分単位で通話した分だけ料金がかかります。開始には{settings.minMeteredMinutes}分相当以上の残高が必要で、残高がなくなると自動で終了するため使いすぎの心配がありません。</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <SecHead en="Flow" title="ご利用の流れ" />
          <div className="steps">
            <div className="step"><div><h3>会員登録・ポイント購入</h3><p className="small mb-0"><Link href="/register">無料会員登録</Link>後、マイページからポイントを購入できます。登録特典の{settings.signupPoints.toLocaleString()}ptですぐに鑑定を受けることもできます。</p></div></div>
            <div className="step"><div><h3>鑑定リクエストを送る</h3><p className="small mb-0">占い師のページで「今すぐ鑑定」または希望日時、鑑定タイプを選んでリクエストします。ご相談内容を書いておくと、占い師が事前に目を通してくれます。</p></div></div>
            <div className="step"><div><h3>占い師の承認で予約確定</h3><p className="small mb-0">占い師がリクエストを確認し、承認すると予約確定です。メールとマイページでお知らせします。承認前ならいつでも無料でキャンセルできます。</p></div></div>
            <div className="step"><div><h3>時間になったら入室</h3><p className="small mb-0">予約開始{settings.joinBeforeMin}分前からマイページに「入室する」ボタンが表示されます。ブラウザがマイクの使用許可を求めたら「許可」を押してください。</p></div></div>
            <div className="step"><div><h3>鑑定終了・自動精算</h3><p className="small mb-0">通話終了と同時にポイントから自動精算されます。履歴はマイページでいつでも確認できます。</p></div></div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="img-band">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/photos/phone-hands.webp" alt="スマートフォンを手に持つ様子" loading="lazy" />
            <div>
              <span className="gold" style={{ fontFamily: "var(--en)", fontStyle: "italic", fontSize: 19, letterSpacing: ".12em" }}>Environment</span>
              <h2 style={{ fontSize: 24 }}>快適に通話するために</h2>
              <ul className="checks">
                <li>iPhone / iPad：Safari 最新版</li>
                <li>Android：Google Chrome 最新版</li>
                <li>パソコン：Google Chrome / Microsoft Edge / Safari 最新版</li>
                <li>Wi-Fi または 4G/5G の安定した通信環境</li>
                <li>イヤホンマイクのご利用がおすすめです</li>
              </ul>
              <p className="small muted">通話中に回線が切れても、同じ予約からすぐに再入室できます。相手が45秒以上戻らない場合は自動で終了し、実際に通話した時間分のみ精算されます。</p>
              <div className="flex"><Link href="/tellers" className="btn btn-shu">占い師を探す</Link><Link href="/faq" className="btn btn-outline">よくある質問</Link></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
