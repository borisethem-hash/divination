import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container section center">
      <h1>ページが見つかりません</h1>
      <p className="muted">お探しのページは移動または削除された可能性があります。</p>
      <Link href="/" className="btn">トップへ戻る</Link>
    </div>
  );
}
