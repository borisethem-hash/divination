import Link from "next/link";

export default function DashLayout({ title, who, links, children }: { title: string; who: string; links: { href: string; label: string; badge?: number }[]; children: React.ReactNode }) {
  return (
    <div className="dash">
      <aside className="dash-side">
        <div className="who"><span className="small muted">{title}</span><b>{who}</b></div>
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            {l.badge ? <span className="badge" style={{ marginLeft: 6, color: "var(--shu)", padding: "0 6px" }}>{l.badge}</span> : null}
          </Link>
        ))}
      </aside>
      <div className="dash-main">{children}</div>
    </div>
  );
}

export function Flash({ ok, err }: { ok?: string; err?: string }) {
  return (
    <>
      {ok && <div className="alert alert-ok">{ok}</div>}
      {err && <div className="alert alert-err">{err}</div>}
    </>
  );
}
