import PageHead from "@/components/PageHead";
import ContactForm from "@/components/ContactForm";
import { Portrait } from "@/components/Art";
import { readDb } from "@/lib/db";

export const metadata = { title: "お問い合わせ" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const { settings } = readDb();
  return (
    <>
      <PageHead title="お問い合わせ" en="Contact" />
      <div className="container narrow section" style={{ paddingTop: 32 }}>
        <div className="flex mb-3" style={{ flexWrap: "nowrap", alignItems: "center" }}>
          <div style={{ width: 72, height: 86, flex: "none", border: "1px solid var(--line)", overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {settings.chatbotAvatar ? <img src={settings.chatbotAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Portrait variant={8} title={`案内係${settings.chatbotName}`} />}
          </div>
          <p className="mb-0">ご利用方法・お支払い・占い師へのご応募など、お気軽にお問い合わせください。通常1営業日以内にメールでご返信いたします。<br /><span className="small muted">お急ぎの方は画面右下のチャットもご利用いただけます。</span></p>
        </div>
        <ContactForm defaultCategory={category} />
      </div>
    </>
  );
}
