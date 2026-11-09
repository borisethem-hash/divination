import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";
import { PostCard } from "@/components/PostCards";

export const metadata = { title: "占いコラム" };

export default async function ColumnList({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const all = readDb().posts.filter((p) => p.published && p.type === "column").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const cats = [...new Set(all.map((p) => p.category).filter(Boolean))] as string[];
  const posts = cat ? all.filter((p) => p.category === cat) : all;
  return (
    <>
      <PageHead title="占いコラム" en="Column" lead="占術の基礎知識から、月のリズム、毎日に役立つ開運のヒントまで。占い師と運営スタッフがお届けします。" image="/images/photos/candle-autumn.webp" />
      <div className="container section" style={{ paddingTop: 32 }}>
        <div className="chips mb-3">
          <Link href="/column" className={`chip${!cat ? " on" : ""}`}>すべて（{all.length}）</Link>
          {cats.map((c) => <Link key={c} href={`/column?cat=${encodeURIComponent(c)}`} className={`chip${cat === c ? " on" : ""}`}>{c}</Link>)}
        </div>
        {posts.length ? <div className="grid g3">{posts.map((p, i) => <PostCard key={p.id} post={p} seed={i} />)}</div> : <div className="empty">コラムはまだありません</div>}
      </div>
    </>
  );
}
