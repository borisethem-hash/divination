import Link from "next/link";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { adminCancelReservationAction } from "@/app/actions/admin";
import { RES_STATUS_LABEL } from "@/lib/logic";
import { formatDateTime } from "@/lib/time";
import type { ReservationStatus } from "@/lib/types";

export default async function AdminReservations({ searchParams }: { searchParams: Promise<{ ok?: string; status?: string }> }) {
  const { ok, status } = await searchParams;
  const db = await readDb();
  const list = db.reservations.filter((r) => !status || r.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const statuses = Object.keys(RES_STATUS_LABEL) as ReservationStatus[];
  return (
    <>
      <h1>予約・鑑定</h1>
      <Flash ok={ok} />
      <div className="flex mb-2">
        <Link href="/admin/reservations" className={`btn btn-sm ${status ? "btn-ghost" : ""}`}>すべて</Link>
        {statuses.map((s) => <Link key={s} href={`/admin/reservations?status=${s}`} className={`btn btn-sm ${status === s ? "" : "btn-ghost"}`}>{RES_STATUS_LABEL[s]}（{db.reservations.filter((r) => r.status === s).length}）</Link>)}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>受付</th><th>希望日時</th><th>ユーザー</th><th>占い師</th><th>タイプ</th><th>状態</th><th>通話</th><th className="right">金額</th><th></th></tr></thead>
          <tbody>{list.map((r) => {
            const t = db.tellers.find((x) => x.id === r.tellerId)!; const u = db.users.find((x) => x.id === r.userId)!; const c = db.calls.find((x) => x.reservationId === r.id);
            return (
              <tr key={r.id}>
                <td className="small">{formatDateTime(r.createdAt)}</td>
                <td className="small">{r.instant ? "今すぐ" : formatDateTime(r.startAt)}</td>
                <td>{u.name}</td><td>{t.name}</td>
                <td>{r.type === "fixed" ? `${r.durationMin}分` : "従量制"}</td>
                <td><span className={`badge b-${r.status}`}>{RES_STATUS_LABEL[r.status]}</span></td>
                <td className="small">{c?.billedMinutes != null ? `${c.billedMinutes}分` : "-"}</td>
                <td className="right">{c?.amount != null ? `${c.amount.toLocaleString()}円` : "-"}</td>
                <td>{["requested", "approved", "in_progress"].includes(r.status) && (
                  <form action={adminCancelReservationAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-sm btn-danger">{r.status === "in_progress" ? "強制終了" : "キャンセル"}</button></form>
                )}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
