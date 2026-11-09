import { PatternBand } from "./Art";

export default function PageHead({ title, en, crumbs }: { title: string; en?: string; crumbs?: string }) {
  return (
    <div className="page-head">
      <div className="pattern"><PatternBand kind="seigaiha" /></div>
      <div className="container">
        {en && <div className="en">{en}</div>}
        <h1>{title}</h1>
        <div className="crumbs">ホーム ／ {crumbs ?? title}</div>
      </div>
    </div>
  );
}
