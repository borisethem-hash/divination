import type { DB } from "./types";
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
