"use client";
import { useMemo, useState } from "react";
import { requestReservationAction } from "@/app/actions/user";

type Props = {
  tellerId: string;
  price: number;
  canInstant: boolean;
  slotsByDate: Record<string, string[]>;
  dateLabels: Record<string, string>;
  points: number | null;
  minMetered: number;
  durations: number[];
};

export default function RequestForm({ tellerId, price, canInstant, slotsByDate, dateLabels, points, minMetered, durations }: Props) {
  const dates = Object.keys(slotsByDate);
  const [mode, setMode] = useState<"instant" | "scheduled">(canInstant ? "instant" : "scheduled");
  const [type, setType] = useState<"fixed" | "metered">("fixed");
  const [duration, setDuration] = useState(durations[1] ?? durations[0]);
  const [date, setDate] = useState(dates[0] ?? "");
  const times = useMemo(() => slotsByDate[date] ?? [], [slotsByDate, date]);
  const need = type === "fixed" ? duration * price : minMetered * price;
  const short = points !== null && points < need;

  return (
    <form action={requestReservationAction} className="form">
      <input type="hidden" name="tellerId" value={tellerId} />
      <div>
        <span className="label">鑑定の開始</span>
        <div className="radio-cards">
          <label aria-disabled={!canInstant} style={!canInstant ? { opacity: 0.45, cursor: "not-allowed" } : undefined}>
            <input type="radio" name="mode" value="instant" checked={mode === "instant"} disabled={!canInstant} onChange={() => setMode("instant")} />
            <span>今すぐ鑑定</span>
          </label>
          <label><input type="radio" name="mode" value="scheduled" checked={mode === "scheduled"} onChange={() => setMode("scheduled")} /><span>日時を指定</span></label>
        </div>
        {!canInstant && <p className="small muted mt-1 mb-0">※「今すぐ鑑定」は占い師が待機中のときに選べます</p>}
      </div>

      {mode === "scheduled" && (
        dates.length ? (
          <div className="grid g2" style={{ gap: 12 }}>
            <div className="field"><label>希望日</label>
              <select className="input" name="date" value={date} onChange={(e) => setDate(e.target.value)}>{dates.map((d) => <option key={d} value={d}>{dateLabels[d]}</option>)}</select>
            </div>
            <div className="field"><label>開始時刻</label>
              <select className="input" name="time" key={date}>{times.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
        ) : <div className="alert alert-info">現在予約可能な待機スケジュールがありません。</div>
      )}

      <div>
        <span className="label">鑑定タイプ</span>
        <div className="radio-cards">
          <label><input type="radio" name="type" value="fixed" checked={type === "fixed"} onChange={() => setType("fixed")} /><span>時間指定（定額）</span></label>
          <label><input type="radio" name="type" value="metered" checked={type === "metered"} onChange={() => setType("metered")} /><span>従量制（通話終了まで）</span></label>
        </div>
      </div>

      {type === "fixed" && (
        <div>
          <span className="label">鑑定時間</span>
          <div className="radio-cards">
            {durations.map((d) => (
              <label key={d}><input type="radio" name="duration" value={d} checked={duration === d} onChange={() => setDuration(d)} /><span>{d}分<br /><small className="muted">{(d * price).toLocaleString()}円</small></span></label>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>ご相談内容（任意・占い師に事前に伝わります）</label>
        <textarea className="input" name="message" maxLength={1000} placeholder="例）お付き合いしている彼との今後について" />
      </div>

      <div className="card-flat small">
        {type === "fixed" ? <>料金：<b className="shu">{need.toLocaleString()}円</b>（{duration}分 × {price}円）。時間になると自動で終了します。</>
          : <>料金：1分 <b className="shu">{price}円</b>（通話した分だけ）。開始には{minMetered}分相当（{need.toLocaleString()}pt）以上の残高が必要です。残高がなくなると自動で終了します。</>}
        {points !== null && <div className="mt-1">現在のポイント残高：<b>{points.toLocaleString()}pt</b></div>}
      </div>

      {points === null ? (
        <a href={`/login?next=/tellers/${tellerId}`} className="btn btn-shu btn-block btn-lg">ログインしてリクエストする</a>
      ) : short ? (
        <a href="/mypage/points" className="btn btn-gold btn-block btn-lg">ポイントが不足しています（購入する）</a>
      ) : (
        <button className="btn btn-shu btn-block btn-lg" disabled={mode === "scheduled" && !dates.length}>鑑定リクエストを送る</button>
      )}
      <p className="small muted mb-0">リクエストは占い師が承認した時点で予約確定となります。確定前のキャンセルは無料です。</p>
    </form>
  );
}
