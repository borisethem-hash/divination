"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateDb, uid, nowIso } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { saveImage } from "@/lib/upload";
import { notify, slugify, finishCall } from "@/lib/logic";
import type { Post, TellerStatus, Review, Inquiry, SiteBanner } from "@/lib/types";

const enc = encodeURIComponent;
const admin = () => requireRole("admin", "/admin");
const list = (v: FormDataEntryValue | null) => String(v ?? "").split(/[,、\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8);

// ===== 占い師 =====
export async function saveTellerAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id") ?? "");
  const back = (m: string) => redirect(`/admin/tellers/${id || "new"}?err=${enc(m)}`);
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const price = Number(fd.get("pricePerMin"));
  const code = String(fd.get("affiliateCode") ?? "").trim().toLowerCase();
  if (!name) back("名前を入力してください");
  if (!Number.isFinite(price) || price < 50 || price > 2000) back("1分あたりの料金は50〜2000円で入力してください");
  if (!/^[a-z0-9_-]{3,20}$/.test(code)) back("アフィリエイトコードは半角英数字3〜20文字で入力してください");
  let imageUrl: string | undefined;
  try { imageUrl = await saveImage(fd.get("image")); } catch (e) { back((e as Error).message); }

  const err = updateDb((db) => {
    if (db.tellers.some((t) => t.affiliateCode === code && t.id !== id)) return "このアフィリエイトコードは既に使われています";
    const fields = {
      name, kana: String(fd.get("kana") ?? ""), catchcopy: String(fd.get("catchcopy") ?? ""),
      methods: list(fd.get("methods")), specialties: list(fd.get("specialties")), styles: list(fd.get("styles")),
      bio: String(fd.get("bio") ?? ""), message: String(fd.get("message") ?? ""), pricePerMin: price,
      portrait: Number(fd.get("portrait") ?? 0) || 0, affiliateCode: code, published: !!fd.get("published"),
      sortOrder: Number(fd.get("sortOrder") ?? 0) || 0,
    };
    if (id) {
      const t = db.tellers.find((x) => x.id === id);
      if (!t) return "占い師が見つかりません";
      Object.assign(t, fields);
      if (imageUrl) t.imageUrl = imageUrl;
      if (fd.get("removeImage")) t.imageUrl = undefined;
      const u = db.users.find((x) => x.id === t.userId);
      if (u) {
        u.name = name;
        if (email && email !== u.email) {
          if (db.users.some((x) => x.email === email)) return "このメールアドレスは既に使われています";
          u.email = email;
        }
        if (password) { if (password.length < 8) return "パスワードは8文字以上にしてください"; u.passwordHash = hashPassword(password); }
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "ログイン用メールアドレスを入力してください";
      if (db.users.some((x) => x.email === email)) return "このメールアドレスは既に使われています";
      if (password.length < 8) return "初期パスワードは8文字以上にしてください";
      const userId = uid("u_");
      db.users.push({ id: userId, role: "teller", email, name, passwordHash: hashPassword(password), points: 0, createdAt: nowIso() });
      db.tellers.push({ ...fields, id: uid("t"), userId, imageUrl, status: "offline", createdAt: nowIso() });
    }
    return null;
  });
  if (err) back(err);
  revalidatePath("/tellers");
  redirect(`/admin/tellers?ok=${enc(id ? "占い師情報を更新しました" : "占い師を追加しました")}`);
}

export async function deleteTellerAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  updateDb((db) => {
    const t = db.tellers.find((x) => x.id === id);
    if (!t) return;
    // 履歴保全のため削除ではなく非公開化＋ログイン停止
    t.published = false;
    t.status = "offline";
    db.sessions = db.sessions.filter((s) => s.userId !== t.userId);
  });
  redirect(`/admin/tellers?ok=${enc("非公開にしました（鑑定履歴は保持されます）")}`);
}

export async function adminSetTellerStatusAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as TellerStatus;
  updateDb((db) => { const t = db.tellers.find((x) => x.id === id); if (t && ["waiting", "away", "offline"].includes(status)) t.status = status; });
  revalidatePath("/admin/tellers");
}

