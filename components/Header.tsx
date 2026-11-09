import Link from "next/link";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { logoutAction } from "@/app/actions/auth";
import { MoonMark } from "./Art";

const LINKS = [
  { href: "/tellers", label: "占い師を探す", en: "Tellers" },
  { href: "/horoscope", label: "今日の運勢", en: "Horoscope" },
  { href: "/column", label: "占いコラム", en: "Column" },
  { href: "/guide", label: "ご利用ガイド", en: "Guide" },
  { href: "/news", label: "お知らせ", en: "News" },
  { href: "/faq", label: "よくある質問", en: "FAQ" },
];
const SUB_LINKS = [
  { href: "/about", label: "月あかりについて" },
  { href: "/recruit", label: "占い師募集" },
  { href: "/contact", label: "お問い合わせ" },
];

export default async function Header() {
  const user = await getCurrentUser();
  const { settings, tellers } = await readDb();
  const waiting = tellers.filter((t) => t.published && t.status === "waiting").length;
  const roleLabel = user ? (user.role === "admin" ? "管理画面" : user.role === "teller" ? "占い師ページ" : "マイページ") : "";
  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span className="announce">{settings.announcement || "アプリ不要・通話料0円の電話占い"}</span>
          <nav className="topbar-links hide-sp">{SUB_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</nav>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="logo">
            <MoonMark size={36} />
            <span><b>{settings.siteName.replace("電話占い ", "")}</b><small>DENWA URANAI</small></span>
          </Link>
          <nav className="nav">
            {LINKS.map((l) => <Link key={l.href} href={l.href}><span>{l.label}</span><small>{l.en}</small></Link>)}
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
            <summary aria-label="メニューを開く"><span className="burger" aria-hidden="true"><i /><i /><i /></span>メニュー</summary>
            <nav>
              <Link href="/tellers?status=waiting" className="sp-waiting"><span className="pulse" />今すぐ占える占い師（{waiting}名）</Link>
              {LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}<small>{l.en}</small></Link>)}
              {SUB_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              {user ? (
                <>
                  <Link href={homeFor(user.role)}>{roleLabel}</Link>
                  <form action={logoutAction}><button className="btn btn-sm btn-ghost mt-2">ログアウト</button></form>
                </>
              ) : (
                <div className="sp-auth">
                  <Link href="/login" className="btn btn-outline">ログイン</Link>
                  <Link href="/register" className="btn btn-shu">無料会員登録</Link>
                </div>
              )}
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
