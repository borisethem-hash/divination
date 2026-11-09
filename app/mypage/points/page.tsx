import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { chargePointsAction } from "@/app/actions/user";
import { Flash } from "@/components/DashLayout";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "ポイント購入" };

const PLANS = [3000, 5000, 10000, 20000, 30000];

export default async function PointsPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const user = await requireRole("user", "/mypage/points");
  const tx = readDb().transactions.filter((t) => t.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <h1>ポイント購入・明細</h1>
      <Flash ok={ok} err={err} />
      <div className="stat mb-3" style={{ maxWidth: 320 }}><div className="k">現在のポイント残高</div><div className="v">{user.points.toLocaleString()}<small> pt</small></div></div>
      <form action={chargePointsAction} className="card form mb-3">
        <span className="label">購入金額（1pt＝1円）</span>
        <div className="radio-cards">
          {PLANS.map((p, i) => {
            const bonus = p >= 20000 ? p * 0.1 : p >= 10000 ? p * 0.05 : 0;
            return (
              <label key={p}><input type="radio" name="amount" value={p} defaultChecked={i === 2} />
                <span>{p.toLocaleString()}円<br /><small className={bonus ? "shu" : "muted"}>{bonus ? `+${bonus.toLocaleString()}pt` : "ボーナスなし"}</small></span>
              </label>
            );
          })}
        </div>
        <span className="label">お支払い方法</span>
        <div className="radio-cards">
          <label><input type="radio" name="method" value="card" defaultChecked /><span>クレジットカード</span></label>
          <label><input type="radio" name="method" value="bank" /><span>銀行振込</span></label>
        </div>
        <div className="alert alert-info mb-0">デモ環境のため、実際の決済は行われずポイントが即時追加されます。本番では決済代行サービス（Stripe・PAY.JP等）と連携します。</div>
        <button className="btn btn-shu btn-lg">購入する</button>
      </form>
      <h2 style={{ fontSize: 18 }}>ポイント明細</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>日時</th><th>内容</th><th className="right">ポイント</th></tr></thead>
          <tbody>{tx.map((t) => <tr key={t.id}><td>{formatDateTime(t.createdAt)}</td><td>{t.note}</td><td className="right" style={{ color: t.amount < 0 ? "var(--shu)" : "var(--green)" }}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}
