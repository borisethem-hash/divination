import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TellerImage } from "@/components/Art";
import { StatusBadge, Stars } from "@/components/TellerCard";
import RequestForm from "@/components/RequestForm";
import { schedulesFor, tellerStats, FIXED_DURATIONS } from "@/lib/logic";
import { jstDateStr, addDays, formatDate, jstToDate, formatJpDate } from "@/lib/time";
import { Flash } from "@/components/DashLayout";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = readDb().tellers.find((x) => x.id === id);
  return { title: t ? `${t.name}（${t.methods.join("・")}）` : "占い師" };
}

export default async function TellerDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const db = readDb();
  const teller = db.tellers.find((t) => t.id === id && t.published);
  if (!teller) notFound();
  const user = await getCurrentUser();
  const stats = tellerStats(db, teller.id);
  const today = jstDateStr();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const sched = schedulesFor(db, teller.id, today, 14);
  const reviews = db.reviews.filter((r) => r.tellerId === teller.id && r.status === "published").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // 予約可能な開始時刻（30分刻み、現在+5分以降、最短20分の枠が取れる時刻）
  const slotsByDate: Record<string, string[]> = {};
  const dateLabels: Record<string, string> = {};
  const minStart = Date.now() + 5 * 60000;
  for (const s of sched) {
    const st = jstToDate(s.date, s.start).getTime();
    const en = jstToDate(s.date, s.end).getTime();
    for (let t = st; t + 20 * 60000 <= en; t += 30 * 60000) {
      if (t < minStart) continue;
      const d = new Date(t);
      const date = jstDateStr(d);
      const hhmm = new Date(t + 9 * 3600000).toISOString().slice(11, 16);
      (slotsByDate[date] ??= []).push(hhmm);
      dateLabels[date] = formatDate(date);
    }
  }
  const sortedSlots = Object.fromEntries(Object.entries(slotsByDate).sort(([a], [b]) => a.localeCompare(b)));

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div className="small muted mb-2"><Link href="/tellers">占い師一覧</Link> ／ {teller.name}</div>
      <div className="grid detail-grid">
        <div>
          <div style={{ border: "1px solid var(--line)", aspectRatio: "5/6", overflow: "hidden", position: "relative" }}>
            <TellerImage teller={teller} />
            <span style={{ position: "absolute", left: 0, top: 0 }}><StatusBadge status={teller.status} /></span>
          </div>
          <table className="table mt-2" style={{ border: "1px solid var(--line)" }}>
            <tbody>
              <tr><th>鑑定料</th><td><b className="shu" style={{ fontSize: 20, fontFamily: "var(--serif)" }}>{teller.pricePerMin}円</b> / 1分</td></tr>
              <tr><th>評価</th><td><Stars value={stats.rating} /> {stats.rating ? stats.rating.toFixed(1) : "-"}（{stats.reviewCount}件）</td></tr>
              <tr><th>鑑定実績</th><td>{stats.sessions}件</td></tr>
              <tr><th>占術</th><td>{teller.methods.map((m) => <span key={m} className="tag">{m}</span>)}</td></tr>
              <tr><th>相談内容</th><td>{teller.specialties.map((m) => <span key={m} className="tag">{m}</span>)}</td></tr>
              <tr><th>スタイル</th><td>{teller.styles.map((m) => <span key={m} className="tag">{m}</span>)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <span className="small muted">{teller.kana}</span>
          <h1 style={{ fontSize: 30, marginBottom: 4 }}>{teller.name}</h1>
          <p className="gold" style={{ fontFamily: "var(--serif)" }}>{teller.catchcopy}</p>
          <h3 className="mt-3">プロフィール</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{teller.bio}</p>
          <div className="card-flat"><b>占い師からのメッセージ</b><p className="mb-0 mt-1">{teller.message}</p></div>

          <h3 className="mt-4">待機スケジュール（7日間）</h3>
          <div className="week">
            {week.map((d) => {
              const s = sched.filter((x) => x.date === d);
              return (
                <div key={d}>
                  <div className="d">{formatDate(d)}</div>
                  {s.length ? s.map((x) => <div key={x.id} className="slot">{x.start}<br />〜{x.end}</div>) : <div className="none">お休み</div>}
                </div>
              );
            })}
          </div>

          <h3 className="mt-4" id="request">鑑定リクエスト</h3>
          <Flash err={err} />
          {user && user.role !== "user" ? (
            <div className="alert alert-info">鑑定リクエストはユーザーアカウントでログインすると送信できます。</div>
          ) : (
            <div className="card">
              <RequestForm tellerId={teller.id} price={teller.pricePerMin} canInstant={teller.status === "waiting"} slotsByDate={sortedSlots} dateLabels={dateLabels} points={user ? user.points : null} minMetered={db.settings.minMeteredMinutes} durations={FIXED_DURATIONS} />
            </div>
          )}

          <h3 className="mt-4">口コミ（{reviews.length}件）</h3>
          {reviews.length ? reviews.map((r) => {
            const u = db.users.find((x) => x.id === r.userId);
            return (
              <div key={r.id} style={{ borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
                <div className="flex between"><span><Stars value={r.rating} /> <span className="small">{u ? u.name.slice(0, 1) + "＊＊ 様" : "匿名"}</span></span><span className="small muted">{formatJpDate(r.createdAt)}</span></div>
                <p className="mb-0 mt-1">{r.body}</p>
              </div>
            );
          }) : <div className="empty">まだ口コミはありません</div>}
        </div>
      </div>
    </div>
  );
}