// ===== ユーザー =====
export async function adjustPointsAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  const amount = Math.trunc(Number(fd.get("amount")));
  const note = String(fd.get("note") ?? "").trim() || "運営による調整";
  if (!amount) redirect(`/admin/users?err=${enc("ポイント数を入力してください")}`);
  updateDb((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) return;
    u.points = Math.max(0, u.points + amount);
    db.transactions.push({ id: uid("x_"), userId: u.id, type: "bonus", amount, note, createdAt: nowIso() });
    notify(db, u.id, "ポイントが付与されました", `${note}：${amount > 0 ? "+" : ""}${amount.toLocaleString()}pt`, "/mypage/points", false);
  });
  redirect(`/admin/users?ok=${enc("ポイントを調整しました")}`);
}

// ===== 予約 =====
export async function adminCancelReservationAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  updateDb((db) => {
    const r = db.reservations.find((x) => x.id === id);
    if (!r) return;
    if (r.status === "in_progress") {
      const c = db.calls.find((x) => x.reservationId === id);
      if (c) finishCall(db, c, "system");
      return;
    }
    if (["requested", "approved"].includes(r.status)) {
      r.status = "cancelled";
      notify(db, r.userId, "予約がキャンセルされました", "運営により鑑定予約がキャンセルされました。ご不明点はお問い合わせください。", "/contact");
    }
  });
  redirect(`/admin/reservations?ok=${enc("処理しました")}`);
}

// ===== お知らせ・イベント =====
export async function savePostAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id") ?? "");
  const title = String(fd.get("title") ?? "").trim();
  const back = (m: string) => redirect(`/admin/posts/${id || "new"}?err=${enc(m)}`);
  if (!title) back("タイトルを入力してください");
  const rawSlug = String(fd.get("slug") ?? "").trim();
  const slug = rawSlug ? slugify(rawSlug) : "post-" + Date.now().toString(36);
  let cover: string | undefined;
  try { cover = await saveImage(fd.get("cover")); } catch (e) { back((e as Error).message); }
  const err = updateDb((db) => {
    if (db.posts.some((p) => p.slug === slug && p.id !== id)) return "このURL（スラッグ）は既に使われています";
    const fields: Partial<Post> = {
      type: fd.get("type") === "event" ? "event" : fd.get("type") === "column" ? "column" : "news", title, slug,
      category: String(fd.get("category") ?? "").trim().slice(0, 20) || undefined,
      excerpt: String(fd.get("excerpt") ?? ""), body: String(fd.get("body") ?? ""),
      eventDate: String(fd.get("eventDate") ?? "") || undefined, published: !!fd.get("published"), updatedAt: nowIso(),
    };
    if (id) {
      const p = db.posts.find((x) => x.id === id);
      if (!p) return "記事が見つかりません";
      Object.assign(p, fields);
      if (cover) p.coverImage = cover;
      if (fd.get("removeCover")) p.coverImage = undefined;
    } else {
      db.posts.push({ ...(fields as Post), id: uid("p_"), coverImage: cover, createdAt: nowIso() });
    }
    return null;
  });
  if (err) back(err);
  revalidatePath("/news");
  revalidatePath("/column");
  redirect(`/admin/posts?ok=${enc("保存しました")}`);
}

export async function deletePostAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  updateDb((db) => { db.posts = db.posts.filter((p) => p.id !== id); });
  redirect(`/admin/posts?ok=${enc("削除しました")}`);
}

// ===== 口コミ =====
export async function setReviewStatusAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as Review["status"] | "delete";
  updateDb((db) => {
    if (status === "delete") { db.reviews = db.reviews.filter((r) => r.id !== id); return; }
    const r = db.reviews.find((x) => x.id === id);
    if (r && ["pending", "published", "hidden"].includes(status)) r.status = status;
  });
  revalidatePath("/admin/reviews");
}

// ===== お問い合わせ =====
export async function setInquiryStatusAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as Inquiry["status"];
  updateDb((db) => { const q = db.inquiries.find((x) => x.id === id); if (q && ["new", "in_progress", "done"].includes(status)) q.status = status; });
  revalidatePath("/admin/inquiries");
}

// ===== アフィリエイト =====
export async function payEarningsAction(fd: FormData) {
  await admin();
  const tellerId = String(fd.get("tellerId"));
  const total = updateDb((db) => {
    let sum = 0;
    db.affiliateEarnings.filter((e) => e.tellerId === tellerId && !e.paid).forEach((e) => { e.paid = true; sum += e.amount; });
    const t = db.tellers.find((x) => x.id === tellerId);
    if (t && sum) notify(db, t.userId, "アフィリエイト報酬をお支払いしました", `未払い報酬 ${sum.toLocaleString()}円 を支払済みにしました。`, "/teller/affiliate");
    return sum;
  });
  redirect(`/admin/affiliate?ok=${enc(`${total.toLocaleString()}円を支払済みにしました`)}`);
}

