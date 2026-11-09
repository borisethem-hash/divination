import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import Markdown from "@/components/Markdown";
import { Banner } from "@/components/Art";
import { formatJpDate, formatDate } from "@/lib/time";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = readDb().posts.find((x) => x.slug === slug);
  return { title: p?.title ?? "お知らせ", description: p?.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = readDb();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  return (
    <article className="container narrow section" style={{ paddingTop: 32 }}>
      <div className="small muted"><Link href="/news">お知らせ・イベント</Link> ／ {p.title}</div>
      <div className="small muted mt-2">{formatJpDate(p.createdAt)} <span className="tag">{p.type === "event" ? "イベント" : "お知らせ"}</span>{p.eventDate && <span className="tag tag-gold">開催日 {formatDate(p.eventDate)}</span>}</div>
      <h1 style={{ fontSize: 28 }}>{p.title}</h1>
      <div style={{ border: "1px solid var(--line)", aspectRatio: "2/1", overflow: "hidden", margin: "20px 0 28px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverImage ? <img src={p.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Banner seed={p.type === "event" ? 2 : 0} />}
      </div>
      <Markdown source={p.body} />
      <div className="center mt-4"><Link href="/news" className="btn btn-outline">一覧へ戻る</Link></div>
    </article>
  );
}
