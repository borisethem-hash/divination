import Link from "next/link";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { formatDateTime } from "@/lib/time";

export default async function AdminPosts({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const posts = [...(await readDb()).posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <div className="flex between"><h1 className="mb-0">記事管理（お知らせ・イベント・コラム）</h1><Link href="/admin/posts/new" className="btn">＋ 新規作成</Link></div>
      <div className="mt-2"><Flash ok={ok} /></div>
      <div className="table-wrap mt-2">
        <table className="table">
          <thead><tr><th>作成日</th><th>種別</th><th>タイトル</th><th>状態</th><th></th></tr></thead>
          <tbody>{posts.map((p) => (
            <tr key={p.id}>
              <td className="small">{formatDateTime(p.createdAt)}</td>
              <td>{p.type === "event" ? "イベント" : p.type === "column" ? `コラム${p.category ? `（${p.category}）` : ""}` : "お知らせ"}</td>
              <td><b>{p.title}</b><br /><span className="small muted">/{p.type === "column" ? "column" : "news"}/{p.slug}</span></td>
              <td>{p.published ? "公開" : <span className="muted">下書き</span>}</td>
              <td className="right"><Link href={`/admin/posts/${p.id}`} className="btn btn-sm btn-outline">編集</Link></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
