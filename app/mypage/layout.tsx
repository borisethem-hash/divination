import DashLayout from "@/components/DashLayout";
import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function MyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("user", "/mypage");
  const unread = (await readDb()).notifications.filter((n) => n.userId === user.id && !n.read).length;
  return (
    <DashLayout title="マイページ" who={`${user.name} 様`} links={[
      { href: "/mypage", label: "ホーム・予約状況", badge: unread },
      { href: "/mypage/history", label: "鑑定履歴・口コミ" },
      { href: "/mypage/points", label: "ポイント購入・明細" },
      { href: "/tellers", label: "占い師を探す" },
    ]}>
      {children}
    </DashLayout>
  );
}
