import { notFound, redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import PostArticle from "@/components/PostArticle";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = (await readDb()).posts.find((x) => x.slug === slug);
  return { title: p?.title ?? "お知らせ", description: p?.excerpt };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const p = db.posts.find((x) => x.slug === slug && x.published);
  if (!p) notFound();
  if (p.type === "column") redirect(`/column/${p.slug}`);
  return <PostArticle post={p} db={db} />;
}
