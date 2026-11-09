import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";
import { updateTellerProfileAction } from "@/app/actions/teller";
import { TellerImage } from "@/components/Art";
import ImageInput from "@/components/ImageInput";

export const metadata = { title: "プロフィール編集" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams;
  const { teller: t0 } = await requireTeller();
  const t = (await readDb()).tellers.find((x) => x.id === t0.id)!;
  return (
    <>
      <h1>プロフィール編集</h1>
      <Flash ok={ok} err={err} />
      <form action={updateTellerProfileAction} className="card form" style={{ maxWidth: 760 }}>
        <div className="flex" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
          <div style={{ width: 120, height: 144, border: "1px solid var(--line)", overflow: "hidden", flex: "none" }}><TellerImage teller={t} /></div>
          <div className="field grow">
            <label>プロフィール画像（JPEG/PNG/WebP・大きい写真は自動で縮小）</label>
            <ImageInput name="image" />
            {t.imageUrl && <label className="check mt-1"><input type="checkbox" name="removeImage" />画像を削除してイラストに戻す</label>}
          </div>
        </div>
        <div className="field"><label>名前（変更は運営にご依頼ください）</label><input className="input" value={t.name} disabled /></div>
        <div className="field"><label>キャッチコピー</label><input className="input" name="catchcopy" defaultValue={t.catchcopy} maxLength={80} /></div>
        <div className="field"><label>占術（カンマ区切り）</label><input className="input" name="methods" defaultValue={t.methods.join(", ")} /></div>
        <div className="field"><label>得意な相談（カンマ区切り）</label><input className="input" name="specialties" defaultValue={t.specialties.join(", ")} /></div>
        <div className="field"><label>鑑定スタイル（カンマ区切り）</label><input className="input" name="styles" defaultValue={t.styles.join(", ")} /></div>
        <div className="field"><label>プロフィール</label><textarea className="input" name="bio" defaultValue={t.bio} maxLength={2000} style={{ minHeight: 180 }} /></div>
        <div className="field"><label>お客様へのメッセージ</label><textarea className="input" name="message" defaultValue={t.message} maxLength={300} /></div>
        <div className="field"><label>鑑定料（1分あたり）</label><input className="input" value={`${t.pricePerMin}円（変更は運営にご依頼ください）`} disabled /></div>
        <div><button className="btn btn-lg">保存する</button></div>
      </form>
    </>
  );
}
