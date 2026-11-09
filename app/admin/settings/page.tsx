import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { saveSettingsAction } from "@/app/actions/admin";
import { GuideAvatar } from "@/components/Art";

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const s = readDb().settings;
  return (
    <>
      <h1>サイト設定</h1>
      <Flash ok={ok} err={err} />
      <form action={saveSettingsAction} className="form" style={{ maxWidth: 820 }}>
        <div className="card form">
          <h3 className="mb-0">サイト表示</h3>
          <div className="field"><label>サイト名</label><input className="input" name="siteName" defaultValue={s.siteName} required /></div>
          <div className="field"><label>ヘッダー上部のお知らせ（空欄で非表示）</label><input className="input" name="announcement" defaultValue={s.announcement} /></div>
          <div className="field"><label>トップページ キャッチコピー</label><input className="input" name="heroTitle" defaultValue={s.heroTitle} /></div>
          <div className="field"><label>トップページ 説明文</label><textarea className="input" name="heroText" defaultValue={s.heroText} /></div>
        </div>
        <div className="card form">
          <h3 className="mb-0">チャットボット（お問い合わせ案内）</h3>
          <div className="flex" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
            <div style={{ width: 90, height: 108, border: "1px solid var(--line)", overflow: "hidden", flex: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {s.chatbotAvatar ? <img src={s.chatbotAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <GuideAvatar />}
            </div>
            <div className="grow form">
              <div className="field"><label>案内係の名前</label><input className="input" name="chatbotName" defaultValue={s.chatbotName} maxLength={20} /></div>
              <div className="field"><label>案内係の画像（使用許諾を得た写真をアップロード）</label><input className="input" type="file" name="chatbotAvatar" accept="image/jpeg,image/png,image/webp,image/gif" /></div>
              {s.chatbotAvatar && <label className="check"><input type="checkbox" name="removeChatbotAvatar" />画像を削除してイラストに戻す</label>}
            </div>
          </div>
        </div>
        <div className="card form">
          <h3 className="mb-0">口コミ</h3>
          <div className="field"><label>自動で口コミ投稿を依頼するリピート回数</label><input className="input" type="number" name="reviewThreshold" min={1} max={50} defaultValue={s.reviewThreshold} style={{ maxWidth: 160 }} /> <span className="small muted">回以上（同じ占い師の鑑定完了回数）</span></div>
          <label className="check"><input type="checkbox" name="reviewAutoPublish" defaultChecked={s.reviewAutoPublish} />投稿された口コミを運営確認なしで即時掲載する</label>
        </div>
        <div className="card form">
          <h3 className="mb-0">アフィリエイト・特典</h3>
          <div className="grid g3" style={{ gap: 16 }}>
            <div className="field"><label>鑑定料に対する報酬率（%）</label><input className="input" type="number" name="affiliateRate" min={0} max={50} defaultValue={s.affiliateRate} /></div>
            <div className="field"><label>紹介登録1件の報酬（円）</label><input className="input" type="number" name="affiliateSignupBonus" min={0} defaultValue={s.affiliateSignupBonus} /></div>
            <div className="field"><label>新規登録特典（pt）</label><input className="input" type="number" name="signupPoints" min={0} defaultValue={s.signupPoints} /></div>
          </div>
        </div>
        <div className="card form">
          <h3 className="mb-0">予約・通話</h3>
          <div className="grid g2" style={{ gap: 16 }}>
            <div className="field"><label>従量制の開始に必要な残高（分）</label><input className="input" type="number" name="minMeteredMinutes" min={1} max={60} defaultValue={s.minMeteredMinutes} /></div>
            <div className="field"><label>予約開始の何分前から入室可能にするか</label><input className="input" type="number" name="joinBeforeMin" min={0} max={60} defaultValue={s.joinBeforeMin} /></div>
          </div>
        </div>
        <div><button className="btn btn-lg">設定を保存</button></div>
      </form>
    </>
  );
}
