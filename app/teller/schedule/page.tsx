import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { addScheduleAction, deleteScheduleAction } from "@/app/actions/teller";
import { schedulesFor } from "@/lib/logic";
import { jstDateStr, addDays, formatDate } from "@/lib/time";

export const metadata = { title: "待機スケジュール" };

const WD = ["日", "月", "火", "水", "木", "金", "土"];

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { teller } = await requireTeller();
  const db = await readDb();
  const today = jstDateStr();
  const list = schedulesFor(db, teller.id, today, 31);
  const byDate = new Map<string, typeof list>();
  list.forEach((s) => byDate.set(s.date, [...(byDate.get(s.date) ?? []), s]));
  const times = Array.from({ length: 49 }, (_, i) => `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

  return (
    <>
      <h1>待機スケジュール</h1>
      <Flash ok={ok} err={err} />
      <form action={addScheduleAction} className="card form mb-3">
        <h3 className="mb-0">スケジュールを登録</h3>
        <p className="small muted mb-0">期間・曜日・時間帯を指定してまとめて登録できます（1日だけの場合は開始日と終了日を同じにしてください）。</p>
        <div className="grid g4" style={{ gap: 12 }}>
          <div className="field"><label>開始日</label><input className="input" type="date" name="from" defaultValue={today} min={today} required /></div>
          <div className="field"><label>終了日</label><input className="input" type="date" name="to" defaultValue={addDays(today, 6)} min={today} required /></div>
          <div className="field"><label>開始時刻</label><select className="input" name="start" defaultValue="19:00">{times.slice(0, 48).map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>終了時刻</label><select className="input" name="end" defaultValue="23:00">{times.slice(1).map((t) => <option key={t} value={t === "24:00" ? "24:00" : t}>{t}</option>)}</select></div>
        </div>
        <div><span className="label">曜日（未選択はすべての曜日）</span>{WD.map((w, i) => <label key={w} className="check"><input type="checkbox" name="weekday" value={i} />{w}</label>)}</div>
        <div><button className="btn">登録する</button></div>
      </form>

      <h2 style={{ fontSize: 18 }}>今後31日間の待機予定</h2>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 120 }}>日付</th><th>待機時間</th></tr></thead>
          <tbody>
            {Array.from({ length: 31 }, (_, i) => addDays(today, i)).map((d) => (
              <tr key={d}>
                <td><b>{formatDate(d)}</b></td>
                <td>
                  {(byDate.get(d) ?? []).length ? (
                    <div className="flex" style={{ gap: 8 }}>
                      {byDate.get(d)!.map((s) => (
                        <form key={s.id} action={deleteScheduleAction} className="flex" style={{ gap: 0, border: "1px solid var(--line-2)" }}>
                          <input type="hidden" name="id" value={s.id} />
                          <span style={{ padding: "4px 10px" }}>{s.start}〜{s.end}</span>
                          <button className="btn btn-sm btn-danger" style={{ border: 0, borderLeft: "1px solid var(--line-2)" }} title="削除">×</button>
                        </form>
                      ))}
                    </div>
                  ) : <span className="muted small">お休み</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
