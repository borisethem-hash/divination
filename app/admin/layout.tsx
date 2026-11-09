import DashLayout from "@/components/DashLayout";
import { requireRole } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const metadata = { title: "管理画面" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin", "/admin");
  const db = readDb();
  return (
    <DashLayout title="管理画面" who={user.name} links={[
      { href: "/admin", label: "ダッシュボード" },
      { href: "/admin/tellers", label: "占い師管理" },
      { href: "/admin/reservations", label: "予約・鑑定" },
      { href: "/admin/users", label: "ユーザー管理" },
      { href: "/admin/posts", label: "お知らせ・イベント" },
      { href: "/admin/reviews", label: "口コミ管理", badge: db.reviews.filter((r) => r.status === "pending").length },
      { href: "/admin/inquiries", label: "お問い合わせ", badge: db.inquiries.filter((q) => q.status === "new").length },
      { href: "/admin/affiliate", label: "アフィリエイト" },
      { href: "/admin/mails", label: "送信メール履歴" },
      { href: "/admin/settings", label: "サイト設定" },
    ]}>
      {children}
    </DashLayout>
  );
}
