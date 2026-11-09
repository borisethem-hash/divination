import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { savePostAction, deletePostAction } from "@/app/actions/admin";
import PostEditor from "@/components/PostEditor";
import type { Post } from "@/lib/types";
import ImageInput from "@/components/ImageInput";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  const db = await readDb();
  const p: Partial<Post> = isNew ? { type: "news", published: true, body: "" } : db.posts.find((x) => x.id === id) ?? notFound();
  const cats = [...new Set(db.posts.map((x) => x.category).filter(Boolean))] as string[];
  return (
    <>
      <div className="small"><Link href="/admin/posts">← 一覧へ</Link></div>
      <h1>{isNew ? "記事を作成" : "記事を編集"}</h1>
      <p className="small muted">お知らせ・イベントは「お知らせ」ページに、コラムは「占いコラム」ページに掲載されます。カバー画像は横長（16:10程度）がおすすめです。</p>
      <Flash err={err} />
      <form action={savePostAction} className="card form">
        <input type="hidden" name="id" value={isNew ? "" : p.id} />
        <div className="grid g4" style={{ gap: 16 }}>
          <div className="field"><label>種別</label><select className="input" name="type" defaultValue={p.type}><option value="news">お知らせ</option><option value="event">イベント</option><option value="column">コラム</option></select></div>
          <div className="field"><label>開催日（イベントのみ）</label><input className="input" type="date" name="eventDate" defaultValue={p.eventDate} /></div>
          <div className="field"><label>カテゴリ（コラムのみ）</label><input className="input" name="category" defaultValue={p.category} placeholder="タロット・開運 など" list="column-cats" /><datalist id="column-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></div>
          <div className="field"><label>URL（半角英数・空欄で自動）</label><input className="input" name="slug" defaultValue={p.slug} placeholder="winter-campaign" /></div>
        </div>
        <div className="field"><label>タイトル<span className="req">必須</span></label><input className="input" name="title" defaultValue={p.title} required /></div>
        <div className="field"><label>概要（一覧に表示）</label><input className="input" name="excerpt" defaultValue={p.excerpt} /></div>
        <div className="field">
          <label>カバー画像</label>
          <ImageInput name="cover" />
          {p.coverImage && <label className="check mt-1"><input type="checkbox" name="removeCover" />現在の画像を削除</label>}
        </div>
        <PostEditor defaultValue={p.body ?? ""} />
        <label className="check"><input type="checkbox" name="published" defaultChecked={p.published} />公開する（チェックを外すと下書き）</label>
        <div className="flex"><button className="btn btn-lg">保存する</button>{!isNew && p.published && <Link href={`/${p.type === "column" ? "column" : "news"}/${p.slug}`} target="_blank" className="btn btn-ghost">公開ページを見る</Link>}</div>
      </form>
      {!isNew && (
        <form action={deletePostAction} className="mt-3"><input type="hidden" name="id" value={p.id} /><button className="btn btn-sm btn-danger">この記事を削除</button></form>
      )}
    </>
  );
}
