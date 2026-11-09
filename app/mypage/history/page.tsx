import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "鑑定履歴" };

export default async function HistoryPage() {
  const user = await requireRole("user", "/mypage/history");
  const db = readDb();
  const done = db.reservations.filter((r) => r.userId === user.id && r.status === "completed").sort((a, b) => b.startAt.localeCompare(a.startAt));
  const counts = new Map<string, number>();
  done.forEach((r) => counts.set(r.tellerId, (counts.get(r.tellerId) ?? 0) + 1));
  return (
    <>
      <h1>鑑定履歴・口コミ</h1>
      <p className="small muted">鑑定を受けた占い師には口コミを投稿できます（各占い師1件まで）。</p>
      {done.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>日時</th><th>占い師</th><th>タイプ</th><th>通話時間</th><th>料金</th><th>口コミ</th></tr></thead>
            <tbody>
              {done.map((r) => {
                const t = db.tellers.find((x) => x.id === r.tellerId)!;
                const c = db.calls.find((x) => x.reservationId === r.id);
                const reviewed = db.reviews.find((v) => v.userId === user.id && v.tellerId === t.id);
                return (
                  <tr key={r.id}>
                    <td>{formatDateTime(c?.startedAt ?? r.startAt)}</td>
                    <td><Link href={`/tellers/${t.id}`}>{t.name}</Link><br /><span className="small muted">利用{counts.get(t.id)}回目まで</span></td>
                    <td>{r.type === "fixed" ? `時間指定 ${r.durationMin}分` : "従量制"}</td>
                    <td>{c?.billedMinutes ?? "-"}分</td>
                    <td>{(c?.amount ?? 0).toLocaleString()}pt</td>
                    <td>{reviewed ? <span className="small muted">{reviewed.status === "published" ? "掲載中" : reviewed.status === "pending" ? "確認中" : "非掲載"}</span> : <Link href={`/mypage/review/${t.id}`} className="btn btn-sm btn-outline">口コミを書く</Link>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">鑑定履歴はまだありません</div>}
    </>
  );
}
