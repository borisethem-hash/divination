import { NextResponse } from "next/server";
import { updateDb, uid, nowIso } from "@/lib/db";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, string>;
  const name = String(b.name ?? "").trim().slice(0, 60);
  const email = String(b.email ?? "").trim().slice(0, 120);
  const body = String(b.body ?? "").trim().slice(0, 3000);
  const category = String(b.category ?? "その他").slice(0, 40);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.length < 2) {
    return NextResponse.json({ error: "お名前・メールアドレス・内容を正しく入力してください" }, { status: 400 });
  }
  updateDb((db) => {
    db.inquiries.push({ id: uid("q_"), name, email, category, body, source: b.source === "chatbot" ? "chatbot" : "form", status: "new", createdAt: nowIso() });
    db.mails.push({ id: uid("m_"), to: email, subject: `【${db.settings.siteName}】お問い合わせを受け付けました`, body: `${name} 様\n\nお問い合わせありがとうございます。以下の内容で受け付けました。担当者より通常1営業日以内にご連絡いたします。\n\n種別：${category}\n内容：\n${body}`, createdAt: nowIso() });
  });
  return NextResponse.json({ ok: true });
}
