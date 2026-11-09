import Link from "next/link";
import { readDb } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/logic";
import { jstDateStr, formatDateTime } from "@/lib/time";
import { adminSetTellerStatusAction } from "@/app/actions/admin";
import AutoRefresh from "@/components/AutoRefresh";
import ActionButton from "@/components/ActionButton";

export default async function AdminHome() {
  const db = await readDb();
  const today = jstDateStr();
  const month = today.slice(0, 7);
  const calls = db.calls.filter((c) => c.endedAt);
  const sales = (pred: (d: string) => boolean) => calls.filter((c) => pred(jstDateStr(new Date(c.endedAt!)))).reduce((s, c) => s + (c.amount ?? 0), 0);
  const charges = db.transactions.filter((t) => t.type === "charge" && jstDateStr(new Date(t.createdAt)).startsWith(month)).reduce((s, t) => s + t.amount, 0);
  const live = db.reservations.filter((r) => r.status === "in_progress");
  const recent = [...db.reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  // 直近14日の売上（簡易バー）
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 86400000); return jstDateStr(d); });
  const daily = days.map((d) => ({ d, v: sales((x) => x === d) }));
  const max = Math.max(1, ...daily.map((x) => x.v));

  return (
    <>
      <AutoRefresh seconds={20} />
      <h1>ダッシュボード</h1>
      <div className="grid g4 mb-3">
        <div className="stat"><div className="k">本日の鑑定売上</div><div className="v">{sales((d) => d === today).toLocaleString()}<small> 円</small></div></div>
        <div className="stat"><div className="k">今月の鑑定売上</div><div className="v">{sales((d) => d.startsWith(month)).toLocaleString()}<small> 円</small></div></div>
        <div className="stat"><div className="k">今月のポイント購入</div><div className="v">{charges.toLocaleString()}<small> 円</small></div></div>
        <div className="stat"><div className="k">会員数</div><div className="v">{db.users.filter((u) => u.role === "user").length}<small> 人</small></div></div>
        <div className="stat"><div className="k">鑑定中</div><div className="v shu">{live.length}<small> 件</small></div></div>
        <div className="stat"><div className="k">承認待ちリクエスト</div><div className="v">{db.reservations.filter((r) => r.status === "requested").length}<small> 件</small></div></div>
        <div className="stat"><div className="k">未対応お問い合わせ</div><div className="v"><Link href="/admin/inquiries">{db.inquiries.filter((q) => q.status === "new").length}</Link><small> 件</small></div></div>
        <div className="stat"><div className="k">確認待ち口コミ</div><div className="v"><Link href="/admin/reviews">{db.reviews.filter((r) => r.status === "pending").length}</Link><small> 件</small></div></div>
      </div>

      <div className="card mb-3">
        <h3>鑑定売上（直近14日）</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, borderBottom: "1px solid var(--line)" }}>
          {daily.map((x) => (
            <div key={x.d} title={`${x.d}：${x.v.toLocaleString()}円`} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ height: `${(x.v / max) * 100}%`, minHeight: x.v ? 2 : 0, background: "var(--ink)" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }} className="small muted">{daily.map((x) => <div key={x.d} style={{ flex: 1, textAlign: "center", fontSize: 10 }}>{Number(x.d.slice(8))}</div>)}</div>
      </div>

      <h2 style={{ fontSize: 18 }}>占い師の稼働状況</h2>
      <div className="table-wrap mb-3">
        <table className="table">
          <thead><tr><th>占い師</th><th>ステータス</th><th>切り替え</th></tr></thead>
          <tbody>{db.tellers.filter((t) => t.published).map((t) => (
            <tr key={t.id}>
              <td><Link href={`/admin/tellers/${t.id}`}>{t.name}</Link></td>
              <td><span className={`status st-${t.status}`}>{STATUS_LABEL[t.status]}</span></td>
              <td>
                <div className="flex" style={{ gap: 4 }}>
                  {(["waiting", "away", "offline"] as const).map((s) => <ActionButton key={s} action={adminSetTellerStatusAction} fields={{ id: t.id, status: s }} className="btn btn-sm btn-ghost" disabled={t.status === s || t.status === "busy"}>{STATUS_LABEL[s]}</ActionButton>)}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18 }}>最新のリクエスト</h2>
      <div className="table-wrap">
        <table className="table">
          <tbody>{recent.map((r) => {
            const t = db.tellers.find((x) => x.id === r.tellerId)!; const u = db.users.find((x) => x.id === r.userId)!;
            return <tr key={r.id}><td>{formatDateTime(r.createdAt)}</td><td>{u.name} → {t.name}</td><td>{r.type === "fixed" ? `${r.durationMin}分` : "従量制"}</td><td><span className={`badge b-${r.status}`}>{r.status}</span></td></tr>;
          })}</tbody>
        </table>
      </div>
    </>
  );
}
