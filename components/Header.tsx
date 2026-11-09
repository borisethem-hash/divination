import Link from "next/link";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { MoonMark } from "./Art";

const LINKS = [
  { href: "/tellers", label: "占い師一覧" },
  { href: "/guide", label: "ご利用方法・料金" },
  { href: "/news", label: "お知らせ・イベント" },
  { href: "/faq", label: "よくある質問" },
  { href: "/contact", label: "お問い合わせ" },
];

export default async function Header() {
  const user = await getCurrentUser();
  const { settings } = readDb();
  const roleLabel = user ? (user.role === "admin" ? "管理画面" : user.role === "teller" ? "占い師ページ" : "マイページ") : "";
  return (
    <>
      {settings.announcement && <div className="topbar">{settings.announcement}</div>}
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <MoonMark size={34} />
            <span><b>{settings.siteName.replace("電話占い ", "")}</b><small>DENWA URANAI</small></span>
          </Link>
          <nav className="nav">
            {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
          <div className="header-actions">
            {user ? (
              <>
                <Link href={homeFor(user.role)} className="btn btn-sm">{roleLabel}{user.role === "user" ? `（${user.points.toLocaleString()}pt）` : ""}</Link>
                <form action={logoutAction}><button className="btn btn-sm btn-ghost">ログアウト</button></form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-sm btn-outline">ログイン</Link>
                <Link href="/register" className="btn btn-sm btn-shu">無料会員登録</Link>
              </>
            )}
          </div>
          <details className="sp-menu">
            <summary>メニュー</summary>
            <nav>
              {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              {user ? (
                <>
                  <Link href={homeFor(user.role)}>{roleLabel}</Link>
                  <form action={logoutAction}><button className="btn btn-sm btn-ghost mt-2">ログアウト</button></form>
                </>
              ) : (
                <>
                  <Link href="/login">ログイン</Link>
                  <Link href="/register">無料会員登録</Link>
                </>
              )}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
