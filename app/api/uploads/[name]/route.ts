import { getUpload } from "@/lib/storage";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[a-f0-9]{20}\.(jpg|png|webp|gif)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  const data = await getUpload(name);
  if (!data) return new Response("Not found", { status: 404 });
  // ファイル名はランダムで内容が変わらないため、CDN・ブラウザに長期キャッシュさせる
  return new Response(new Uint8Array(data), { headers: { "Content-Type": MIME[m[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
