import Link from "next/link";

/** セクション見出し（英字ラベル＋和文見出し＋リード） */
export function SecHead({ en, title, lead, more, left }: { en: string; title: string; lead?: string; more?: { href: string; label: string }; left?: boolean }) {
  return (
    <div className={`sec-head${left ? " sec-head-left" : ""}`}>
      <div>
        <span className="en">{en}</span>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
      {more && <Link href={more.href} className="more-link">{more.label}<span aria-hidden="true"> →</span></Link>}
    </div>
  );
}
