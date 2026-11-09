import Link from "next/link";
import { readDb } from "@/lib/db";

export default function Footer() {
  const { settings } = readDb();
  return (
    <footer className="footer">
      <div className="container cols">
        <div>
          <h4>{settings.siteName}</h4>
          <p>アプリ不要・通話料0円のブラウザ通話で、対面鑑定の実績を持つ占い師に相談できる電話占いサービスです。</p>
        </div>
        <div>
          <h4>占う</h4>
          <ul>
            <li><Link href="/tellers">占い師一覧</Link></li>
            <li><Link href="/tellers?status=waiting">今すぐ占える占い師</Link></li>
            <li><Link href="/news">お知らせ・イベント</Link></li>
          </ul>
        </div>
        <div>
          <h4>ご案内</h4>
          <ul>
            <li><Link href="/guide">ご利用方法・料金</Link></li>
            <li><Link href="/faq">よくある質問</Link></li>
            <li><Link href="/recruit">占い師募集・アフィリエイト</Link></li>
          </ul>
        </div>
        <div>
          <h4>運営</h4>
          <ul>
            <li><Link href="/contact">お問い合わせ</Link></li>
            <li><Link href="/terms">利用規約</Link></li>
            <li><Link href="/privacy">プライバシーポリシー</Link></li>
            <li><Link href="/law">特定商取引法に基づく表記</Link></li>
          </ul>
        </div>
      </div>
      <div className="copy">© {new Date().getFullYear()} {settings.siteName}. 当サービスの鑑定は娯楽・参考情報としてご利用ください。</div>
    </footer>
  );
}
