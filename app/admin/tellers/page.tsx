import Link from "next/link";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { TellerImage } from "@/components/Art";
import { STATUS_LABEL, tellerStats } from "@/lib/logic";

export default async function AdminTellers({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const db = readDb();
  const tellers = [...db.tellers].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <div className="flex between"><h1 className="mb-0">占い師管理</h1><Link href="/admin/tellers/new" className="btn">＋ 占い師を追加</Link></div>
      <div className="mt-2"><Flash ok={ok} err={err} /></div>
      <div className="table-wrap mt-2">
        <table className="table">
          <thead><tr><th></th><th>名前</th><th>ログインID</th><th>料金</th><th>評価</th><th>鑑定数</th><th>ステータス</th><th>公開</th><th></th></tr></thead>
          <tbody>{tellers.map((t) => {
            const s = tellerStats(db, t.id); const u = db.users.find((x) => x.id === t.userId);
            return (
              <tr key={t.id}>
                <td><div style={{ width: 40, height: 48, overflow: "hidden", border: "1px solid var(--line)" }}><TellerImage teller={t} /></div></td>
                <td><b>{t.name}</b><br /><span className="small muted">{t.methods.join("・")}</span></td>
                <td className="small">{u?.email}</td>
                <td>{t.pricePerMin}円/分</td>
                <td>{s.rating ? s.rating.toFixed(1) : "-"}（{s.reviewCount}）</td>
                <td>{s.sessions}</td>
                <td><span className={`status st-${t.status}`}>{STATUS_LABEL[t.status]}</span></td>
                <td>{t.published ? "公開" : <span className="muted">非公開</span>}</td>
                <td><Link href={`/admin/tellers/${t.id}`} className="btn btn-sm btn-outline">編集</Link></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
