import Link from "next/link";
import { cookies } from "next/headers";
import { registerAction } from "@/app/actions/auth";
import { readDb } from "@/lib/db";
import { Flash } from "@/components/DashLayout";

export const metadata = { title: "無料会員登録" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ err?: string; next?: string }> }) {
  const { err, next } = await searchParams;
  const db = await readDb();
  const ref = (await cookies()).get("tsuki_ref")?.value;
  const refTeller = ref ? db.tellers.find((t) => t.affiliateCode === ref) : undefined;
  return (
    <div className="auth-wrap">
      <div className="auth-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/photos/moon-lake.webp" alt="" />
        <div className="txt">
          <span className="en">Welcome</span>
          <h2>はじめての方へ</h2>
          <ul><li>登録は無料。今なら{db.settings.signupPoints.toLocaleString()}ptプレゼント</li><li>アプリ不要・通話料0円</li><li>予約は占い師の承認制で安心</li><li>時間指定なら料金は定額</li></ul>
        </div>
      </div>
      <div className="auth-form">
        <div className="inner">
          <h1>無料会員登録</h1>
          <p className="muted small">今なら登録で <b className="shu">{db.settings.signupPoints.toLocaleString()}pt</b> プレゼント</p>
          {refTeller && <div className="alert alert-info">{refTeller.name} 先生からのご紹介で登録します</div>}
          <Flash err={err} />
          <form action={registerAction} className="form card">
            <input type="hidden" name="next" value={next ?? ""} />
            <div className="field"><label>お名前（ニックネーム可）<span className="req">必須</span></label><input className="input" name="name" required maxLength={40} /></div>
            <div className="field"><label>メールアドレス<span className="req">必須</span></label><input className="input" type="email" name="email" required autoComplete="email" /></div>
            <div className="field"><label>パスワード（8文字以上）<span className="req">必須</span></label><input className="input" type="password" name="password" required minLength={8} autoComplete="new-password" /></div>
            <label className="check"><input type="checkbox" name="agree" required /><span><Link href="/terms" target="_blank">利用規約</Link>・<Link href="/privacy" target="_blank">プライバシーポリシー</Link>に同意する</span></label>
            <button className="btn btn-shu btn-lg btn-block">登録する</button>
            <p className="small center mb-0">登録済みの方は <Link href="/login">ログイン</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}
