import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { adjustPointsAction } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/time";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string; q?: string }> }) {
  const { ok, err, q } = await searchParams;
  const db = await readDb();
  const users = db.users.filter((u) => u.role === "user" && (!q || u.name.includes(q) || u.email.includes(q))).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <h1>ユーザー管理</h1>
      <Flash ok={ok} err={err} />
      <form className="flex mb-2" method="get"><input className="input" name="q" defaultValue={q} placeholder="名前・メールで検索" style={{ maxWidth: 320 }} /><button className="btn btn-sm">検索</button></form>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>登録日</th><th>名前</th><th>メール</th><th>紹介元</th><th>鑑定数</th><th className="right">残高</th><th>ポイント調整</th></tr></thead>
          <tbody>{users.map((u) => {
            const ref = u.referredBy ? db.tellers.find((t) => t.id === u.referredBy) : undefined;
            return (
              <tr key={u.id}>
                <td className="small">{formatDateTime(u.createdAt)}</td>
                <td><b>{u.name}</b></td>
                <td className="small">{u.email}</td>
                <td className="small">{ref ? ref.name : "-"}</td>
                <td>{db.reservations.filter((r) => r.userId === u.id && r.status === "completed").length}</td>
                <td className="right">{u.points.toLocaleString()}pt</td>
                <td>
                  <form action={adjustPointsAction} className="flex" style={{ gap: 4, flexWrap: "nowrap" }}>
                    <input type="hidden" name="id" value={u.id} />
                    <input className="input" type="number" name="amount" placeholder="±pt" style={{ width: 90, padding: "6px 8px" }} />
                    <input className="input" name="note" placeholder="理由" style={{ width: 120, padding: "6px 8px" }} />
                    <button className="btn btn-sm">反映</button>
                  </form>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
