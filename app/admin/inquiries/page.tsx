import { readDb } from "@/lib/db";
import { setInquiryStatusAction } from "@/app/actions/admin";
import { formatDateTime } from "@/lib/time";
import ActionButton from "@/components/ActionButton";

const LABEL = { new: "未対応", in_progress: "対応中", done: "完了" } as const;

export default async function AdminInquiries() {
  const order = { new: 0, in_progress: 1, done: 2 };
  const list = [...(await readDb()).inquiries].sort((a, b) => order[a.status] - order[b.status] || b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <h1>お問い合わせ</h1>
      {list.length ? list.map((q) => (
        <div key={q.id} className="card mb-2">
          <div className="flex between">
            <div>
              <span className={`badge ${q.status === "new" ? "b-requested" : q.status === "in_progress" ? "b-in_progress" : "b-completed"}`}>{LABEL[q.status]}</span>{" "}
              <span className="tag">{q.source === "chatbot" ? "チャットボット" : "フォーム"}</span><span className="tag">{q.category}</span>
              <div className="mt-1"><b>{q.name}</b> <a href={`mailto:${q.email}`} className="small">{q.email}</a> <span className="small muted">{formatDateTime(q.createdAt)}</span></div>
            </div>
            <div className="flex" style={{ gap: 4 }}>
              {(["new", "in_progress", "done"] as const).map((s) => <ActionButton key={s} action={setInquiryStatusAction} fields={{ id: q.id, status: s }} className={`btn btn-sm ${q.status === s ? "" : "btn-ghost"}`}>{LABEL[s]}</ActionButton>)}
            </div>
          </div>
          <div className="card-flat small mt-1" style={{ whiteSpace: "pre-wrap" }}>{q.body}</div>
        </div>
      )) : <div className="empty">お問い合わせはありません</div>}
    </>
  );
}
