import Link from "next/link";

/** 下層ページの見出し（写真背景） */
export default function PageHead({ title, en, crumbs, lead, image = "/images/photos/moon-clouds.webp" }: { title: string; en?: string; crumbs?: string; lead?: string; image?: string }) {
  return (
    <div className="page-head">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="page-head-bg" />
      <div className="container">
        {en && <div className="en">{en}</div>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        <div className="crumbs"><Link href="/">ホーム</Link> ／ {crumbs ?? title}</div>
      </div>
    </div>
  );
}
