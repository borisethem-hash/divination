import Link from "next/link";
import PageHead from "@/components/PageHead";
import { SecHead } from "@/components/Section";
import { readDb } from "@/lib/db";

export const metadata = { title: "占い師募集・アフィリエイト" };

export default async function RecruitPage() {
  const { settings } = await readDb();
  return (
    <>
      <PageHead title="占い師募集・アフィリエイト" en="Recruit" lead="対面鑑定の経験を、オンラインで活かしませんか。" image="/images/photos/fushimi.webp" />

      <section className="section">
        <div className="container">
          <div className="img-band">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/photos/torii-tunnel.webp" alt="連なる朱色の鳥居" loading="lazy" />
            <div>
              <span className="gold" style={{ fontFamily: "var(--en)", fontStyle: "italic", fontSize: 19, letterSpacing: ".12em" }}>Join us</span>
              <h2 style={{ fontSize: 25, letterSpacing: ".08em", lineHeight: 1.7 }}>占い館の運営経験から生まれた、<br />占い師にも公正な電話占い。</h2>
              <p>月あかりは、通話料と過剰な広告費をなくすことで、お客様には適正な料金を、占い師の皆さまには公正な報酬をお届けしています。ご自身のペースで、得意な占術を活かしてください。</p>
              <Link href="/contact?category=占い師として登録したい" className="btn btn-shu">応募・お問い合わせ</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SecHead en="Merit" title="月あかりで働く3つのメリット" />
          <div className="values">
            <div><span className="no">01</span><h3>自分で決める待機時間</h3><p className="small muted mb-0">スケジュールを事前登録すると、時間になれば自動で「待機中」に。待機中でも「離席」「受付終了」にワンタッチで切り替えできます。</p></div>
            <div><span className="no">02</span><h3>承認制の予約</h3><p className="small muted mb-0">リクエスト内容と相談内容を確認してから承認。無理のない範囲で鑑定の予定を組めます。</p></div>
            <div><span className="no">03</span><h3>SNS集客で報酬</h3><p className="small muted mb-0">専用の紹介リンクから登録したお客様の鑑定料の{settings.affiliateRate}%＋登録1件{settings.affiliateSignupBonus.toLocaleString()}円をお支払いします。</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <SecHead en="Affiliate" title="アフィリエイトの仕組み" />
          <div className="steps mb-3">
            <div className="step"><div><h3>専用リンクを発行</h3><p className="small mb-0">占い師ページで、あなた専用の紹介リンク（例：/r/あなたのコード）とブログ用バナーコードを取得できます。</p></div></div>
            <div className="step"><div><h3>SNS・ブログで紹介</h3><p className="small mb-0">X、Instagram、ブログなどにリンクを掲載。クリック数はリアルタイムで確認できます。</p></div></div>
            <div className="step"><div><h3>紹介ユーザーの登録・鑑定で報酬発生</h3><p className="small mb-0">リンク経由（30日間有効）で登録したお客様は、あなたの紹介ユーザーとして記録されます。登録報酬に加え、そのお客様がどの占い師の鑑定を受けても鑑定料の{settings.affiliateRate}%が継続的に発生します。</p></div></div>
          </div>
          <h2 className="faq-cat">応募資格</h2>
          <ul className="checks">
            <li>対面・電話・チャットなどでの有償鑑定経験が1年以上ある方</li>
            <li>パソコンまたはスマートフォンで安定した通話環境を用意できる方</li>
            <li>お客様の心に寄り添い、誠実な鑑定ができる方</li>
          </ul>
          <h2 className="faq-cat">選考の流れ</h2>
          <ol className="small" style={{ lineHeight: 2 }}>
            <li>お問い合わせフォームから応募（占術・鑑定歴をご記入ください）</li>
            <li>運営スタッフとのオンライン面談</li>
            <li>模擬鑑定（20分程度）</li>
            <li>プロフィール作成・待機スケジュール登録後、デビュー</li>
          </ol>
          <div className="center mt-4"><Link href="/contact?category=占い師として登録したい" className="btn btn-shu btn-lg">応募・お問い合わせ</Link></div>
        </div>
      </section>
    </>
  );
}
