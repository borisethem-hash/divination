import Link from "next/link";
import type { Post } from "@/lib/types";
import { Banner } from "./Art";
import { formatJpDate, formatDate } from "@/lib/time";

export const POST_TYPE_LABEL: Record<Post["type"], string> = { news: "お知らせ", event: "イベント", column: "コラム" };
export const postHref = (p: Pick<Post, "type" | "slug">) => (p.type === "column" ? `/column/${p.slug}` : `/news/${p.slug}`);

export function Cover({ post, seed = 0 }: { post: Post; seed?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return post.coverImage ? <img src={post.coverImage} alt="" loading="lazy" /> : <Banner seed={seed + (post.type === "event" ? 2 : 0)} />;
}

/** コラム・お知らせのカード（写真付き） */
export function PostCard({ post, seed = 0 }: { post: Post; seed?: number }) {
  return (
    <Link href={postHref(post)} className="pcard">
      <div className="ph"><Cover post={post} seed={seed} /></div>
      <div className="body">
        <div className="meta">
          <span className={`ptype pt-${post.type}`}>{post.type === "column" ? post.category || "コラム" : POST_TYPE_LABEL[post.type]}</span>
          <time>{formatJpDate(post.createdAt)}</time>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    </Link>
  );
}

/** お知らせの一覧行 */
export function NewsRow({ post }: { post: Post }) {
  return (
    <Link href={postHref(post)} className="news-row">
      <time>{formatJpDate(post.createdAt)}</time>
      <span className={`ptype pt-${post.type}`}>{POST_TYPE_LABEL[post.type]}</span>
      <span className="t">{post.title}{post.eventDate && <span className="ev">開催 {formatDate(post.eventDate)}</span>}</span>
    </Link>
  );
}
