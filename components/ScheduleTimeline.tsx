import Link from "next/link";
import type { DB } from "@/lib/types";
import { jstDateStr, jstTimeStr } from "@/lib/time";
import { publishedTellers } from "@/lib/view";
import { TellerImage } from "./Art";
import { StatusBadge } from "./TellerCard";
import TimelineScroller from "./TimelineScroller";

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** 本日の出演スケジュール（0〜24時のタイムライン） */
export default function ScheduleTimeline({ db, limit = 12 }: { db: DB; limit?: number }) {
  const today = jstDateStr();
  const nowMin = toMin(jstTimeStr());
  const rows = publishedTellers(db)
    .map((t) => ({ t, slots: db.schedules.filter((s) => s.tellerId === t.teller.id && s.date === today).sort((a, b) => a.start.localeCompare(b.start)) }))
    .filter((r) => r.slots.length)
    .slice(0, limit);
  if (!rows.length) return <div className="empty">本日の出演予定はまだ登録されていません。</div>;
  const pct = (m: number) => `${(m / 1440) * 100}%`;
  return (
    <div className="timeline">
      <TimelineScroller nowRatio={nowMin / 1440}>
        <div className="tl-grid">
          <div className="tl-head">
            <div className="tl-name" />
            <div className="tl-hours">{[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => <span key={h} style={{ left: pct(h * 60) }}>{h}</span>)}</div>
          </div>
          {rows.map(({ t, slots }) => {
            return (
              <Link key={t.teller.id} href={`/tellers/${t.teller.id}`} className="tl-row">
                <div className="tl-name">
                  <span className="tl-ph"><TellerImage teller={t.teller} /></span>
                  <span className="tl-who"><b>{t.teller.name}</b><StatusBadge status={t.teller.status} /></span>
                </div>
                <div className="tl-bar">
                  {[3, 6, 9, 12, 15, 18, 21].map((h) => <span key={h} className="tl-tick" style={{ left: pct(h * 60) }} />)}
                  {slots.map((s) => <span key={s.id} className={`tl-slot${toMin(s.start) <= nowMin && nowMin < toMin(s.end) ? " on" : ""}`} style={{ left: pct(toMin(s.start)), width: pct(toMin(s.end) - toMin(s.start)) }} title={`${s.start}〜${s.end}`}>{s.start}〜{s.end}</span>)}
                  <span className="tl-now" style={{ left: pct(nowMin) }} />
                </div>
              </Link>
            );
          })}
        </div>
      </TimelineScroller>
      <p className="small muted mt-1 mb-0">赤い線が現在時刻です。待機予定は占い師の都合により変更になる場合があります。</p>
    </div>
  );
}
