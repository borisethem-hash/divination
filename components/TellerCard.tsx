import Link from "next/link";
import type { Teller } from "@/lib/types";
import { TellerImage } from "./Art";
import { STATUS_LABEL } from "@/lib/logic";
import { isNewTeller } from "@/lib/view";

export function StatusBadge({ status }: { status: Teller["status"] }) {
  return <span className={`status st-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return <span className="stars" aria-label={`評価${value.toFixed(1)}`}>{"★".repeat(full)}{"☆".repeat(5 - full)}</span>;
}

export default function TellerCard({ teller, rating, reviewCount, today }: { teller: Teller; rating: number; reviewCount: number; today?: string }) {
  return (
    <Link href={`/tellers/${teller.id}`} className="tcard">
      <div className="ph">
        <TellerImage teller={teller} />
        <StatusBadge status={teller.status} />
        {isNewTeller(teller) && <span className="new-badge">NEW</span>}
      </div>
      <div className="body">
        <span className="kana">{teller.kana}</span>
        <span className="name">{teller.name}</span>
        <div className="tags">{teller.methods.slice(0, 3).map((m) => <span key={m} className="tag">{m}</span>)}</div>
        <span className="copy">{teller.catchcopy}</span>
        <span className="rating"><Stars value={rating} /> <b>{rating ? rating.toFixed(1) : "-"}</b> <span className="muted">（{reviewCount}件）</span></span>
        {today && <span className="today"><span className="k">本日</span>{today}</span>}
        <div className="price"><span className="muted">1分</span><span><b>{teller.pricePerMin}</b>円</span><span className="go">鑑定する</span></div>
      </div>
    </Link>
  );
}
