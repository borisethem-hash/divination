// 日本時間(JST, UTC+9)で日付・時刻を扱うためのヘルパー
const JST_OFFSET = 9 * 60 * 60 * 1000;

export function jstDateStr(d: Date = new Date()): string {
  return new Date(d.getTime() + JST_OFFSET).toISOString().slice(0, 10);
}

export function jstTimeStr(d: Date = new Date()): string {
  return new Date(d.getTime() + JST_OFFSET).toISOString().slice(11, 16);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** JSTの日付と時刻(HH:MM, 24:00可)からDateを作成 */
export function jstToDate(dateStr: string, time: string): Date {
  if (time === "24:00") return new Date(new Date(dateStr + "T00:00:00+09:00").getTime() + 86400000);
  return new Date(`${dateStr}T${time}:00+09:00`);
}

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEK[d.getUTCDay()]})`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${jstDateStr(d).replace(/-/g, "/")} ${jstTimeStr(d)}`;
}

export function formatJpDate(iso: string): string {
  const s = jstDateStr(new Date(iso));
  const [y, m, d] = s.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}
