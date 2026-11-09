import { headers } from "next/headers";
import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDateTime, jstDateStr } from "@/lib/time";
import CopyBox from "@/components/CopyBox";

export const metadata = { title: "アフィリエイト" };

export default async function AffiliatePage() {
  const { teller } = await requireTeller();
  const db = readDb();
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  const link = `${origin}/r/${teller.affiliateCode}`;
  const regLink = `${link}?to=register`;
  const banner = `<a href="${regLink}" target="_blank" rel="noopener"><span style="display:inline-block;padding:14px 22px;background:#1f2a4d;color:#fff;font-family:serif;text-decoration:none;">${teller.name}の電話鑑定はこちら｜${db.settings.siteName}</span></a>`;
  const clicks = db.affiliateClicks.filter((c) => c.tellerId === teller.id);
  const month = jstDateStr().slice(0, 7);
  const referred = db.users.filter((u) => u.referredBy === teller.id);
  const earnings = db.affiliateEarnings.filter((e) => e.tellerId === teller.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unpaid = earnings.filter((e) => !e.paid).reduce((s, e) => s + e.amount, 0);
  const total = earnings.reduce((s, e) => s + e.amount, 0);

  return (
    <>
      <h1>アフィリエイト</h1>
      <p className="small muted">ご自身のSNS・ブログに紹介リンクを掲載してください。リンク経由で登録したお客様（Cookie有効期間30日）の登録で{db.settings.affiliateSignupBonus.toLocaleString()}円、そのお客様の鑑定料の{db.settings.affiliateRate}%が報酬として継続的に発生します。</p>
      <div className="grid g4 mb-3">
        <div className="stat"><div className="k">クリック数（今月）</div><div className="v">{clicks.filter((c) => jstDateStr(new Date(c.at)).startsWith(month)).length}</div></div>
        <div className="stat"><div className="k">紹介登録者</div><div className="v">{referred.length}<small> 人</small></div></div>
        <div className="stat"><div className="k">累計報酬</div><div className="v">{total.toLocaleString()}<small> 円</small></div></div>
        <div className="stat"><div className="k">未払い報酬</div><div className="v shu">{unpaid.toLocaleString()}<small> 円</small></div></div>
      </div>
      <div className="card form mb-3">
        <CopyBox label="プロフィールへの紹介リンク（SNS向け）" value={link} />
        <CopyBox label="会員登録ページへの紹介リンク" value={regLink} />
        <CopyBox label="ブログ用バナーHTML" value={banner} multiline />
      </div>
      <h2 style={{ fontSize: 18 }}>報酬明細</h2>
      {earnings.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>日時</th><th>種別</th><th>内容</th><th className="right">報酬</th><th>状態</th></tr></thead>
            <tbody>{earnings.map((e) => (
              <tr key={e.id}><td>{formatDateTime(e.createdAt)}</td><td>{e.kind === "signup" ? "登録" : "鑑定"}</td><td>{e.note}</td><td className="right">{e.amount.toLocaleString()}円</td><td>{e.paid ? <span className="badge b-completed">支払済</span> : <span className="badge b-requested">未払い</span>}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="empty">まだ報酬はありません</div>}
    </>
  );
}
