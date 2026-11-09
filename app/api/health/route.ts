import { NextResponse } from "next/server";
import { readDb, storageMode } from "@/lib/db";

export const dynamic = "force-dynamic";

/** デプロイ後の動作確認用。保存先とデータの読み込み可否を返します（秘密情報は含みません）。 */
export async function GET() {
  const storage = storageMode();
  try {
    const db = await readDb();
    return NextResponse.json({
      ok: true,
      storage,
      persistent: storage !== "tmp",
      note: storage === "tmp" ? "一時保存モードです。Vercel で Upstash Redis を接続すると、データが永続化されます。" : undefined,
      counts: { tellers: db.tellers.length, users: db.users.length, reservations: db.reservations.length, posts: db.posts.length },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, storage, error: (e as Error).message }, { status: 500 });
  }
}
