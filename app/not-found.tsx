import Link from "next/link";
import { MoonPhaseIcon } from "@/components/Art";

export default function NotFound() {
  return (
    <div className="container notfound">
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><MoonPhaseIcon age={3} size={96} /></div>
      <div className="code">404</div>
      <h1 style={{ fontSize: 24, marginTop: 12 }}>ページが見つかりません</h1>
      <p className="muted">お探しのページは、月が雲に隠れるように移動または削除された可能性があります。</p>
      <div className="flex" style={{ justifyContent: "center" }}>
        <Link href="/" className="btn">トップへ戻る</Link>
        <Link href="/tellers" className="btn btn-outline">占い師を探す</Link>
      </div>
    </div>
  );
}
