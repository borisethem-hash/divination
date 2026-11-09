import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { saveBannerAction, deleteBannerAction } from "@/app/actions/admin";
import type { SiteBanner } from "@/lib/types";

function BannerForm({ b }: { b?: SiteBanner }) {
  return (
    <form action={saveBannerAction} className="form">
      <input type="hidden" name="id" value={b?.id ?? ""} />
      <div className="grid g3" style={{ gap: 12 }}>
        <div className="field"><label>小見出し（英字推奨）</label><input className="input" name="label" defaultValue={b?.label} placeholder="CAMPAIGN" /></div>
        <div className="field" style={{ gridColumn: "span 2" }}><label>タイトル<span className="req">必須</span></label><input className="input" name="title" defaultValue={b?.title} required maxLength={40} /></div>
      </div>
      <div className="field"><label>説明文</label><input className="input" name="subtitle" defaultValue={b?.subtitle} maxLength={60} /></div>
      <div className="grid g3" style={{ gap: 12 }}>
        <div className="field"><label>リンク先</label><input className="input" name="link" defaultValue={b?.link ?? "/"} placeholder="/news/winter-campaign" /></div>
        <div className="field"><label>画像{!b && <span className="req">必須</span>}</label><input className="input" type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" /></div>
        <div className="field"><label>表示順</label><input className="input" type="number" name="sortOrder" defaultValue={b?.sortOrder ?? 0} /></div>
      </div>
      <div className="flex">
        <label className="check"><input type="checkbox" name="published" defaultChecked={b ? b.published : true} />トップページに表示する</label>
        <button className="btn btn-sm" style={{ marginLeft: "auto" }}>{b ? "更新する" : "追加する"}</button>
      </div>
    </form>
  );
}

export default async function AdminBanners({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const banners = [...readDb().banners].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      <h1>トップバナー</h1>
      <p className="small muted">トップページのキャンペーン・特集枠に表示するバナーです（表示順の上位4件まで）。画像は横長（4:3程度、幅1200px前後）がおすすめです。</p>
      <Flash ok={ok} err={err} />
      {banners.map((b) => (
        <div key={b.id} className="card mb-2" style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
          <div>
            <div className="promo" style={{ aspectRatio: "4/3" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={b.image} alt="" />
              <span className="promo-body"><span className="promo-label">{b.label}</span><b style={{ fontSize: 14 }}>{b.title}</b></span>
            </div>
            <p className="small mt-1 mb-0">{b.published ? <span className="badge b-approved">表示中</span> : <span className="badge b-cancelled">非表示</span>}</p>
            <form action={deleteBannerAction} className="mt-1"><input type="hidden" name="id" value={b.id} /><button className="btn btn-sm btn-danger">削除</button></form>
          </div>
          <BannerForm b={b} />
        </div>
      ))}
      <h2 className="mt-4" style={{ fontSize: 18 }}>バナーを追加</h2>
      <div className="card"><BannerForm /></div>
    </>
  );
}
