import Link from "next/link";
import { readDb } from "@/lib/db";
import { MoonMark } from "./Art";

export default function Footer() {
  const { settings } = readDb();
  return (
    <footer className="footer">
      <div className="container cols">
        <div className="brand">
          <Link href="/" className="logo logo-invert">
            <MoonMark size={34} />
            <span><b>{settings.siteName.replace("電話占い ", "")}</b><small>DENWA URANAI</small></span>
          </Link>
          <p>アプリ不要・通話料0円のブラウザ通話で、対面鑑定の実績を持つ占い師に相談できる電話占いサービスです。</p>
          <Link href="/contact" className="btn btn-sm btn-outline-invert">お問い合わせ</Link>
        </div>
        <div>
          <h4>占う</h4>
          <ul>
            <li><Link href="/tellers">占い師一覧</Link></li>
            <li><Link href="/tellers?status=waiting">今すぐ占える占い師</Link></li>
            <li><Link href="/tellers?sort=popular">人気の占い師</Link></li>
            <li><Link href="/horoscope">今日の星座占い</Link></li>
          </ul>
        </div>
        <div>
          <h4>読みもの</h4>
          <ul>
            <li><Link href="/column">占いコラム</Link></li>
            <li><Link href="/news">お知らせ・イベント</Link></li>
            <li><Link href="/about">月あかりについて</Link></li>
          </ul>
        </div>
        <div>
          <h4>ご案内</h4>
          <ul>
            <li><Link href="/guide">ご利用ガイド・料金</Link></li>
            <li><Link href="/faq">よくある質問</Link></li>
            <li><Link href="/recruit">占い師募集・アフィリエイト</Link></li>
            <li><Link href="/contact">お問い合わせ</Link></li>
          </ul>
        </div>
        <div>
          <h4>規約</h4>
          <ul>
            <li><Link href="/terms">利用規約</Link></li>
            <li><Link href="/privacy">プライバシーポリシー</Link></li>
            <li><Link href="/law">特定商取引法に基づく表記</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-info">
        <div><span className="k">お支払い方法</span>クレジットカード ／ 銀行振込（事前ポイント購入制・1pt＝1円）</div>
        <div><span className="k">推奨環境</span>iPhone Safari ／ Android Chrome ／ PC Chrome・Edge・Safari 最新版</div>
      </div>
      <div className="copy">© {new Date().getFullYear()} {settings.siteName}. 当サービスの鑑定は娯楽・参考情報としてご利用ください。</div>
    </footer>
  );
}
