import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await readDb();
  return {
    title: { default: `${settings.siteName}｜アプリ不要・通話料0円の電話占い`, template: `%s｜${settings.siteName}` },
    description: settings.heroText,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await readDb();
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Sans+JP:wght@400;600;700&family=Noto+Serif+JP:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Chatbot name={settings.chatbotName} avatarUrl={settings.chatbotAvatar} />
      </body>
    </html>
  );
}
