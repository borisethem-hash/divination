import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { TellerImage } from "@/components/Art";
import { RES_STATUS_LABEL, joinState, pendingReviewTellers } from "@/lib/logic";
import { formatDateTime } from "@/lib/time";
import { cancelReservationAction, readNotificationsAction } from "@/app/actions/user";
import AutoRefresh from "@/components/AutoRefresh";

export const metadata = { title: "マイページ" };

export default async function MyPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const user = await requireRole("user", "/mypage");
  const db = readDb();
  const active = db.reservations.filter((r) => r.userId === user.id && ["requested", "approved", "in_progress"].includes(r.status)).sort((a, b) => a.startAt.localeCompare(b.startAt));
  const notes = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const reviewAsk = pendingReviewTellers(db, user.id);
  const recentDone = db.reservations.filter((r) => r.userId === user.id && ["rejected", "cancelled"].includes(r.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);

  return (
    <>
      <AutoRefresh seconds={15} />
      <h1>マイページ</h1>
      <Flash ok={ok} err={err} />
      <div className="grid g3 mb-3">
        <div className="stat"><div className="k">ポイント残高</div><div className="v">{user.points.toLocaleString()}<small> pt</small></div><Link href="/mypage/points" className="small">ポイントを購入 →</Link></div>
        <div className="stat"><div className="k">予約・リクエスト</div><div className="v">{active.length}<small> 件</small></div></div>
        <div className="stat"><div className="k">鑑定回数</div><div className="v">{db.reservations.filter((r) => r.userId === user.id && r.status === "completed").length}<small> 回</small></div></div>
      </div>

      {reviewAsk.length > 0 && (
        <div className="card mb-3" style={{ borderColor: "var(--gold)", background: "#fffdf6" }}>
          <h3 className="mb-0">口コミ投稿のお願い</h3>
          <p className="small muted">{db.settings.reviewThreshold}回以上ご利用いただいた占い師がいます。ご感想をお聞かせください。</p>
          <div className="flex">
            {reviewAsk.map((t) => (
              <Link key={t.id} href={`/mypage/review/${t.id}`} className="btn btn-gold btn-sm">{t.name} 先生の口コミを書く</Link>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18 }}>予約・リクエスト状況</h2>
      {active.length ? (
        <div className="grid" style={{ gap: 12 }}>
          {active.map((r) => {
            const t = db.tellers.find((x) => x.id === r.tellerId)!;
            const js = joinState(db, r);
            return (
              <div key={r.id} className="card" style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "center", padding: 16 }}>
                <div style={{ width: 64, height: 76, overflow: "hidden", border: "1px solid var(--line)" }}><TellerImage teller={t} /></div>
                <div>
                  <span className={`badge b-${r.status}`}>{RES_STATUS_LABEL[r.status]}</span>
                  <div className="mt-1"><b>{t.name}</b> 先生 ／ {r.instant ? "今すぐ鑑定" : formatDateTime(r.startAt)} ／ {r.type === "fixed" ? `時間指定 ${r.durationMin}分（${((r.durationMin ?? 0) * t.pricePerMin).toLocaleString()}円）` : `従量制（1分${t.pricePerMin}円）`}</div>
                  {r.status === "requested" && <div className="small muted">占い師の承認をお待ちください。承認されると通知が届きます。</div>}
                  {r.status === "approved" && !js.ok && <div className="small muted">{js.reason}</div>}
                  {r.tellerNote && <div className="small">占い師より：{r.tellerNote}</div>}
                </div>
                <div className="flex" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                  {js.ok && <Link href={`/call/${r.id}`} className="btn btn-shu">{r.status === "in_progress" ? "通話に戻る" : "入室する"}</Link>}
                  {["requested", "approved"].includes(r.status) && (
                    <form action={cancelReservationAction}><input type="hidden" name="id" value={r.id} /><button className="btn btn-sm btn-ghost btn-block">キャンセル</button></form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="empty">現在、予約・リクエストはありません。<br /><Link href="/tellers" className="btn btn-sm mt-2">占い師を探す</Link></div>}

      {recentDone.length > 0 && (
        <div className="mt-2 small muted">
          {recentDone.map((r) => { const t = db.tellers.find((x) => x.id === r.tellerId)!; return <div key={r.id}>・{t.name} 先生へのリクエスト（{r.instant ? "今すぐ" : formatDateTime(r.startAt)}）：{RES_STATUS_LABEL[r.status]}{r.tellerNote ? `「${r.tellerNote}」` : ""}</div>; })}
        </div>
      )}

      <div className="flex between mt-4"><h2 style={{ fontSize: 18, margin: 0 }}>お知らせ</h2>
        <form action={readNotificationsAction}><button className="btn btn-sm btn-ghost">すべて既読にする</button></form>
      </div>
      <div className="mt-1">
        {notes.length ? notes.map((n) => (
          <div key={n.id} className="notice-row">
            <time>{formatDateTime(n.createdAt)}</time>
            <div>
              {!n.read && <span className="badge" style={{ color: "var(--shu)", marginRight: 6 }}>NEW</span>}
              <b>{n.title}</b>
              <p className="small mb-0" style={{ whiteSpace: "pre-wrap" }}>{n.body}</p>
              {n.link && <Link href={n.link} className="small">詳しく見る →</Link>}
            </div>
          </div>
        )) : <div className="empty">お知らせはありません</div>}
      </div>
    </>
  );
}
