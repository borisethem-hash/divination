import { NextResponse } from "next/server";
import { readDb, updateDb, uid, nowIso } from "@/lib/db";

/** アフィリエイトリンク：/r/{占い師コード}?to=register
 *  クリックを計測し、30日間有効の紹介Cookieを付与して遷移します。 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(req.url);
  const teller = (await readDb()).tellers.find((t) => t.affiliateCode === code.toLowerCase() && t.published);
  if (!teller) return NextResponse.redirect(new URL("/", url));
  await updateDb((db) => { db.affiliateClicks.push({ id: uid("c_"), tellerId: teller.id, at: nowIso() }); });
  const dest = url.searchParams.get("to") === "register" ? "/register" : `/tellers/${teller.id}`;
  const res = NextResponse.redirect(new URL(dest, url));
  res.cookies.set("tsuki_ref", teller.affiliateCode, { maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax", httpOnly: true });
  return res;
}
