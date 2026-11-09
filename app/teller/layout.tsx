import DashLayout from "@/components/DashLayout";
import { requireTeller } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function TellerLayout({ children }: { children: React.ReactNode }) {
  const { teller } = await requireTeller();
  const pending = readDb().reservations.filter((r) => r.tellerId === teller.id && r.status === "requested").length;
  return (
    <DashLayout title="占い師ページ" who={`${teller.name} 先生`} links={[
      { href: "/teller", label: "ステータス・リクエスト", badge: pending },
      { href: "/teller/schedule", label: "待機スケジュール" },
      { href: "/teller/history", label: "鑑定履歴・売上" },
      { href: "/teller/affiliate", label: "アフィリエイト" },
      { href: "/teller/profile", label: "プロフィール編集" },
      { href: `/tellers/${teller.id}`, label: "公開ページを見る" },
    ]}>
      {children}
    </DashLayout>
  );
}
