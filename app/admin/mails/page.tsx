import { readDb } from "@/lib/db";
import { formatDateTime } from "@/lib/time";

export default async function AdminMails() {
  const mails = [...(await readDb()).mails].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
  return (
    <>
      <h1>送信メール履歴</h1>
      <p className="small muted">予約確定・口コミ依頼・お問い合わせ受付などの自動送信メールです。デモ環境では実際には送信せずここに記録します（本番ではSendGrid / Amazon SES等と連携）。</p>
      {mails.length ? mails.map((m) => (
        <details key={m.id} className="faq">
          <summary style={{ fontWeight: 400 }}><span className="small muted">{formatDateTime(m.createdAt)}</span>　<b>{m.subject}</b>　<span className="small">→ {m.to}</span></summary>
          <div className="small" style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
        </details>
      )) : <div className="empty">送信履歴はまだありません</div>}
    </>
  );
}
