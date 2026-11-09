import Link from "next/link";
import { readDb } from "@/lib/db";
import PageHead from "@/components/PageHead";
import { PostCard } from "@/components/PostCards";

export const metadata = { title: "お知らせ・イベント" };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const posts = readDb().posts
    .filter((p) => p.published && p.type !== "column" && (!type || p.type === type))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHead title="お知らせ・イベント" en="News & Events" lead="新しい占い師のデビュー情報や、季節のイベント、サービスからのお知らせです。" image="/images/photos/pagoda-night.webp" />
      <div className="container section" style={{ paddingTop: 32 }}>
        <div className="chips mb-3">
          <Link href="/news" className={`chip${!type ? " on" : ""}`}>すべて</Link>
          <Link href="/news?type=news" className={`chip${type === "news" ? " on" : ""}`}>お知らせ</Link>
          <Link href="/news?type=event" className={`chip${type === "event" ? " on" : ""}`}>イベント</Link>
          <Link href="/column" className="chip">占いコラム →</Link>
        </div>
        {posts.length ? <div className="grid g3">{posts.map((p, i) => <PostCard key={p.id} post={p} seed={i} />)}</div> : <div className="empty">記事はまだありません</div>}
      </div>
    </>
  );
}
