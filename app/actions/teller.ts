"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateDb, uid, nowIso } from "@/lib/db";
import { requireTeller } from "@/lib/auth";
import { findOverlap, notify, requiredPoints, INSTANT_REQUEST_EXPIRE_MIN } from "@/lib/logic";
import { addDays, formatDateTime } from "@/lib/time";
import { saveImage } from "@/lib/upload";
import type { TellerStatus } from "@/lib/types";

const enc = encodeURIComponent;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;

export async function setStatusAction(fd: FormData) {
  const { teller } = await requireTeller();
  const status = String(fd.get("status")) as TellerStatus;
  if (!["waiting", "away", "offline"].includes(status)) return;
  await updateDb((db) => {
    const t = db.tellers.find((x) => x.id === teller.id)!;
    const inCall = db.reservations.some((r) => r.tellerId === t.id && r.status === "in_progress");
    if (inCall) { t.statusBeforeBusy = status; return; } // 鑑定中は終了後に反映
    t.status = status;
  });
  revalidatePath("/teller");
}

export async function approveReservationAction(fd: FormData) { await decide(fd, "approve"); }
export async function rejectReservationAction(fd: FormData) { await decide(fd, "reject"); }

async function decide(fd: FormData, decision: "approve" | "reject") {
  const { teller } = await requireTeller();
  const id = String(fd.get("id"));
  const note = String(fd.get("note") ?? "").slice(0, 300);
  const err = await updateDb((db) => {
    const r = db.reservations.find((x) => x.id === id && x.tellerId === teller.id);
    if (!r || r.status !== "requested") return "このリクエストは既に処理されています";
    const t = db.tellers.find((x) => x.id === teller.id)!;
    const when = r.instant ? "今すぐ鑑定" : formatDateTime(r.startAt);
    if (decision === "approve") {
      const user = db.users.find((u) => u.id === r.userId)!;
      if (user.points < requiredPoints(r, t, db.settings.minMeteredMinutes)) return "お客様のポイント残高が不足しているため承認できません";
      if (r.instant && Date.now() - new Date(r.createdAt).getTime() > INSTANT_REQUEST_EXPIRE_MIN * 60000) return `「今すぐ鑑定」リクエストの有効期限（${INSTANT_REQUEST_EXPIRE_MIN}分）を過ぎています`;
      if (!r.instant && new Date(r.startAt).getTime() < Date.now()) return "希望日時を過ぎたリクエストのため承認できません";
      r.decidedAt = nowIso();
      const ov = findOverlap(db, r);
      if (ov) { r.decidedAt = undefined; return `同じ時間帯に確定済みの予約（${formatDateTime(ov.startAt)}）があります`; }
      r.status = "approved";
      r.tellerNote = note || undefined;
      notify(db, r.userId, "鑑定予約が確定しました", `${t.name} 先生が鑑定リクエスト（${when} / ${r.type === "fixed" ? `${r.durationMin}分` : "従量制"}）を承認しました。${r.instant ? "マイページから今すぐ入室してください。" : `開始${db.settings.joinBeforeMin}分前からマイページで入室できます。`}${note ? `\n\n占い師からのメッセージ：${note}` : ""}`, "/mypage");
    } else {
      r.status = "rejected";
      r.decidedAt = nowIso();
      r.tellerNote = note || undefined;
      notify(db, r.userId, "鑑定リクエストについて", `申し訳ございません。${t.name} 先生は今回のリクエスト（${when}）をお受けできませんでした。${note ? `\n\n占い師からのメッセージ：${note}` : ""}\n別の日時、または他の占い師へのリクエストをご検討ください。`, "/tellers");
    }
    return null;
  });
  redirect(`/teller?${err ? `err=${enc(err)}` : `ok=${enc(decision === "approve" ? "承認しました。お客様に通知しました" : "辞退しました")}`}`);
}

export async function addScheduleAction(fd: FormData) {
  const { teller } = await requireTeller();
  const from = String(fd.get("from") ?? "");
  const to = String(fd.get("to") ?? from);
  const start = String(fd.get("start") ?? "");
  const end = String(fd.get("end") ?? "");
  const weekdays = fd.getAll("weekday").map(Number);
  const back = (m: string) => redirect(`/teller/schedule?err=${enc(m)}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to < from) back("期間を正しく入力してください");
  if (!TIME.test(start) || !TIME.test(end) || start >= end) back("開始・終了時刻を正しく入力してください（終了は開始より後）");
  let added = 0;
  await updateDb((db) => {
    for (let d = from, i = 0; d <= to && i < 92; d = addDays(d, 1), i++) {
      const wd = new Date(d + "T00:00:00Z").getUTCDay();
      if (weekdays.length && !weekdays.includes(wd)) continue;
      const overlaps = db.schedules.some((s) => s.tellerId === teller.id && s.date === d && s.start < end && start < s.end);
      if (overlaps) continue;
      db.schedules.push({ id: uid("s_"), tellerId: teller.id, date: d, start, end });
      added++;
    }
  });
  redirect(`/teller/schedule?ok=${enc(`${added}件の待機スケジュールを登録しました${added === 0 ? "（重複する枠はスキップされました）" : ""}`)}`);
}

export async function deleteScheduleAction(fd: FormData) {
  const { teller } = await requireTeller();
  const id = String(fd.get("id"));
  await updateDb((db) => { db.schedules = db.schedules.filter((s) => !(s.id === id && s.tellerId === teller.id)); });
  revalidatePath("/teller/schedule");
}

export async function updateTellerProfileAction(fd: FormData) {
  const { teller } = await requireTeller();
  let imageUrl: string | undefined;
  try { imageUrl = await saveImage(fd.get("image")); } catch (e) { redirect(`/teller/profile?err=${enc((e as Error).message)}`); }
  const list = (k: string) => String(fd.get(k) ?? "").split(/[,、\s]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8);
  await updateDb((db) => {
    const t = db.tellers.find((x) => x.id === teller.id)!;
    t.catchcopy = String(fd.get("catchcopy") ?? "").slice(0, 80);
    t.bio = String(fd.get("bio") ?? "").slice(0, 2000);
    t.message = String(fd.get("message") ?? "").slice(0, 300);
    t.methods = list("methods");
    t.specialties = list("specialties");
    t.styles = list("styles");
    if (imageUrl) t.imageUrl = imageUrl;
    if (fd.get("removeImage")) t.imageUrl = undefined;
  });
  redirect(`/teller/profile?ok=${enc("プロフィールを更新しました")}`);
}
