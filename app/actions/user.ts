"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { readDb, updateDb, uid, nowIso } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { FIXED_DURATIONS, isInSchedule, notify, requiredPoints, completedCount } from "@/lib/logic";
import { jstToDate, formatDateTime } from "@/lib/time";
import type { Reservation } from "@/lib/types";

const enc = encodeURIComponent;

export async function requestReservationAction(fd: FormData) {
  const tellerId = String(fd.get("tellerId") ?? "");
  const user = await requireRole("user", `/tellers/${tellerId}`);
  const type = fd.get("type") === "metered" ? "metered" : "fixed";
  const durationMin = type === "fixed" ? Number(fd.get("duration")) : undefined;
  const instant = fd.get("mode") === "instant";
  const date = String(fd.get("date") ?? "");
  const time = String(fd.get("time") ?? "");
  const message = String(fd.get("message") ?? "").slice(0, 1000);
  const back = (m: string) => redirect(`/tellers/${tellerId}?err=${enc(m)}#request`);

  const db = await readDb();
  const teller = db.tellers.find((t) => t.id === tellerId && t.published);
  if (!teller) back("占い師が見つかりません");
  if (type === "fixed" && !FIXED_DURATIONS.includes(durationMin!)) back("鑑定時間を選択してください");

  let startAt: Date;
  if (instant) {
    if (teller!.status !== "waiting") back("この占い師は現在待機中ではないため「今すぐ鑑定」はリクエストできません。日時指定でリクエストしてください");
    startAt = new Date();
  } else {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) back("希望日時を選択してください");
    startAt = jstToDate(date, time);
    if (isNaN(startAt.getTime()) || startAt.getTime() < Date.now() + 5 * 60000) back("希望日時は現在から5分以降を指定してください");
    const end = new Date(startAt.getTime() + (durationMin ?? 20) * 60000);
    if (!isInSchedule(db, tellerId, startAt, end)) back("ご希望の時間は占い師の待機スケジュール外です。スケジュール内の時間を選択してください");
  }

  const need = requiredPoints({ type, durationMin }, teller!, db.settings.minMeteredMinutes);
  if (user.points < need) {
    redirect(`/mypage/points?err=${enc(`このリクエストには${need.toLocaleString()}pt以上の残高が必要です（現在${user.points.toLocaleString()}pt）`)}`);
  }
  const dup = db.reservations.some((r) => r.userId === user.id && r.tellerId === tellerId && ["requested", "approved"].includes(r.status) && (instant ? r.instant : r.startAt === startAt!.toISOString()));
  if (dup) back("同じ内容のリクエストが既に送信されています。マイページをご確認ください");

  await updateDb((d) => {
    const r: Reservation = { id: uid("r_"), userId: user.id, tellerId, type, durationMin, startAt: startAt!.toISOString(), instant, message, status: "requested", createdAt: nowIso() };
    d.reservations.push(r);
    const when = instant ? "今すぐ" : formatDateTime(r.startAt);
    notify(d, teller!.userId, "新しい鑑定リクエストが届きました", `${user.name}様より鑑定リクエスト（${when} / ${type === "fixed" ? `${durationMin}分` : "従量制"}）が届きました。承認または辞退をお願いします。`, "/teller");
  });
  revalidatePath("/mypage");
  redirect(`/mypage?ok=${enc("鑑定リクエストを送信しました。占い師が承認すると予約確定となります。")}`);
}

export async function cancelReservationAction(fd: FormData) {
  const user = await requireRole("user", "/mypage");
  const id = String(fd.get("id"));
  await updateDb((db) => {
    const r = db.reservations.find((x) => x.id === id && x.userId === user.id);
    if (!r || !["requested", "approved"].includes(r.status)) return;
    r.status = "cancelled";
    const t = db.tellers.find((x) => x.id === r.tellerId);
    if (t) notify(db, t.userId, "予約がキャンセルされました", `${user.name}様の鑑定予約（${r.instant ? "今すぐ" : formatDateTime(r.startAt)}）がキャンセルされました。`, "/teller", false);
  });
  redirect(`/mypage?ok=${enc("キャンセルしました")}`);
}

export async function chargePointsAction(fd: FormData) {
  const user = await requireRole("user", "/mypage/points");
  const amount = Number(fd.get("amount"));
  if (![3000, 5000, 10000, 20000, 30000].includes(amount)) redirect(`/mypage/points?err=${enc("購入金額を選択してください")}`);
  const bonus = amount >= 20000 ? Math.floor(amount * 0.1) : amount >= 10000 ? Math.floor(amount * 0.05) : 0;
  await updateDb((db) => {
    const u = db.users.find((x) => x.id === user.id)!;
    u.points += amount + bonus;
    db.transactions.push({ id: uid("x_"), userId: u.id, type: "charge", amount, note: `ポイント購入（${fd.get("method") === "bank" ? "銀行振込" : "クレジットカード"}）`, createdAt: nowIso() });
    if (bonus) db.transactions.push({ id: uid("x_"), userId: u.id, type: "bonus", amount: bonus, note: "まとめ購入ボーナス", createdAt: nowIso() });
  });
  redirect(`/mypage/points?ok=${enc(`${(amount + bonus).toLocaleString()}ptを追加しました`)}`);
}

export async function postReviewAction(fd: FormData) {
  const user = await requireRole("user", "/mypage");
  const tellerId = String(fd.get("tellerId"));
  const rating = Math.min(5, Math.max(1, Number(fd.get("rating")) || 0));
  const body = String(fd.get("body") ?? "").trim();
  const back = (m: string) => redirect(`/mypage/review/${tellerId}?err=${enc(m)}`);
  const db = await readDb();
  if (completedCount(db, user.id, tellerId) < 1) back("鑑定を受けた占い師のみ口コミを投稿できます");
  if (body.length < 10 || body.length > 800) back("口コミは10〜800文字で入力してください");
  if (!fd.get("rating")) back("評価を選択してください");
  if (db.reviews.some((r) => r.userId === user.id && r.tellerId === tellerId)) back("この占い師への口コミは投稿済みです");
  await updateDb((d) => {
    d.reviews.push({ id: uid("v_"), userId: user.id, tellerId, rating, body, status: d.settings.reviewAutoPublish ? "published" : "pending", createdAt: nowIso() });
    d.notifications.filter((n) => n.userId === user.id && n.link === `/mypage/review/${tellerId}`).forEach((n) => (n.read = true));
  });
  redirect(`/mypage?ok=${enc(db.settings.reviewAutoPublish ? "口コミを投稿しました。ありがとうございました！" : "口コミを受け付けました。運営の確認後に掲載されます。ありがとうございました！")}`);
}

export async function readNotificationsAction() {
  const user = await requireRole("user", "/mypage");
  await updateDb((db) => db.notifications.filter((n) => n.userId === user.id).forEach((n) => (n.read = true)));
  revalidatePath("/mypage");
}
