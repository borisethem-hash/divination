import Link from "next/link";
import PageHead from "@/components/PageHead";
import { readDb } from "@/lib/db";

export const metadata = { title: "よくある質問" };

export default function FaqPage() {
  const { settings } = readDb();
  const faqs: [string, string][] = [
    ["アプリのインストールは必要ですか？", "不要です。スマートフォン・パソコンのブラウザ（Safari / Chrome など）からそのまま通話できます。"],
    ["通話料はかかりますか？", "かかりません。インターネット通話のため、お支払いいただくのは鑑定料のみです（通信量はご契約のプランに準じます）。"],
    ["予約はいつ確定しますか？", "鑑定リクエストを占い師が承認した時点で確定します。承認されるとメールとマイページでお知らせします。"],
    ["時間指定と従量制の違いは？", "時間指定は20〜60分の定額で、時間になると自動終了します。従量制はお話が終わるまで続き、1分単位で通話した分だけの料金です。"],
    ["キャンセルはできますか？", "承認前・承認後ともに、鑑定開始前であればマイページから無料でキャンセルできます。"],
    ["通話中に回線が切れてしまったら？", "同じ予約からすぐに再入室できます。相手が45秒以上戻らない場合は自動終了となり、従量制は実際の通話時間分、時間指定も実際の通話時間分のみの精算となります。"],
    ["口コミはどうやって投稿しますか？", `鑑定を受けた占い師について、マイページの鑑定履歴から投稿できます。同じ占い師を${settings.reviewThreshold}回以上ご利用いただくと、口コミ投稿のご案内が自動で届きます。`],
    ["占い師として登録したいのですが？", "占い師募集ページをご覧のうえ、お問い合わせフォームからご応募ください。"],
  ];
  return (
    <>
      <PageHead title="よくある質問" en="FAQ" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        {faqs.map(([q, a]) => (
          <details className="faq" key={q}><summary>{q}</summary><div>{a}</div></details>
        ))}
        <div className="card-flat center mt-4">
          <p>解決しない場合はお気軽にお問い合わせください。</p>
          <Link href="/contact" className="btn">お問い合わせ</Link>
        </div>
      </div>
    </>
  );
}
