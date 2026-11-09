"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { readDb, updateDb, uid, nowIso } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession, homeFor } from "@/lib/auth";
import { notify } from "@/lib/logic";

const enc = encodeURIComponent;

function safeNext(n: string | null | undefined): string | null {
  return n && n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : null;
}

export async function loginAction(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(String(fd.get("next") ?? ""));
  const user = readDb().users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect(`/login?err=${enc("メールアドレスまたはパスワードが正しくありません")}${next ? `&next=${enc(next)}` : ""}`);
  }
  await createSession(user.id);
  redirect(next && (user.role === "user" || next.startsWith(homeFor(user.role))) ? next : homeFor(user.role));
}

export async function registerAction(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const agree = fd.get("agree");
  const next = safeNext(String(fd.get("next") ?? ""));
  const back = (m: string) => redirect(`/register?err=${enc(m)}`);
  if (!name || name.length > 40) back("お名前（ニックネーム可）を入力してください");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("メールアドレスの形式が正しくありません");
  if (password.length < 8) back("パスワードは8文字以上で入力してください");
  if (!agree) back("利用規約への同意が必要です");

  const jar = await cookies();
  const refCode = jar.get("tsuki_ref")?.value;

  const userId = updateDb((db) => {
    if (db.users.some((u) => u.email === email)) return null;
    const refTeller = refCode ? db.tellers.find((t) => t.affiliateCode === refCode) : undefined;
    const id = uid("u_");
    db.users.push({ id, role: "user", email, name, passwordHash: hashPassword(password), points: db.settings.signupPoints, referredBy: refTeller?.id, createdAt: nowIso() });
    if (db.settings.signupPoints > 0) {
      db.transactions.push({ id: uid("x_"), userId: id, type: "bonus", amount: db.settings.signupPoints, note: "新規登録特典", createdAt: nowIso() });
    }
    if (refTeller && db.settings.affiliateSignupBonus > 0) {
      db.affiliateEarnings.push({ id: uid("e_"), tellerId: refTeller.id, userId: id, kind: "signup", amount: db.settings.affiliateSignupBonus, note: `紹介登録 ${name}`, createdAt: nowIso(), paid: false });
    }
    notify(db, id, "ご登録ありがとうございます", `${db.settings.siteName}へようこそ。新規登録特典として${db.settings.signupPoints.toLocaleString()}ptをプレゼントしました。`, "/tellers");
    return id;
  });
  if (!userId) back("このメールアドレスは既に登録されています");
  jar.delete("tsuki_ref");
  await createSession(userId!);
  redirect(next ?? `/mypage?ok=${enc("会員登録が完了しました。特典ポイントをプレゼントしました！")}`);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
