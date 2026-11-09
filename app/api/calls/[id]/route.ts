import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";
import { callLimitSec, finishCall, joinState, markCallStarted, hasEnoughPoints, CALL_DROP_MS } from "@/lib/logic";
import type { DB, Call } from "@/lib/types";

export const dynamic = "force-dynamic";

const PRESENCE_MS = 8000; // この時間ハートビートが無ければ不在

async function ctx(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です", status: 401 as const };
  const db = readDb();
  const r = db.reservations.find((x) => x.id === id);
  if (!r) return { error: "予約が見つかりません", status: 404 as const };
  const teller = db.tellers.find((t) => t.id === r.tellerId)!;
  const role = r.userId === user.id ? "user" : teller.userId === user.id ? "teller" : null;
  if (!role) return { error: "この通話への参加権限がありません", status: 403 as const };
  return { user, role: role as "user" | "teller" };
}

/** 状態の自動更新（時間切れ・回線切断）と、クライアントに返す状態 */
function tick(db: DB, call: Call, role: "user" | "teller") {
  const now = Date.now();
  if (role === "user") call.userSeen = now; else call.tellerSeen = now;
  const r = db.reservations.find((x) => x.id === call.reservationId)!;
  if (call.startedAt && !call.endedAt) {
    const limit = callLimitSec(db, r);
    const started = new Date(call.startedAt).getTime();
    if (now > started + (limit + 3) * 1000) {
      finishCall(db, call, "system", new Date(started + limit * 1000));
    } else {
      const otherSeen = role === "user" ? call.tellerSeen : call.userSeen;
      if (otherSeen && now - otherSeen > CALL_DROP_MS) finishCall(db, call, "system", new Date(otherSeen));
    }
  }
  return view(db, call, role);
}

function view(db: DB, call: Call | undefined, role: "user" | "teller") {
  const now = Date.now();
  const r = db.reservations.find((x) => x.id === (call?.reservationId))!;
  const otherSeen = call ? (role === "user" ? call.tellerSeen : call.userSeen) : undefined;
  return {
    epoch: call?.epoch ?? 0,
    offer: call?.offer ?? null,
    answer: call?.answer ?? null,
    peerPresent: !!otherSeen && now - otherSeen < PRESENCE_MS,
    startedAt: call?.startedAt ?? null,
    endedAt: call?.endedAt ?? null,
    endedBy: call?.endedBy ?? null,
    billedMinutes: call?.billedMinutes ?? null,
    amount: call?.amount ?? null,
    limitSec: r ? callLimitSec(db, r) : 0,
    serverNow: now,
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await ctx(id);
  if ("error" in c) return NextResponse.json({ error: c.error }, { status: c.status });
  const out = updateDb((db) => {
    const call = db.calls.find((x) => x.reservationId === id);
    if (!call) {
      const r = db.reservations.find((x) => x.id === id)!;
      if (r.status === "completed") {
        return { ...view(db, undefined, c.role), endedAt: r.decidedAt ?? r.startAt };
      }
      return view(db, undefined, c.role);
    }
    return tick(db, call, c.role);
  });
  return NextResponse.json(out);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await ctx(id);
  if ("error" in c) return NextResponse.json({ error: c.error }, { status: c.status });
  const body = (await req.json().catch(() => ({}))) as { action?: string; sdp?: string; epoch?: number };
  const result = updateDb((db): { error: string; status: number } | ReturnType<typeof view> => {
    const r = db.reservations.find((x) => x.id === id)!;
    let call = db.calls.find((x) => x.reservationId === id);

    switch (body.action) {
      case "join": {
        const js = joinState(db, r);
        if (!js.ok) return { error: js.reason ?? "入室できません", status: 409 };
        if (r.status === "approved" && !hasEnoughPoints(db, r)) {
          return { error: c.role === "user" ? "ポイント残高が不足しているため鑑定を開始できません。マイページからポイントを購入してください。" : "お客様のポイント残高が不足しているため、現在鑑定を開始できません。", status: 409 };
        }
        if (!call) {
          call = { id, reservationId: id, epoch: 1 };
          db.calls.push(call);
        } else if (!call.endedAt) {
          // 再入室：シグナリングをリセットして再接続
          call.epoch += 1;
          call.offer = undefined;
          call.answer = undefined;
        }
        return tick(db, call, c.role);
      }
      case "offer":
        if (!call || c.role !== "teller" || body.epoch !== call.epoch || !body.sdp) return { error: "invalid offer", status: 400 };
        call.offer = body.sdp.slice(0, 20000);
        call.answer = undefined;
        return tick(db, call, c.role);
      case "answer":
        if (!call || c.role !== "user" || body.epoch !== call.epoch || !call.offer || !body.sdp) return { error: "invalid answer", status: 400 };
        call.answer = body.sdp.slice(0, 20000);
        return tick(db, call, c.role);
      case "connected":
        if (!call || !call.offer || !call.answer || call.endedAt) return { error: "not ready", status: 400 };
        markCallStarted(db, call);
        return tick(db, call, c.role);
      case "end":
        if (!call) return view(db, undefined, c.role);
        finishCall(db, call, c.role);
        return view(db, db.calls.find((x) => x.reservationId === id), c.role);
      default:
        return { error: "unknown action", status: 400 };
    }
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result);
}
