import type { DB, Reservation, Teller, Call, Schedule } from "./types";
import { uid, nowIso } from "./util";
import { jstDateStr, jstToDate, formatDateTime } from "./time";

export const STATUS_LABEL: Record<Teller["status"], string> = {
  waiting: "待機中",
  away: "離席中",
  busy: "鑑定中",
  offline: "受付終了",
};

export const RES_STATUS_LABEL: Record<Reservation["status"], string> = {
  requested: "承認待ち",
  approved: "予約確定",
  rejected: "お断り",
  cancelled: "キャンセル",
  in_progress: "鑑定中",
  completed: "鑑定完了",
  expired: "期限切れ",
};

export const FIXED_DURATIONS = [20, 30, 45, 60];
/** 予約の入室期限（開始時刻から何分後まで入室できるか） */
export const JOIN_EXPIRE_MIN = 60;
/** 「今すぐ鑑定」リクエストの有効期限（分） */
export const INSTANT_REQUEST_EXPIRE_MIN = 30;
/** 通話中にこの時間ハートビートが途絶えたら切断とみなす */
export const CALL_DROP_MS = 45_000;
/** 従量制予約が占有するとみなす時間（重複チェック用） */
const METERED_BLOCK_MIN = 60;

export function tellerStats(db: DB, tellerId: string) {
  const reviews = db.reviews.filter((r) => r.tellerId === tellerId && r.status === "published");
  const rating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const sessions = db.reservations.filter((r) => r.tellerId === tellerId && r.status === "completed").length;
  return { rating, reviewCount: reviews.length, sessions };
}

