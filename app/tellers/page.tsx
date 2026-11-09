import Link from "next/link";
import { readDb } from "@/lib/db";
import { publishedTellers } from "@/lib/view";
import TellerCard from "@/components/TellerCard";
import PageHead from "@/components/PageHead";

export const metadata = { title: "占い師一覧" };

export default async function TellersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const db = readDb();
  let list = publishedTellers(db);
  const methods = [...new Set(list.flatMap((t) => t.teller.methods))];
  const specialties = [...new Set(list.flatMap((t) => t.teller.specialties))];
  if (sp.status === "waiting") list = list.filter((t) => t.teller.status === "waiting");
  if (sp.method) list = list.filter((t) => t.teller.methods.includes(sp.method!));
  if (sp.specialty) list = list.filter((t) => t.teller.specialties.includes(sp.specialty!));
  if (sp.q) { const q = sp.q; list = list.filter((t) => [t.teller.name, t.teller.kana, t.teller.catchcopy, t.teller.bio].some((s) => s.includes(q))); }
  if (sp.sort === "price") list.sort((a, b) => a.teller.pricePerMin - b.teller.pricePerMin);
  if (sp.sort === "rating") list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  if (sp.sort === "popular") list.sort((a, b) => b.sessions - a.sessions);

  return (
    <>
      <PageHead title="占い師一覧" en="Fortune Tellers" />
      <div className="container section" style={{ paddingTop: 32 }}>
        <form className="card-flat mb-3" method="get">
          <div className="grid g4" style={{ gap: 12 }}>
            <div className="field"><label>キーワード</label><input className="input" name="q" defaultValue={sp.q} placeholder="名前・得意分野など" /></div>
            <div className="field"><label>占術</label><select className="input" name="method" defaultValue={sp.method ?? ""}><option value="">すべて</option>{methods.map((m) => <option key={m}>{m}</option>)}</select></div>
            <div className="field"><label>相談内容</label><select className="input" name="specialty" defaultValue={sp.specialty ?? ""}><option value="">すべて</option>{specialties.map((m) => <option key={m}>{m}</option>)}</select></div>
            <div className="field"><label>並び順</label><select className="input" name="sort" defaultValue={sp.sort ?? ""}><option value="">待機中を優先</option><option value="price">料金が安い順</option><option value="rating">評価が高い順</option><option value="popular">鑑定数が多い順</option></select></div>
          </div>
          <div className="flex mt-2">
            <label className="check"><input type="checkbox" name="status" value="waiting" defaultChecked={sp.status === "waiting"} />今すぐ鑑定できる占い師のみ</label>
            <button className="btn btn-sm" style={{ marginLeft: "auto" }}>この条件で探す</button>
            <Link href="/tellers" className="btn btn-sm btn-ghost">クリア</Link>
          </div>
        </form>
        <p className="small muted">{list.length}名の占い師が見つかりました</p>
        {list.length ? (
          <div className="grid g4">{list.map((t) => <TellerCard key={t.teller.id} teller={t.teller} rating={t.rating} reviewCount={t.reviewCount} today={t.today} />)}</div>
        ) : <div className="empty">条件に合う占い師が見つかりませんでした。</div>}
      </div>
    </>
  );
}
