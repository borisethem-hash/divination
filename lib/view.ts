import type { DB, Teller } from "./types";
import { jstDateStr } from "./time";
import { tellerStats } from "./logic";

export function todaySlots(db: DB, tellerId: string): string {
  const today = jstDateStr();
  const s = db.schedules.filter((x) => x.tellerId === tellerId && x.date === today).sort((a, b) => a.start.localeCompare(b.start));
  return s.length ? s.map((x) => `${x.start}〜${x.end}`).join(" / ") : "お休み";
}

export function publishedTellers(db: DB) {
  const order = { waiting: 0, busy: 1, away: 2, offline: 3 } as const;
  return db.tellers
    .filter((t) => t.published)
    .map((t) => ({ teller: t, ...tellerStats(db, t.id), today: todaySlots(db, t.id) }))
    .sort((a, b) => order[a.teller.status] - order[b.teller.status] || a.teller.sortOrder - b.teller.sortOrder);
}

export type TellerView = ReturnType<typeof publishedTellers>[number];

/** 在籍30日以内の占い師は「NEW」 */
export function isNewTeller(t: Teller, now = Date.now()): boolean {
  return now - new Date(t.createdAt).getTime() < 30 * 86400000;
}

/** 直近 days 日間の鑑定数で並べた人気ランキング（同数は評価順） */
export function ranking(db: DB, days = 30) {
  const since = Date.now() - days * 86400000;
  const counts = new Map<string, number>();
  for (const r of db.reservations) {
    if (r.status !== "completed" || new Date(r.startAt).getTime() < since) continue;
    counts.set(r.tellerId, (counts.get(r.tellerId) ?? 0) + 1);
  }
  return publishedTellers(db)
    .map((t) => ({ ...t, recent: counts.get(t.teller.id) ?? 0 }))
    .sort((a, b) => b.recent - a.recent || b.rating - a.rating || a.teller.sortOrder - b.teller.sortOrder);
}

/** 占術・相談内容が近い占い師 */
export function similarTellers(db: DB, teller: Teller, limit = 4) {
  return publishedTellers(db)
    .filter((t) => t.teller.id !== teller.id)
    .map((t) => ({ t, score: t.teller.methods.filter((m) => teller.methods.includes(m)).length * 2 + t.teller.specialties.filter((s) => teller.specialties.includes(s)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}

/** トップ・一覧で使う「相談内容から探す」 */
export const TOPICS: { name: string; note: string }[] = [
  { name: "恋愛", note: "相手の気持ち・恋の行方" },
  { name: "片思い", note: "距離の縮め方・脈あり？" },
  { name: "復縁", note: "もう一度つながる可能性" },
  { name: "結婚", note: "結婚の時期・相性" },
  { name: "仕事", note: "適職・人間関係・評価" },
  { name: "人間関係", note: "職場・友人・家族" },
  { name: "金運", note: "お金の流れ・開運" },
  { name: "人生の転機", note: "決断のタイミング" },
];

/** 「占術から探す」 */
export const METHODS: { name: string; note: string }[] = [
  { name: "タロット", note: "今の流れと未来を映すカード" },
  { name: "西洋占星術", note: "ホロスコープで時期を読む" },
  { name: "四柱推命", note: "命式で人生の季節を知る" },
  { name: "霊視", note: "見えない縁や本音を感じ取る" },
  { name: "九星気学", note: "運気の波と吉方位" },
  { name: "数秘術", note: "誕生数が示す本質" },
  { name: "周易", note: "卦の言葉で迷いに答えを" },
  { name: "風水", note: "住まいと気の流れを整える" },
];
