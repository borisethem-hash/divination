import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDateTime, jstDateStr } from "@/lib/time";
import { completedCount } from "@/lib/logic";

export const metadata = { title: "鑑定履歴・売上" };

export default async function TellerHistory() {
  const { teller } = await requireTeller();
  const db = readDb();
  const done = db.reservations.filter((r) => r.tellerId === teller.id && r.status === "completed").sort((a, b) => b.startAt.localeCompare(a.startAt));
  const month = jstDateStr().slice(0, 7);
  const rows = done.map((r) => ({ r, c: db.calls.find((x) => x.reservationId === r.id), u: db.users.find((x) => x.id === r.userId)! }));
  const monthRows = rows.filter((x) => x.c?.endedAt && jstDateStr(new Date(x.c.endedAt)).startsWith(month));
  const reviews = db.reviews.filter((v) => v.tellerId === teller.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <h1>鑑定履歴・売上</h1>
      <div className="grid g3 mb-3">
        <div className="stat"><div className="k">今月の鑑定数</div><div className="v">{monthRows.length}<small> 件</small></div></div>
        <div className="stat"><div className="k">今月の鑑定時間</div><div className="v">{monthRows.reduce((s, x) => s + (x.c?.billedMinutes ?? 0), 0)}<small> 分</small></div></div>
        <div className="stat"><div className="k">今月の鑑定売上</div><div className="v">{monthRows.reduce((s, x) => s + (x.c?.amount ?? 0), 0).toLocaleString()}<small> 円</small></div></div>
      </div>
      <div className="table-wrap mb-3">
        <table className="table">
          <thead><tr><th>日時</th><th>お客様</th><th>タイプ</th><th>時間</th><th className="right">鑑定料</th></tr></thead>
          <tbody>{rows.map(({ r, c, u }) => (
            <tr key={r.id}><td>{formatDateTime(c?.startedAt ?? r.startAt)}</td><td>{u.name} 様 <span className="small muted">（通算{completedCount(db, u.id, teller.id)}回）</span></td><td>{r.type === "fixed" ? `時間指定 ${r.durationMin}分` : "従量制"}</td><td>{c?.billedMinutes ?? "-"}分</td><td className="right">{(c?.amount ?? 0).toLocaleString()}円</td></tr>
          ))}</tbody>
        </table>
      </div>
      <h2 style={{ fontSize: 18 }}>届いた口コミ</h2>
      {reviews.map((v) => (
        <div key={v.id} className="notice-row"><time>{formatDateTime(v.createdAt)}</time><div><span className="stars">{"★".repeat(v.rating)}</span> <span className="small muted">{v.status === "published" ? "掲載中" : v.status === "pending" ? "運営確認中" : "非掲載"}</span><p className="small mb-0">{v.body}</p></div></div>
      ))}
    </>
  );
}
