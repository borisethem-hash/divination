import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  const fd = await req.formData();
  try {
    const url = await saveImage(fd.get("file"));
    if (!url) return NextResponse.json({ error: "ファイルを選択してください" }, { status: 400 });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
