import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { setReviewStatusAction, sendReviewRequestAction } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/time";
import ActionButton from "@/components/ActionButton";

const LABEL = { pending: "確認待ち", published: "掲載中", hidden: "非掲載" } as const;

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const db = await readDb();
  const order = { pending: 0, published: 1, hidden: 2 };
  const reviews = [...db.reviews].sort((a, b) => order[a.status] - order[b.status] || b.createdAt.localeCompare(a.createdAt));

  // 口コミ依頼の対象（閾値以上リピート・未投稿）
  const pairs = new Map<string, number>();
  db.reservations.filter((r) => r.status === "completed").forEach((r) => pairs.set(`${r.userId}|${r.tellerId}`, (pairs.get(`${r.userId}|${r.tellerId}`) ?? 0) + 1));
  const targets = [...pairs.entries()].filter(([k, n]) => {
    const [u, t] = k.split("|");
    return n >= db.settings.reviewThreshold && !db.reviews.some((v) => v.userId === u && v.tellerId === t);
  }).map(([k, n]) => {
    const [u, t] = k.split("|");
    const asked = db.notifications.some((x) => x.userId === u && x.link === `/mypage/review/${t}`);
    return { user: db.users.find((x) => x.id === u)!, teller: db.tellers.find((x) => x.id === t)!, n, asked };
  });

  return (
    <>
      <h1>口コミ管理</h1>
      <Flash ok={ok} />
      <div className="card-flat small mb-3">
        自動口コミ依頼：同じ占い師を<b>{db.settings.reviewThreshold}回以上</b>利用し、まだ口コミを投稿していないユーザーに、鑑定終了時に自動で依頼通知・メールを送信します。
        投稿された口コミは{db.settings.reviewAutoPublish ? "自動で掲載されます" : "ここで承認すると掲載されます"}（<a href="/admin/settings">設定を変更</a>）。
      </div>

      <h2 style={{ fontSize: 18 }}>口コミ依頼の対象ユーザー</h2>
      {targets.length ? (
        <div className="table-wrap mb-3">
          <table className="table">
            <thead><tr><th>ユーザー</th><th>占い師</th><th>利用回数</th><th>依頼状況</th><th></th></tr></thead>
            <tbody>{targets.map((x) => (
              <tr key={x.user.id + x.teller.id}>
                <td>{x.user.name}</td><td>{x.teller.name}</td><td>{x.n}回</td>
                <td>{x.asked ? <span className="badge b-approved">依頼済み</span> : <span className="badge b-requested">未依頼</span>}</td>
                <td className="right"><form action={sendReviewRequestAction}><input type="hidden" name="userId" value={x.user.id} /><input type="hidden" name="tellerId" value={x.teller.id} /><button className="btn btn-sm btn-outline">{x.asked ? "再送する" : "依頼を送る"}</button></form></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <div className="empty mb-3">対象ユーザーはいません</div>}

      <h2 style={{ fontSize: 18 }}>投稿された口コミ</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>投稿日</th><th>占い師</th><th>投稿者</th><th>評価</th><th>本文</th><th>状態</th><th>操作</th></tr></thead>
          <tbody>{reviews.map((r) => (
            <tr key={r.id}>
              <td className="small">{formatDateTime(r.createdAt)}</td>
              <td>{db.tellers.find((t) => t.id === r.tellerId)?.name}</td>
              <td className="small">{db.users.find((u) => u.id === r.userId)?.name}</td>
              <td className="stars">{"★".repeat(r.rating)}</td>
              <td className="small" style={{ maxWidth: 320 }}>{r.body}</td>
              <td><span className={`badge ${r.status === "pending" ? "b-requested" : r.status === "published" ? "b-approved" : "b-cancelled"}`}>{LABEL[r.status]}</span></td>
              <td>
                <div className="flex" style={{ gap: 4, flexWrap: "nowrap" }}>
                  {r.status !== "published" && <ActionButton action={setReviewStatusAction} fields={{ id: r.id, status: "published" }} className="btn btn-sm">掲載</ActionButton>}
                  {r.status !== "hidden" && <ActionButton action={setReviewStatusAction} fields={{ id: r.id, status: "hidden" }} className="btn btn-sm btn-ghost">非掲載</ActionButton>}
                  <ActionButton action={setReviewStatusAction} fields={{ id: r.id, status: "delete" }} className="btn btn-sm btn-danger">削除</ActionButton>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
