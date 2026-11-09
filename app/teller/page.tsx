import Link from "next/link";
import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import AutoRefresh from "@/components/AutoRefresh";
import { setStatusAction, approveReservationAction, rejectReservationAction } from "@/app/actions/teller";
import ActionButton from "@/components/ActionButton";
import { STATUS_LABEL, RES_STATUS_LABEL, joinState, completedCount } from "@/lib/logic";
import { formatDateTime } from "@/lib/time";
import { todaySlots } from "@/lib/view";

export const metadata = { title: "占い師ページ" };

export default async function TellerHome({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { teller: t0 } = await requireTeller();
  const db = await readDb();
  const teller = db.tellers.find((t) => t.id === t0.id)!;
  const mine = db.reservations.filter((r) => r.tellerId === teller.id);
  const requests = mine.filter((r) => r.status === "requested").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const upcoming = mine.filter((r) => ["approved", "in_progress"].includes(r.status)).sort((a, b) => a.startAt.localeCompare(b.startAt));
  const notes = db.notifications.filter((n) => n.userId === teller.userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <AutoRefresh seconds={10} />
      <h1>ステータス・リクエスト</h1>
      <Flash ok={ok} err={err} />

      <div className="card mb-3">
        <div className="flex between"><h3 className="mb-0">現在のステータス：<span className={`status st-${teller.status}`}>{STATUS_LABEL[teller.status]}</span></h3><span className="small muted">本日の待機予定：{todaySlots(db, teller.id)}</span></div>
        <div className="status-switch mt-2">
          {(["waiting", "away", "offline"] as const).map((s) => (
            <ActionButton key={s} action={setStatusAction} fields={{ status: s }} className={`s-${s} ${teller.status === s ? "on" : ""}`}>{STATUS_LABEL[s]}</ActionButton>
          ))}
          <button type="button" disabled className={`s-busy ${teller.status === "busy" ? "on" : ""}`} title="通話中は自動で切り替わります">{STATUS_LABEL.busy}</button>
        </div>
        <p className="small muted mt-1 mb-0">待機スケジュールの開始時刻に自動で「待機中」、終了時刻に「受付終了」へ切り替わります。待機中に席を外す時は「離席中」に変更してください（手動の変更が優先されます）。「待機中」の間はお客様が「今すぐ鑑定」をリクエストでき、通話中は自動で「鑑定中」になり、終了後は元のステータスに戻ります。</p>
      </div>

      <h2 style={{ fontSize: 18 }}>承認待ちのリクエスト（{requests.length}）</h2>
      {requests.length ? requests.map((r) => {
        const u = db.users.find((x) => x.id === r.userId)!;
        const repeat = completedCount(db, u.id, teller.id);
        return (
          <div key={r.id} className="card mb-2">
            <div className="flex between">
              <div>
                <b>{u.name}</b> 様 {repeat > 0 ? <span className="tag tag-gold">リピート{repeat}回</span> : <span className="tag">初回</span>}
                <div className="mt-1">{r.instant ? <b className="shu">今すぐ鑑定</b> : formatDateTime(r.startAt)} ／ {r.type === "fixed" ? `時間指定 ${r.durationMin}分` : "従量制"}</div>
                <div className="small muted">受付：{formatDateTime(r.createdAt)}</div>
              </div>
            </div>
            {r.message && <div className="card-flat small mt-1" style={{ whiteSpace: "pre-wrap" }}>{r.message}</div>}
            <form action={approveReservationAction} className="flex mt-2">
              <input type="hidden" name="id" value={r.id} />
              <input className="input grow" name="note" placeholder="お客様へのひとこと（任意）" maxLength={300} style={{ minWidth: 200 }} />
              <button className="btn btn-shu" data-decision="approve">承認する</button>
              <button formAction={rejectReservationAction} className="btn btn-ghost" data-decision="reject">辞退する</button>
            </form>
          </div>
        );
      }) : <div className="empty mb-3">承認待ちのリクエストはありません</div>}

      <h2 style={{ fontSize: 18 }} className="mt-4">確定済みの予約</h2>
      {upcoming.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>状態</th><th>日時</th><th>お客様</th><th>タイプ</th><th></th></tr></thead>
            <tbody>
              {upcoming.map((r) => {
                const u = db.users.find((x) => x.id === r.userId)!;
                const js = joinState(db, r);
                return (
                  <tr key={r.id}>
                    <td><span className={`badge b-${r.status}`}>{RES_STATUS_LABEL[r.status]}</span></td>
                    <td>{r.instant ? "今すぐ" : formatDateTime(r.startAt)}</td>
                    <td>{u.name} 様</td>
                    <td>{r.type === "fixed" ? `${r.durationMin}分` : "従量制"}</td>
                    <td className="right">{js.ok ? <Link href={`/call/${r.id}`} className="btn btn-sm btn-shu">入室する</Link> : <span className="small muted">{js.reason}</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">確定済みの予約はありません</div>}

      <h2 style={{ fontSize: 18 }} className="mt-4">お知らせ</h2>
      {notes.length ? notes.map((n) => (
        <div key={n.id} className="notice-row"><time>{formatDateTime(n.createdAt)}</time><div><b>{n.title}</b><p className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>{n.body}</p></div></div>
      )) : <div className="empty">お知らせはありません</div>}
    </>
  );
}
