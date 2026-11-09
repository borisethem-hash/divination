import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";

export const metadata = { title: "ご利用方法・料金" };

export default function GuidePage() {
  const { settings, tellers } = readDb();
  const prices = tellers.filter((t) => t.published).map((t) => t.pricePerMin);
  const min = Math.min(...prices), max = Math.max(...prices);
  return (
    <>
      <PageHead title="ご利用方法・料金" en="Guide & Price" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        <h2>料金について</h2>
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

        <h2 className="mt-4">2つの鑑定タイプ</h2>
        <div className="grid g2 mb-3">
          <div className="card"><h3>時間指定（定額）</h3><p className="small mb-0">20分・30分・45分・60分から選択。料金は「鑑定時間 × 1分の鑑定料」の定額です。予約時間になると自動で終了します。占い師都合や回線トラブルで早く終了した場合は、実際に通話した時間分のみ頂戴します。</p></div>
          <div className="card"><h3>従量制</h3><p className="small mb-0">お話が終わるまで鑑定が続き、1分単位で通話した分だけ料金がかかります。開始には{settings.minMeteredMinutes}分相当以上の残高が必要で、残高がなくなると自動で終了するため使いすぎの心配がありません。</p></div>
        </div>

        <h2 className="mt-4">ご利用の流れ</h2>
        <div className="steps mb-3">
          <div className="step"><div><h3>会員登録・ポイント購入</h3><p className="small mb-0"><Link href="/register">無料会員登録</Link>後、マイページからポイントを購入できます。</p></div></div>
          <div className="step"><div><h3>鑑定リクエストを送る</h3><p className="small mb-0">占い師のページで「今すぐ鑑定」または希望日時、鑑定タイプを選んでリクエストします。</p></div></div>
          <div className="step"><div><h3>占い師の承認で予約確定</h3><p className="small mb-0">占い師がリクエストを確認し、承認すると予約確定です。メールとマイページでお知らせします。承認前ならいつでも無料でキャンセルできます。</p></div></div>
          <div className="step"><div><h3>時間になったら入室</h3><p className="small mb-0">予約開始{settings.joinBeforeMin}分前からマイページに「入室する」ボタンが表示されます。ブラウザがマイクの使用許可を求めたら「許可」を押してください。</p></div></div>
          <div className="step"><div><h3>鑑定終了・自動精算</h3><p className="small mb-0">通話終了と同時にポイントから自動精算されます。履歴はマイページでいつでも確認できます。</p></div></div>
        </div>

        <h2 className="mt-4">推奨環境</h2>
        <ul>
          <li>iPhone / iPad：Safari 最新版</li>
          <li>Android：Google Chrome 最新版</li>
          <li>パソコン：Google Chrome / Microsoft Edge / Safari 最新版</li>
          <li>安定した通信環境（Wi-Fi または 4G/5G）とマイク（イヤホンマイク推奨）</li>
        </ul>
        <div className="center mt-4"><Link href="/tellers" className="btn btn-shu btn-lg">占い師を探す</Link></div>
      </div>
    </>
  );
}
