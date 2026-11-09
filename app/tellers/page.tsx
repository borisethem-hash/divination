import Link from "next/link";
import { readDb } from "@/lib/db";
import { publishedTellers, TOPICS, METHODS } from "@/lib/view";
import TellerCard from "@/components/TellerCard";
import PageHead from "@/components/PageHead";

export const metadata = { title: "占い師一覧" };

type SP = Record<string, string | undefined>;

export default async function TellersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const db = readDb();
  const all = publishedTellers(db);
  let list = all;
  const methods = [...new Set(all.flatMap((t) => t.teller.methods))];
  const specialties = [...new Set(all.flatMap((t) => t.teller.specialties))];
  if (sp.status === "waiting") list = list.filter((t) => t.teller.status === "waiting");
  if (sp.method) list = list.filter((t) => t.teller.methods.includes(sp.method!));
  if (sp.specialty) list = list.filter((t) => t.teller.specialties.includes(sp.specialty!));
  if (sp.q) { const q = sp.q; list = list.filter((t) => [t.teller.name, t.teller.kana, t.teller.catchcopy, t.teller.bio, ...t.teller.methods, ...t.teller.specialties].some((s) => s.includes(q))); }
  if (sp.sort === "price") list = [...list].sort((a, b) => a.teller.pricePerMin - b.teller.pricePerMin);
  if (sp.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  if (sp.sort === "popular") list = [...list].sort((a, b) => b.sessions - a.sessions);
  const waitingCount = all.filter((t) => t.teller.status === "waiting").length;

  const href = (patch: SP) => {
    const next = { ...sp, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/tellers?${qs}` : "/tellers";
  };
  const conditions = [sp.status === "waiting" && "待機中", sp.specialty, sp.method, sp.q && `「${sp.q}」`].filter(Boolean);

  return (
    <>
      <PageHead title="占い師一覧" en="Fortune tellers" lead={`在籍${all.length}名・ただいま${waitingCount}名が待機中です。相談内容や占術から、あなたに合う占い師を探せます。`} image="/images/photos/pagoda-night.webp" />
      <div className="container section" style={{ paddingTop: 32 }}>
        <div className="filter-box mb-3">
          <div className="filter-row">
            <span className="chip-label">相談内容</span>
            <div className="chips">{TOPICS.map((t) => <Link key={t.name} href={href({ specialty: sp.specialty === t.name ? undefined : t.name })} className={`chip${sp.specialty === t.name ? " on" : ""}`}>{t.name}</Link>)}</div>
          </div>
          <div className="filter-row">
            <span className="chip-label">占術</span>
            <div className="chips">{METHODS.map((m) => <Link key={m.name} href={href({ method: sp.method === m.name ? undefined : m.name })} className={`chip${sp.method === m.name ? " on" : ""}`}>{m.name}</Link>)}</div>
          </div>
          <details open={!!(sp.q || sp.sort || (sp.method && !METHODS.some((m) => m.name === sp.method)) || (sp.specialty && !TOPICS.some((t) => t.name === sp.specialty)))}>
            <summary className="small" style={{ cursor: "pointer", fontWeight: 700, color: "var(--ink)" }}>キーワード・並び順で絞り込む</summary>
            <form method="get" className="mt-2">
              <div className="grid g4" style={{ gap: 12 }}>
                <div className="field"><label>キーワード</label><input className="input" name="q" defaultValue={sp.q} placeholder="名前・得意分野など" /></div>
                <div className="field"><label>占術</label><select className="input" name="method" defaultValue={sp.method ?? ""}><option value="">すべて</option>{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div className="field"><label>相談内容</label><select className="input" name="specialty" defaultValue={sp.specialty ?? ""}><option value="">すべて</option>{specialties.map((m) => <option key={m}>{m}</option>)}</select></div>
                <div className="field"><label>並び順</label><select className="input" name="sort" defaultValue={sp.sort ?? ""}><option value="">待機中を優先</option><option value="price">料金が安い順</option><option value="rating">評価が高い順</option><option value="popular">鑑定数が多い順</option></select></div>
              </div>
              <div className="flex mt-2">
                <label className="check"><input type="checkbox" name="status" value="waiting" defaultChecked={sp.status === "waiting"} />今すぐ鑑定できる占い師のみ</label>
                <button className="btn btn-sm" style={{ marginLeft: "auto" }}>この条件で探す</button>
              </div>
            </form>
          </details>
        </div>

        <div className="flex between mb-2">
          <p className="mb-0"><b style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--ink)" }}>{list.length}</b> 名の占い師{conditions.length ? <span className="small muted">（{conditions.join("・")}）</span> : null}</p>
          <div className="chips">
            <Link href={href({ status: sp.status === "waiting" ? undefined : "waiting" })} className={`chip${sp.status === "waiting" ? " on" : ""}`}><span className="pulse" style={{ marginRight: 0 }} />待機中のみ</Link>
            {[["", "おすすめ順"], ["popular", "人気順"], ["rating", "評価順"], ["price", "料金順"]].map(([v, l]) => <Link key={v} href={href({ sort: v || undefined })} className={`chip${(sp.sort ?? "") === v ? " on" : ""}`}>{l}</Link>)}
            {conditions.length > 0 && <Link href="/tellers" className="chip">条件をクリア</Link>}
          </div>
        </div>
        {list.length ? (
          <div className="grid g4">{list.map((t) => <TellerCard key={t.teller.id} teller={t.teller} rating={t.rating} reviewCount={t.reviewCount} today={t.today} />)}</div>
        ) : (
          <div className="empty">条件に合う占い師が見つかりませんでした。<div className="mt-2"><Link href="/tellers" className="btn btn-sm btn-outline">すべての占い師を見る</Link></div></div>
        )}
      </div>
    </>
  );
}
