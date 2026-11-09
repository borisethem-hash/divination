import Link from "next/link";
import type { DB, Post } from "@/lib/types";
import Markdown from "./Markdown";
import { Cover, POST_TYPE_LABEL, postHref } from "./PostCards";
import { TellerImage } from "./Art";
import { publishedTellers } from "@/lib/view";
import { formatJpDate, formatDate } from "@/lib/time";

/** お知らせ・コラムの記事ページ（本文＋サイドバー） */
export default function PostArticle({ post, db }: { post: Post; db: DB }) {
  const isColumn = post.type === "column";
  const listHref = isColumn ? "/column" : "/news";
  const related = db.posts
    .filter((p) => p.published && p.id !== post.id && (isColumn ? p.type === "column" : p.type !== "column"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const waiting = publishedTellers(db).filter((t) => t.teller.status === "waiting").slice(0, 3);
  return (
    <div className="container section" style={{ paddingTop: 28 }}>
      <div className="small muted mb-2"><Link href="/">ホーム</Link> ／ <Link href={listHref}>{isColumn ? "占いコラム" : "お知らせ・イベント"}</Link> ／ {post.title}</div>
      <div className="article-layout">
        <article>
          <header className="article-head">
            <div className="meta">
              <span className={`ptype pt-${post.type}`}>{isColumn ? post.category || "コラム" : POST_TYPE_LABEL[post.type]}</span>
              <time>{formatJpDate(post.createdAt)}</time>
              {post.eventDate && <span className="tag tag-gold">開催日 {formatDate(post.eventDate)}</span>}
            </div>
            <h1>{post.title}</h1>
          </header>
          <div className="article-cover"><Cover post={post} /></div>
          <Markdown source={post.body} />
          <div className="center mt-4"><Link href={listHref} className="btn btn-outline">{isColumn ? "コラム一覧へ" : "お知らせ一覧へ"}</Link></div>
        </article>
        <aside className="article-side">
          {related.length > 0 && (
            <div className="side-box">
              <h3>{isColumn ? "ほかのコラム" : "最新のお知らせ"}</h3>
              {related.map((p) => (
                <Link key={p.id} href={postHref(p)} className="side-post">
                  <span className="th"><Cover post={p} /></span>
                  <span><b>{p.title}</b><br /><small className="muted">{formatJpDate(p.createdAt)}</small></span>
                </Link>
              ))}
            </div>
          )}
          <div className="side-box">
            <h3>今すぐ占える占い師</h3>
            {waiting.length ? waiting.map((t) => (
              <Link key={t.teller.id} href={`/tellers/${t.teller.id}`} className="side-post" style={{ gridTemplateColumns: "48px 1fr" }}>
                <span className="th" style={{ aspectRatio: "5/6" }}><TellerImage teller={t.teller} /></span>
                <span><b>{t.teller.name}</b><br /><small className="muted">{t.teller.methods.join("・")} ／ 1分{t.teller.pricePerMin}円</small></span>
              </Link>
            )) : <p className="small muted mb-0">現在待機中の占い師はいません。</p>}
            <div className="mt-1 small"><Link href="/tellers?status=waiting">待機中の占い師をすべて見る →</Link></div>
          </div>
          <div className="side-box" style={{ background: "var(--night)", color: "#fff", borderColor: "var(--night)", textAlign: "center" }}>
            <p className="small mb-2" style={{ opacity: 0.9 }}>今なら新規登録で<br /><b style={{ fontSize: 20, color: "#f3dfa6", fontFamily: "var(--serif)" }}>{db.settings.signupPoints.toLocaleString()}pt</b> プレゼント</p>
            <Link href="/register" className="btn btn-shu btn-block">無料会員登録</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
