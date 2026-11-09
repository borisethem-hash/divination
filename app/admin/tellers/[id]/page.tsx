import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { Portrait, TellerImage, PORTRAITS } from "@/components/Art";
import { saveTellerAction, deleteTellerAction } from "@/app/actions/admin";
import type { Teller } from "@/lib/types";

export default async function EditTeller({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const db = readDb();
  const isNew = id === "new";
  const t: Partial<Teller> = isNew ? { published: true, pricePerMin: 150, portrait: db.tellers.length % PORTRAITS.length, sortOrder: db.tellers.length, methods: [], specialties: [], styles: [] } : db.tellers.find((x) => x.id === id) ?? notFound();
  const u = !isNew ? db.users.find((x) => x.id === t.userId) : undefined;
  return (
    <>
      <div className="small"><Link href="/admin/tellers">← 占い師一覧</Link></div>
      <h1>{isNew ? "占い師を追加" : `${t.name} を編集`}</h1>
      <Flash err={err} />
      <form action={saveTellerAction} className="card form" style={{ maxWidth: 820 }}>
        <input type="hidden" name="id" value={isNew ? "" : t.id} />
        <div className="grid g2" style={{ gap: 16 }}>
          <div className="field"><label>名前<span className="req">必須</span></label><input className="input" name="name" defaultValue={t.name} required /></div>
          <div className="field"><label>ふりがな</label><input className="input" name="kana" defaultValue={t.kana} /></div>
          <div className="field"><label>ログイン用メールアドレス{isNew && <span className="req">必須</span>}</label><input className="input" type="email" name="email" defaultValue={u?.email} required={isNew} /></div>
          <div className="field"><label>{isNew ? "初期パスワード（8文字以上）" : "パスワード再設定（変更時のみ）"}</label><input className="input" type="text" name="password" required={isNew} minLength={8} autoComplete="off" /></div>
          <div className="field"><label>鑑定料（円/分）<span className="req">必須</span></label><input className="input" type="number" name="pricePerMin" min={50} max={2000} defaultValue={t.pricePerMin} required /></div>
          <div className="field"><label>アフィリエイトコード（半角英数）<span className="req">必須</span></label><input className="input" name="affiliateCode" defaultValue={t.affiliateCode} pattern="[a-z0-9_\-]{3,20}" required /></div>
        </div>
        <div className="field"><label>キャッチコピー</label><input className="input" name="catchcopy" defaultValue={t.catchcopy} /></div>
        <div className="grid g3" style={{ gap: 16 }}>
          <div className="field"><label>占術（カンマ区切り）</label><input className="input" name="methods" defaultValue={t.methods?.join(", ")} /></div>
          <div className="field"><label>得意な相談</label><input className="input" name="specialties" defaultValue={t.specialties?.join(", ")} /></div>
          <div className="field"><label>鑑定スタイル</label><input className="input" name="styles" defaultValue={t.styles?.join(", ")} /></div>
        </div>
        <div className="field"><label>プロフィール</label><textarea className="input" name="bio" defaultValue={t.bio} style={{ minHeight: 160 }} /></div>
        <div className="field"><label>メッセージ</label><textarea className="input" name="message" defaultValue={t.message} /></div>

        <div className="field">
          <label>プロフィール画像</label>
          <div className="flex" style={{ alignItems: "flex-start" }}>
            {!isNew && <div style={{ width: 90, height: 108, border: "1px solid var(--line)", overflow: "hidden" }}><TellerImage teller={t as Teller} /></div>}
            <div className="grow">
              <input className="input" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
              {t.imageUrl && <label className="check mt-1"><input type="checkbox" name="removeImage" />画像を削除してイラストに戻す</label>}
              <p className="small muted mb-0 mt-1">画像未設定時は下のイラストが表示されます。</p>
            </div>
          </div>
        </div>
        <div>
          <span className="label">イラスト（画像未設定時）</span>
          <div className="radio-cards" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))" }}>
            {PORTRAITS.map((p, i) => (
              <label key={i} style={{ padding: 4 }} title={p.label}><input type="radio" name="portrait" value={i} defaultChecked={t.portrait === i} /><span><div style={{ height: 84 }}><Portrait variant={i} /></div><small className="muted" style={{ fontSize: 10 }}>{p.label}</small></span></label>
            ))}
          </div>
        </div>
        <div className="grid g2" style={{ gap: 16 }}>
          <div className="field"><label>表示順（小さいほど上）</label><input className="input" type="number" name="sortOrder" defaultValue={t.sortOrder} /></div>
          <div className="field"><label>公開設定</label><label className="check"><input type="checkbox" name="published" defaultChecked={t.published} />サイトに公開する</label></div>
        </div>
        <div className="flex"><button className="btn btn-lg">{isNew ? "追加する" : "保存する"}</button>{!isNew && <Link href={`/tellers/${t.id}`} className="btn btn-ghost" target="_blank">公開ページ</Link>}</div>
      </form>
      {!isNew && t.published && (
        <form action={deleteTellerAction} className="mt-3">
          <input type="hidden" name="id" value={t.id} />
          <button className="btn btn-danger btn-sm">非公開にする（退会処理）</button>
        </form>
      )}
    </>
  );
}
