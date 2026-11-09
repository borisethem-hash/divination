import { notFound, redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import PostArticle from "@/components/PostArticle";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (await readDb()).posts.find((x) => x.slug === slug);
  return { title: p?.title ?? "占いコラム", description: p?.excerpt };
}

export default async function ColumnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  if (p.type !== "column") redirect(`/news/${p.slug}`);
  return <PostArticle post={p} db={db} />;
}
