import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { payEarningsAction } from "@/app/actions/admin";

export default async function AdminAffiliate({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const db = readDb();
  const rows = db.tellers.map((t) => {
    const e = db.affiliateEarnings.filter((x) => x.tellerId === t.id);
    return {
      t,
      clicks: db.affiliateClicks.filter((c) => c.tellerId === t.id).length,
      signups: db.users.filter((u) => u.referredBy === t.id).length,
      total: e.reduce((s, x) => s + x.amount, 0),
      unpaid: e.filter((x) => !x.paid).reduce((s, x) => s + x.amount, 0),
    };
  }).sort((a, b) => b.total - a.total);
  return (
    <>
      <h1>アフィリエイト</h1>
      <Flash ok={ok} />
      <div className="card-flat small mb-3">報酬設定：紹介登録1件 <b>{db.settings.affiliateSignupBonus.toLocaleString()}円</b> ＋ 紹介ユーザーの鑑定料の <b>{db.settings.affiliateRate}%</b>（<a href="/admin/settings">変更</a>）。紹介Cookieの有効期間は30日です。</div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>占い師</th><th>コード</th><th>クリック</th><th>紹介登録</th><th>CVR</th><th className="right">累計報酬</th><th className="right">未払い</th><th></th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.t.id}>
              <td>{r.t.name}</td><td className="small">/r/{r.t.affiliateCode}</td><td>{r.clicks}</td><td>{r.signups}</td>
              <td>{r.clicks ? ((r.signups / r.clicks) * 100).toFixed(1) : "0.0"}%</td>
              <td className="right">{r.total.toLocaleString()}円</td>
              <td className="right shu">{r.unpaid.toLocaleString()}円</td>
              <td className="right">{r.unpaid > 0 && <form action={payEarningsAction}><input type="hidden" name="tellerId" value={r.t.id} /><button className="btn btn-sm">支払済にする</button></form>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
