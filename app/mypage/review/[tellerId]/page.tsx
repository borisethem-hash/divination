import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { completedCount } from "@/lib/logic";
import { postReviewAction } from "@/app/actions/user";
import { Flash } from "@/components/DashLayout";
import { TellerImage } from "@/components/Art";

export const metadata = { title: "口コミ投稿" };

export default async function ReviewPage({ params, searchParams }: { params: Promise<{ tellerId: string }>; searchParams: Promise<{ err?: string }> }) {
  const { tellerId } = await params;
  const { err } = await searchParams;
  const user = await requireRole("user", `/mypage/review/${tellerId}`);
  const db = readDb();
  const t = db.tellers.find((x) => x.id === tellerId);
  if (!t) notFound();
  const count = completedCount(db, user.id, tellerId);
  const existing = db.reviews.find((r) => r.userId === user.id && r.tellerId === tellerId);
  return (
    <>
      <h1>口コミ投稿</h1>
      <Flash err={err} />
      <div className="flex mb-3" style={{ flexWrap: "nowrap" }}>
        <div style={{ width: 72, height: 86, overflow: "hidden", border: "1px solid var(--line)", flex: "none" }}><TellerImage teller={t} /></div>
        <div><b style={{ fontSize: 18 }}>{t.name}</b> 先生<br /><span className="small muted">これまでのご利用：{count}回</span></div>
      </div>
      {existing ? (
        <div className="alert alert-info">この占い師への口コミは投稿済みです。ありがとうございました。<Link href="/mypage">マイページへ戻る</Link></div>
      ) : count < 1 ? (
        <div className="alert alert-err">鑑定を受けた占い師のみ口コミを投稿できます。</div>
      ) : (
        <form action={postReviewAction} className="card form" style={{ maxWidth: 640 }}>
          <input type="hidden" name="tellerId" value={t.id} />
          <span className="label">評価</span>
          <div className="radio-cards">
            {[5, 4, 3, 2, 1].map((n) => <label key={n}><input type="radio" name="rating" value={n} defaultChecked={n === 5} /><span className="stars">{"★".repeat(n)}</span></label>)}
          </div>
          <div className="field"><label>口コミ本文（10〜800文字）</label><textarea className="input" name="body" minLength={10} maxLength={800} required placeholder="鑑定の感想、当たった内容、占い師の雰囲気など" /></div>
          <p className="small muted mb-0">投稿された口コミは{db.settings.reviewAutoPublish ? "すぐに" : "運営の確認後に"}占い師のページに掲載されます。お名前は伏せ字で表示されます。</p>
          <button className="btn btn-shu btn-lg">投稿する</button>
        </form>
      )}
    </>
  );
}
