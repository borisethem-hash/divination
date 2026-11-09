import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { joinState, RES_STATUS_LABEL } from "@/lib/logic";
import CallRoom from "@/components/CallRoom";

export const metadata = { title: "鑑定ルーム" };

export default async function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/call/${id}`);
  const db = readDb();
  const r = db.reservations.find((x) => x.id === id);
  if (!r) notFound();
  const teller = db.tellers.find((t) => t.id === r.tellerId)!;
  const client = db.users.find((u) => u.id === r.userId)!;
  const role = r.userId === user.id ? "user" : teller.userId === user.id ? "teller" : null;
  if (!role) notFound();
  const back = role === "user" ? "/mypage" : "/teller";
  const js = joinState(db, r);

  if (!js.ok) {
    return (
      <div className="container callroom">
        <h1>鑑定ルーム</h1>
        <div className="alert alert-info">{r.status === "approved" ? js.reason : `この予約は「${RES_STATUS_LABEL[r.status]}」のため入室できません。`}</div>
        <Link href={back} className="btn">戻る</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <CallRoom
        reservationId={r.id}
        role={role}
        peerName={role === "user" ? `${teller.name} 先生` : `${client.name} 様`}
        teller={{ name: teller.name, portrait: teller.portrait, imageUrl: teller.imageUrl }}
        type={r.type}
        durationMin={r.durationMin ?? null}
        price={teller.pricePerMin}
        message={role === "teller" ? r.message : ""}
        backHref={back}
        turn={{ url: process.env.NEXT_PUBLIC_TURN_URL ?? "", username: process.env.NEXT_PUBLIC_TURN_USERNAME ?? "", credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL ?? "" }}
      />
    </div>
  );
}
