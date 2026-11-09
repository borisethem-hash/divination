import PageHead from "@/components/PageHead";

export const metadata = { title: "プライバシーポリシー" };

export default function PrivacyPage() {
  return (
    <>
      <PageHead title="プライバシーポリシー" en="Privacy Policy" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        <h3>1. 取得する情報</h3><p>氏名（ニックネーム）、メールアドレス、ポイント購入履歴、鑑定予約・利用履歴、お問い合わせ内容を取得します。通話の音声は録音・保存しません。</p>
        <h3>2. 利用目的</h3><p>本サービスの提供、予約・鑑定に関するご連絡、本人確認、不正利用の防止、サービス改善のために利用します。</p>
        <h3>3. 第三者提供</h3><p>法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供しません。占い師には鑑定に必要な範囲（ニックネーム・ご相談内容）のみを共有します。</p>
        <h3>4. Cookieの利用</h3><p>ログイン状態の維持、および紹介リンク経由の登録を計測するためにCookieを利用します。</p>
        <h3>5. お問い合わせ</h3><p>個人情報の開示・訂正・削除のご請求はお問い合わせフォームよりご連絡ください。</p>
        <p className="small muted">※本ページはテンプレートです。公開前に正式な内容へ差し替えてください。</p>
      </div>
    </>
  );
}
