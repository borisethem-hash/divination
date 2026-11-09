import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { DEMO_ACCOUNTS } from "@/lib/seed";
import { Flash } from "@/components/DashLayout";
import DemoLogin from "@/components/DemoLogin";

export const metadata = { title: "ログイン" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ err?: string; next?: string }> }) {
  const { err, next } = await searchParams;
  return (
    <div className="auth-wrap">
      <div className="auth-visual">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/photos/kyoto-alley.webp" alt="" />
        <div className="txt">
          <span className="en">Welcome back</span>
          <h2>おかえりなさい。</h2>
          <ul><li>アプリ不要・通話料0円のブラウザ通話</li><li>マイページから予約の確認・入室</li><li>鑑定履歴の確認と口コミ投稿</li></ul>
        </div>
      </div>
      <div className="auth-form">
        <div className="inner">
          <h1>ログイン</h1>
          <Flash err={err} />
          <form action={loginAction} className="form card">
            <input type="hidden" name="next" value={next ?? ""} />
            <div className="field"><label>メールアドレス</label><input id="login-email" className="input" type="email" name="email" required autoComplete="email" /></div>
            <div className="field"><label>パスワード</label><input id="login-password" className="input" type="password" name="password" required autoComplete="current-password" /></div>
            <button className="btn btn-lg btn-block">ログイン</button>
            <p className="small center mb-0">はじめての方は <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>無料会員登録</Link></p>
          </form>
          <div className="demo-box mt-3">
            <b>デモ用アカウント</b>（ボタンで入力欄に自動入力されます）
            <table className="mt-1"><tbody>{DEMO_ACCOUNTS.map((a) => (
              <tr key={a.email}><td>{a.role}</td><td>{a.email}<br /><span className="muted">{a.password}</span></td><td className="right"><DemoLogin email={a.email} password={a.password} /></td></tr>
            ))}</tbody></table>
            <p className="small muted mb-0 mt-1">※ 通話を試す場合は、ユーザーと占い師を別ブラウザ（またはシークレットウィンドウ）でログインしてください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
