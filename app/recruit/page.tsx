import Link from "next/link";
import PageHead from "@/components/PageHead";
import { readDb } from "@/lib/db";

export const metadata = { title: "占い師募集・アフィリエイト" };

export default function RecruitPage() {
  const { settings } = readDb();
  return (
    <>
      <PageHead title="占い師募集・アフィリエイト" en="Recruit" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        <h2>対面鑑定の経験を、オンラインで活かしませんか</h2>
        <p>月あかりは、占い館の運営経験から生まれた電話占いサービスです。通話料と過剰な広告費をなくすことで、お客様には適正な料金を、占い師の皆さまには公正な報酬をお届けします。</p>
        <div className="grid g3 mt-3 mb-3">
          <div className="card"><h3>自分で決める待機時間</h3><p className="small mb-0">スケジュールを事前登録。待機中でも「離席」「受付終了」にワンタッチで切り替えできます。</p></div>
          <div className="card"><h3>承認制の予約</h3><p className="small mb-0">リクエスト内容を確認してから承認。無理なく鑑定の予定を組めます。</p></div>
          <div className="card"><h3>SNS集客で報酬</h3><p className="small mb-0">専用の紹介リンクから登録したお客様の鑑定料の{settings.affiliateRate}%＋登録1件{settings.affiliateSignupBonus.toLocaleString()}円をお支払い。</p></div>
        </div>
        <h2 className="mt-4">アフィリエイトの仕組み</h2>
        <div className="steps mb-3">
          <div className="step"><div><h3>専用リンクを発行</h3><p className="small mb-0">占い師ページで、あなた専用の紹介リンク（例：/r/あなたのコード）とブログ用バナーコードを取得できます。</p></div></div>
          <div className="step"><div><h3>SNS・ブログで紹介</h3><p className="small mb-0">X、Instagram、ブログなどにリンクを掲載。クリック数はリアルタイムで確認できます。</p></div></div>
          <div className="step"><div><h3>紹介ユーザーの登録・鑑定で報酬発生</h3><p className="small mb-0">リンク経由（30日間有効）で登録したお客様は、あなたの紹介ユーザーとして記録されます。登録報酬に加え、そのお客様がどの占い師の鑑定を受けても鑑定料の{settings.affiliateRate}%が継続的に発生します。</p></div></div>
        </div>
        <h2 className="mt-4">応募資格</h2>
        <ul>
          <li>対面・電話・チャットなどでの有償鑑定経験が1年以上ある方</li>
          <li>パソコンまたはスマートフォンで安定した通話環境を用意できる方</li>
          <li>お客様の心に寄り添い、誠実な鑑定ができる方</li>
        </ul>
        <div className="center mt-4"><Link href="/contact?category=占い師として登録したい" className="btn btn-shu btn-lg">応募・お問い合わせ</Link></div>
      </div>
    </>
  );
}