// ===== 設定 =====
export async function saveSettingsAction(fd: FormData) {
  await admin();
  let avatar: string | undefined;
  try { avatar = await saveImage(fd.get("chatbotAvatar")); } catch (e) { redirect(`/admin/settings?err=${enc((e as Error).message)}`); }
  const num = (k: string, min: number, max: number, def: number) => { const n = Number(fd.get(k)); return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.trunc(n))) : def; };
  updateDb((db) => {
    const s = db.settings;
    s.siteName = String(fd.get("siteName") ?? s.siteName).trim() || s.siteName;
    s.heroTitle = String(fd.get("heroTitle") ?? s.heroTitle);
    s.heroText = String(fd.get("heroText") ?? s.heroText);
    s.announcement = String(fd.get("announcement") ?? "");
    s.reviewThreshold = num("reviewThreshold", 1, 50, s.reviewThreshold);
    s.reviewAutoPublish = !!fd.get("reviewAutoPublish");
    s.affiliateRate = num("affiliateRate", 0, 50, s.affiliateRate);
    s.affiliateSignupBonus = num("affiliateSignupBonus", 0, 100000, s.affiliateSignupBonus);
    s.signupPoints = num("signupPoints", 0, 100000, s.signupPoints);
    s.minMeteredMinutes = num("minMeteredMinutes", 1, 60, s.minMeteredMinutes);
    s.joinBeforeMin = num("joinBeforeMin", 0, 60, s.joinBeforeMin);
    s.chatbotName = String(fd.get("chatbotName") ?? "").trim().slice(0, 20) || s.chatbotName;
    if (avatar) s.chatbotAvatar = avatar;
    if (fd.get("removeChatbotAvatar")) s.chatbotAvatar = undefined;
  });
  revalidatePath("/", "layout");
  redirect(`/admin/settings?ok=${enc("設定を保存しました")}`);
}

export async function sendReviewRequestAction(fd: FormData) {
  await admin();
  const userId = String(fd.get("userId"));
  const tellerId = String(fd.get("tellerId"));
  updateDb((db) => {
    const t = db.tellers.find((x) => x.id === tellerId);
    if (t) notify(db, userId, `${t.name} 先生への口コミのお願い`, `いつもご利用ありがとうございます。${t.name} 先生の鑑定はいかがでしたか？ぜひ口コミをお寄せください。`, `/mypage/review/${tellerId}`);
  });
  redirect(`/admin/reviews?ok=${enc("口コミ依頼を送信しました")}`);
}

// ===== トップバナー =====
export async function saveBannerAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id") ?? "");
  const back = (m: string) => redirect(`/admin/banners?err=${enc(m)}`);
  const title = String(fd.get("title") ?? "").trim().slice(0, 40);
  const link = String(fd.get("link") ?? "").trim();
  if (!title) back("タイトルを入力してください");
  // サイト内パスまたは http(s) のみ許可
  if (link && !/^(https?:\/\/|\/(?![\/\\]))/.test(link)) back("リンク先は「/」から始まるサイト内のパス、または http(s):// から始まるURLを入力してください");
  let image: string | undefined;
  try { image = await saveImage(fd.get("image")); } catch (e) { back((e as Error).message); }
  const err = updateDb((db) => {
    const fields: Partial<SiteBanner> = {
      label: String(fd.get("label") ?? "").trim().slice(0, 20),
      title,
      subtitle: String(fd.get("subtitle") ?? "").trim().slice(0, 60),
      link: link || "/",
      published: !!fd.get("published"),
      sortOrder: Number(fd.get("sortOrder")) || 0,
    };
    if (id) {
      const b = db.banners.find((x) => x.id === id);
      if (!b) return "バナーが見つかりません";
      Object.assign(b, fields);
      if (image) b.image = image;
    } else {
      if (!image) return "新しいバナーには画像を選択してください";
      db.banners.push({ ...(fields as SiteBanner), id: uid("b_"), image });
    }
    return null;
  });
  if (err) back(err);
  revalidatePath("/");
  redirect(`/admin/banners?ok=${enc("バナーを保存しました")}`);
}

export async function deleteBannerAction(fd: FormData) {
  await admin();
  const id = String(fd.get("id"));
  updateDb((db) => { db.banners = db.banners.filter((b) => b.id !== id); });
  revalidatePath("/");
  redirect(`/admin/banners?ok=${enc("バナーを削除しました")}`);
}
