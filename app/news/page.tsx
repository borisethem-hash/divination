import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";
import { Banner } from "@/components/Art";
import { formatJpDate, formatDate } from "@/lib/time";

export const metadata = { title: "お知らせ・イベント" };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const posts = readDb().posts.filter((p) => p.published && (!type || p.type === type)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHead title="お知らせ・イベント" en="News & Events" />
      <div className="container section narrow" style={{ paddingTop: 32 }}>
        <div className="flex mb-3">
          <Link href="/news" className={`btn btn-sm ${!type ? "" : "btn-ghost"}`}>すべて</Link>
          <Link href="/news?type=news" className={`btn btn-sm ${type === "news" ? "" : "btn-ghost"}`}>お知らせ</Link>
          <Link href="/news?type=event" className={`btn btn-sm ${type === "event" ? "" : "btn-ghost"}`}>イベント</Link>
        </div>
        {posts.length ? posts.map((p, i) => (
          <Link key={p.id} href={`/news/${p.slug}`} className="flex" style={{ borderBottom: "1px solid var(--line)", padding: "18px 0", alignItems: "flex-start", color: "inherit", textDecoration: "none", flexWrap: "nowrap", gap: 20 }}>
            <div style={{ width: 160, flex: "none", aspectRatio: "5/3", overflow: "hidden", border: "1px solid var(--line)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {p.coverImage ? <img src={p.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Banner seed={i + (p.type === "event" ? 2 : 0)} />}
            </div>
            <div>
              <div className="small muted">{formatJpDate(p.createdAt)} <span className="tag">{p.type === "event" ? "イベント" : "お知らせ"}</span>{p.eventDate && <span className="tag tag-gold">開催 {formatDate(p.eventDate)}</span>}</div>
              <h3 style={{ fontSize: 17, margin: "4px 0" }}>{p.title}</h3>
              <p className="small muted mb-0">{p.excerpt}</p>
            </div>
          </Link>
        )) : <div className="empty">記事はまだありません</div>}
      </div>
    </>
  );
}