export function schedulesFor(db: DB, tellerId: string, fromDate: string, days: number): Schedule[] {
  const end = new Date(fromDate + "T00:00:00Z");
  end.setUTCDate(end.getUTCDate() + days);
  const endStr = end.toISOString().slice(0, 10);
  return db.schedules
    .filter((s) => s.tellerId === tellerId && s.date >= fromDate && s.date < endStr)
    .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

export function isInSchedule(db: DB, tellerId: string, start: Date, end: Date): boolean {
  // 日付をまたぐ枠（前日の24:00まで等）も考慮して前後1日を確認
  const dates = [-1, 0].map((o) => jstDateStr(new Date(start.getTime() + o * 86400000)));
  return db.schedules.some((s) => {
    if (s.tellerId !== tellerId || !dates.includes(s.date)) return false;
    const ss = jstToDate(s.date, s.start).getTime();
    const se = jstToDate(s.date, s.end).getTime();
    return start.getTime() >= ss && end.getTime() <= se;
  });
}

export function reservationWindow(r: Reservation): { start: Date; end: Date } {
  const start = new Date(r.instant ? r.decidedAt ?? r.createdAt : r.startAt);
  const len = r.type === "fixed" ? r.durationMin ?? 30 : METERED_BLOCK_MIN;
  return { start, end: new Date(start.getTime() + len * 60000) };
}

export function findOverlap(db: DB, r: Reservation): Reservation | undefined {
  const w = reservationWindow(r);
  return db.reservations.find((o) => {
    if (o.id === r.id || o.tellerId !== r.tellerId || !["approved", "in_progress"].includes(o.status)) return false;
    const ow = reservationWindow(o);
    return w.start < ow.end && ow.start < w.end;
  });
}

/** 入室可能か判定 */
export function joinState(db: DB, r: Reservation, now = new Date()): { ok: boolean; reason?: string; opensAt?: Date } {
  if (r.status === "in_progress") return { ok: true };
  if (r.status !== "approved") return { ok: false, reason: "この予約は入室できる状態ではありません" };
  const { start } = reservationWindow(r);
  const opensAt = new Date(start.getTime() - db.settings.joinBeforeMin * 60000);
  const expires = new Date(start.getTime() + JOIN_EXPIRE_MIN * 60000);
  if (now < opensAt) return { ok: false, reason: `入室は ${formatDateTime(opensAt.toISOString())} から可能です`, opensAt };
  if (now > expires) return { ok: false, reason: `予約の入室期限（開始時刻から${JOIN_EXPIRE_MIN}分）を過ぎました` };
  return { ok: true };
}

/** ユーザーの残高が鑑定開始に足りるか */
export function hasEnoughPoints(db: DB, r: Reservation): boolean {
  const teller = db.tellers.find((t) => t.id === r.tellerId);
  const user = db.users.find((u) => u.id === r.userId);
  if (!teller || !user) return false;
  return user.points >= requiredPoints(r, teller, db.settings.minMeteredMinutes);
}

export function requiredPoints(r: Pick<Reservation, "type" | "durationMin">, teller: Teller, minMetered: number): number {
  return r.type === "fixed" ? (r.durationMin ?? 0) * teller.pricePerMin : minMetered * teller.pricePerMin;
}

/** 通話の最大秒数（定額：予約時間 / 従量：残ポイント） */
export function callLimitSec(db: DB, r: Reservation): number {
  const teller = db.tellers.find((t) => t.id === r.tellerId)!;
  if (r.type === "fixed") return (r.durationMin ?? 30) * 60;
  const user = db.users.find((u) => u.id === r.userId)!;
  return Math.floor(user.points / teller.pricePerMin) * 60;
}

export function notify(db: DB, userId: string, title: string, body: string, link?: string, mail = true): void {
  db.notifications.push({ id: uid("n_"), userId, title, body, link, read: false, createdAt: nowIso() });
  const user = db.users.find((u) => u.id === userId);
  if (mail && user) {
    db.mails.push({ id: uid("m_"), to: user.email, subject: `【${db.settings.siteName}】${title}`, body: `${user.name} 様\n\n${body}${link ? `\n\n▼詳しくはこちら\n${link}` : ""}`, createdAt: nowIso() });
  }
}

export function markCallStarted(db: DB, call: Call): void {
  if (call.startedAt) return;
  call.startedAt = nowIso();
  const r = db.reservations.find((x) => x.id === call.reservationId)!;
  r.status = "in_progress";
  const t = db.tellers.find((x) => x.id === r.tellerId)!;
  if (t.status !== "busy") {
    t.statusBeforeBusy = t.status;
    t.status = "busy";
  }
}

/** 通話終了・課金処理。課金・報酬・口コミ依頼を一括で行う */
export function finishCall(db: DB, call: Call, endedBy: "user" | "teller" | "system", endAt?: Date): void {
  if (call.endedAt) return;
  const r = db.reservations.find((x) => x.id === call.reservationId)!;
  const teller = db.tellers.find((x) => x.id === r.tellerId)!;
  const user = db.users.find((x) => x.id === r.userId)!;
  const end = endAt ?? new Date();

  if (!call.startedAt) {
    // 未接続のまま終了 → 課金なし、予約は確定状態のまま再入室可能
    db.calls = db.calls.filter((c) => c.id !== call.id);
    return;
  }

  call.endedAt = end.toISOString();
  call.endedBy = endedBy;
  const limitMin = Math.ceil(callLimitSec(db, r) / 60);
  const elapsedSec = Math.max(0, (end.getTime() - new Date(call.startedAt).getTime()) / 1000);
  const actualMin = Math.max(1, Math.ceil((elapsedSec - 5) / 60)); // 5秒の猶予

  let minutes: number;
  if (r.type === "fixed") {
    // 定額：予約時間分。お客様が途中終了した場合も予約時間分。
    // 占い師都合・回線切断による早期終了は実時間分のみ（上限は予約時間）
    const dur = r.durationMin ?? actualMin;
    minutes = endedBy === "user" ? dur : Math.min(actualMin, dur);
  } else {
    minutes = Math.min(actualMin, Math.max(1, limitMin));
  }
  let amount = minutes * teller.pricePerMin;
  if (amount > user.points) {
    minutes = Math.floor(user.points / teller.pricePerMin);
    amount = minutes * teller.pricePerMin;
  }

  call.billedMinutes = minutes;
  call.amount = amount;
  user.points -= amount;
  db.transactions.push({ id: uid("x_"), userId: user.id, type: "call", amount: -amount, note: `${teller.name} 鑑定 ${minutes}分（${r.type === "fixed" ? "時間指定" : "従量制"}）`, createdAt: call.endedAt });
  r.status = "completed";

  // ステータスを元に戻す
  if (teller.status === "busy") {
    teller.status = teller.statusBeforeBusy && teller.statusBeforeBusy !== "busy" ? teller.statusBeforeBusy : "waiting";
    teller.statusBeforeBusy = undefined;
  }

  // アフィリエイト報酬（紹介した占い師へ）
  if (user.referredBy && amount > 0) {
    const reward = Math.floor((amount * db.settings.affiliateRate) / 100);
    if (reward > 0) {
      db.affiliateEarnings.push({ id: uid("e_"), tellerId: user.referredBy, userId: user.id, kind: "call", amount: reward, note: `紹介ユーザー鑑定報酬（${teller.name} ${minutes}分）`, createdAt: call.endedAt, paid: false });
    }
  }

  notify(db, user.id, "鑑定が完了しました", `${teller.name} 先生の鑑定（${minutes}分 / ${amount.toLocaleString()}pt）が完了しました。残りポイント：${user.points.toLocaleString()}pt`, "/mypage/history", false);

  // 口コミ自動依頼：指定回数以上のリピートで、未投稿かつ未依頼の場合
  const count = db.reservations.filter((x) => x.userId === user.id && x.tellerId === teller.id && x.status === "completed").length;
  const link = `/mypage/review/${teller.id}`;
  const reviewed = db.reviews.some((v) => v.userId === user.id && v.tellerId === teller.id);
  const prompted = db.notifications.some((n) => n.userId === user.id && n.link === link);
  if (count >= db.settings.reviewThreshold && !reviewed && !prompted) {
    notify(db, user.id, `${teller.name} 先生への口コミのお願い`, `いつもご利用ありがとうございます。${count}回ご利用いただいた ${teller.name} 先生の鑑定はいかがでしたか？口コミを投稿いただくと、他のお客様の参考になります。`, link);
  }
}

/** リピート回数が閾値を超えたが口コミ未投稿の占い師一覧 */
export function pendingReviewTellers(db: DB, userId: string): Teller[] {
  const counts = new Map<string, number>();
  db.reservations.filter((r) => r.userId === userId && r.status === "completed").forEach((r) => counts.set(r.tellerId, (counts.get(r.tellerId) ?? 0) + 1));
  return db.tellers.filter((t) => (counts.get(t.id) ?? 0) >= db.settings.reviewThreshold && !db.reviews.some((v) => v.userId === userId && v.tellerId === t.id));
}

export function completedCount(db: DB, userId: string, tellerId: string): number {
  return db.reservations.filter((r) => r.userId === userId && r.tellerId === tellerId && r.status === "completed").length;
}

export function yen(n: number): string {
  return n.toLocaleString("ja-JP");
}

export function slugify(s: string): string {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return base || "post-" + Date.now().toString(36);
}

/**
 * 定期メンテナンス（readDb から最大10秒に1回実行）。変更があれば true を返す。
 *  1. 放置された通話の精算（双方が離脱／上限時間超過）
 *  2. 期限切れリクエスト・予約の失効
 *  3. 待機スケジュールに連動したステータスの自動切り替え
 */
export function housekeeping(db: DB, nowDate = new Date()): boolean {
  const now = nowDate.getTime();
  let changed = false;

  // 1. 通話中のまま放置された通話を精算
  for (const call of db.calls) {
    if (!call.startedAt || call.endedAt) continue;
    const r = db.reservations.find((x) => x.id === call.reservationId);
    if (!r) continue;
    const started = new Date(call.startedAt).getTime();
    const limitEnd = started + callLimitSec(db, r) * 1000;
    const seen = [call.userSeen, call.tellerSeen].filter((x): x is number => typeof x === "number");
    const lastBoth = seen.length === 2 ? Math.min(...seen) : started;
    if (now > limitEnd + 3000) {
      finishCall(db, call, "system", new Date(Math.min(limitEnd, Math.max(lastBoth, started))));
      changed = true;
    } else if (now - lastBoth > CALL_DROP_MS) {
      finishCall(db, call, "system", new Date(Math.max(lastBoth, started)));
      changed = true;
    }
  }

  // 2. 期限切れのリクエスト・予約
  for (const r of db.reservations) {
    if (r.status === "requested") {
      const expired = r.instant
        ? now - new Date(r.createdAt).getTime() > INSTANT_REQUEST_EXPIRE_MIN * 60000
        : now > new Date(r.startAt).getTime();
      if (expired) {
        r.status = "expired";
        r.decidedAt = nowDate.toISOString();
        const t = db.tellers.find((x) => x.id === r.tellerId);
        notify(db, r.userId, "鑑定リクエストが期限切れになりました", `${t?.name ?? "占い師"} 先生がリクエスト（${r.instant ? "今すぐ鑑定" : formatDateTime(r.startAt)}）に対応できなかったため、期限切れとなりました。ポイントは消費されていません。別の日時や他の占い師へのリクエストをご検討ください。`, "/tellers");
        changed = true;
      }
    } else if (r.status === "approved") {
      const { start } = reservationWindow(r);
      if (now > start.getTime() + JOIN_EXPIRE_MIN * 60000) {
        r.status = "expired";
        db.calls = db.calls.filter((c) => !(c.reservationId === r.id && !c.startedAt));
        changed = true;
      }
    }
  }

  // 3. スケジュール連動ステータス（枠の開始で「待機中」、終了で「受付終了」。途中の手動変更は尊重）
  for (const t of db.tellers) {
    const active = isInSchedule(db, t.id, nowDate, nowDate);
    if (t.scheduleActive === undefined) { t.scheduleActive = active; changed = true; continue; }
    if (active === t.scheduleActive) continue;
    t.scheduleActive = active;
    changed = true;
    if (!t.published) continue;
    if (active) {
      if (t.status === "offline") t.status = "waiting";
      else if (t.status === "busy" && t.statusBeforeBusy === "offline") t.statusBeforeBusy = "waiting";
    } else {
      if (t.status === "waiting" || t.status === "away") t.status = "offline";
      else if (t.status === "busy") t.statusBeforeBusy = "offline";
    }
  }
  return changed;
}
