import PageHead from "@/components/PageHead";

export const metadata = { title: "特定商取引法に基づく表記" };

export default function LawPage() {
  const rows = [
    ["販売事業者", "（運営会社名を入力してください）"],
    ["運営責任者", "（代表者名を入力してください）"],
    ["所在地", "（所在地を入力してください）"],
    ["お問い合わせ", "お問い合わせフォームよりご連絡ください"],
    ["販売価格", "各占い師のプロフィールページに表示（1分あたりの鑑定料）"],
    ["商品代金以外の必要料金", "インターネット接続に係る通信料（通話料はかかりません）"],
    ["支払方法", "クレジットカード、銀行振込"],
    ["提供時期", "予約確定後、予約日時に提供"],
    ["返品・キャンセル", "サービスの性質上、鑑定後の返金はできません。鑑定開始前の予約はキャンセル可能です。"],
  ];
  return (
    <>
      <PageHead title="特定商取引法に基づく表記" en="Legal" image="/images/photos/maple-stone.webp" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        <div className="table-wrap"><table className="table"><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}
