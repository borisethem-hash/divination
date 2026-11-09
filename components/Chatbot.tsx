"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Portrait } from "./Art";

type Choice = { label: string; go?: string; href?: string };
type Msg = { from: "bot" | "me"; text: string; choices?: Choice[] };

const INQUIRY: Choice = { label: "✉ お問い合わせする", go: "inquiry" };
const FORM: Choice = { label: "お問い合わせフォームを開く", href: "/contact" };
const MENU: Choice = { label: "メニューに戻る", go: "menu" };

const NODES: Record<string, { text: string; choices: Choice[] }> = {
  menu: {
    text: "どのようなことでお困りですか？\n下のボタンからお選びいただくか、自由にご質問を入力してください。",
    choices: [
      { label: "はじめての方へ", go: "first" },
      { label: "料金・ポイント", go: "price" },
      { label: "予約のしかた", go: "reserve" },
      { label: "通話がつながらない", go: "trouble" },
      { label: "占い師として働きたい", go: "recruit" },
      INQUIRY,
    ],
  },
  first: {
    text: "月あかりは、アプリのインストール不要で、ブラウザから通話できる電話占いです🌙\n\n① 無料会員登録（1,000pt プレゼント）\n② 占い師を選んで鑑定リクエスト\n③ 占い師が承認したら予約確定\n④ 時間になったらマイページから入室\n\nという流れでご利用いただけます。",
    choices: [{ label: "無料会員登録へ", href: "/register" }, { label: "占い師を探す", href: "/tellers" }, INQUIRY, MENU],
  },
  price: {
    text: "通話料は0円！お支払いは鑑定料のみです。\n鑑定料は占い師ごとに1分120円〜で、ポイント（1pt＝1円）でお支払いいただきます。\n\n・時間指定（20/30/45/60分）：定額で安心\n・従量制：通話を終えるまで1分単位",
    choices: [{ label: "料金の詳細を見る", href: "/guide" }, INQUIRY, MENU],
  },
  reserve: {
    text: "占い師のプロフィールページから「鑑定リクエスト」を送ってください。\n占い師が承認した時点で予約確定となり、メールとマイページでお知らせします。\n\n「待機中」の占い師なら「今すぐ鑑定」もリクエストできます。",
    choices: [{ label: "今すぐ占える占い師", href: "/tellers?status=waiting" }, INQUIRY, MENU],
  },
  trouble: {
    text: "通話がつながらない場合は、以下をご確認ください。\n\n・ブラウザのマイク使用を「許可」にしている\n・Chrome / Safari の最新版を利用している\n・電波の良い場所、またはWi-Fiで接続している\n\n解決しない場合はお問い合わせください。すぐにサポートいたします。",
    choices: [INQUIRY, FORM, MENU],
  },
  recruit: {
    text: "占い師さんのご応募、大歓迎です✨\nご自身のSNSやブログから紹介したお客様の鑑定に応じて、アフィリエイト報酬もお支払いしています。",
    choices: [{ label: "募集要項を見る", href: "/recruit" }, INQUIRY, MENU],
  },
};

const KEYWORDS: [RegExp, string][] = [
  [/料金|値段|いくら|ポイント|pt|支払|課金/, "price"],
  [/予約|リクエスト|承認|今すぐ/, "reserve"],
  [/繋が|つなが|聞こえ|マイク|通話|音/, "trouble"],
  [/占い師.*(なりたい|応募|働)|募集|在籍|アフィリ/, "recruit"],
  [/初めて|はじめて|使い方|登録/, "first"],
];

function Avatar({ url, name }: { url?: string; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt={`案内係${name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Portrait variant={8} title={`案内係${name}`} />;
}

export default function Chatbot({ name = "さくら", avatarUrl }: { name?: string; avatarUrl?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [form, setForm] = useState<{ step: "name" | "email" | "body" | null; name: string; email: string }>({ step: null, name: "", email: "" });
  const [teaser, setTeaser] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setTeaser(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { bodyRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [msgs]);

  if (pathname?.startsWith("/call")) return null;

  const bot = (text: string, choices?: Choice[]) => setMsgs((m) => [...m, { from: "bot", text, choices }]);
  const goNode = (key: string) => {
    if (key === "inquiry") return startInquiry();
    const n = NODES[key];
    bot(n.text, n.choices);
  };
  const startInquiry = () => {
    setForm({ step: "name", name: "", email: "" });
    bot("お問い合わせを承ります。\nまず、お名前を入力してください。", [FORM]);
  };
  const openPanel = () => {
    setOpen(true);
    if (msgs.length === 0) {
      setMsgs([{ from: "bot", text: `こんにちは！案内係の${name}です🌸\nご利用について、なんでもお気軽にご相談ください。` }]);
      setTimeout(() => goNode("menu"), 400);
    }
  };
  const choose = (c: Choice) => {
    setMsgs((m) => [...m, { from: "me", text: c.label }]);
    if (c.href) { router.push(c.href); bot("ページを開きました。ほかにご不明点があればお声がけください。", [INQUIRY, MENU]); return; }
    if (c.go) setTimeout(() => goNode(c.go!), 300);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { from: "me", text }]);
    if (form.step === "name") { setForm({ ...form, step: "email", name: text }); setTimeout(() => bot(`${text}様、ありがとうございます。\nご返信先のメールアドレスを入力してください。`), 300); return; }
    if (form.step === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) { setTimeout(() => bot("メールアドレスの形式が正しくないようです。もう一度入力してください。"), 300); return; }
      setForm({ ...form, step: "body", email: text });
      setTimeout(() => bot("お問い合わせ内容を入力してください。"), 300);
      return;
    }
    if (form.step === "body") {
      const res = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, email: form.email, body: text, category: "チャットボット", source: "chatbot" }) });
      setForm({ step: null, name: "", email: "" });
      if (res.ok) bot("お問い合わせを受け付けました！\n担当者より通常1営業日以内にメールでご連絡いたします。", [MENU]);
      else bot("送信に失敗しました。お手数ですがお問い合わせフォームからご連絡ください。", [FORM]);
      return;
    }
    const hit = KEYWORDS.find(([re]) => re.test(text));
    setTimeout(() => {
      if (hit) goNode(hit[1]);
      else bot("ご質問ありがとうございます。\nその内容は担当者から詳しくご案内いたしますので、お問い合わせをお願いいたします。", [INQUIRY, FORM, MENU]);
    }, 400);
  };

  if (!open) {
    return (
      <button className="cb-launch" onClick={openPanel} aria-label="チャットで質問する">
        {teaser && <span className="bubble">ご質問・お問い合わせはこちら</span>}
        <span className="face"><Avatar url={avatarUrl} name={name} /></span>
      </button>
    );
  }

  return (
    <div className="cb-panel" role="dialog" aria-label="チャットサポート">
      <div className="cb-head">
        <span className="face"><Avatar url={avatarUrl} name={name} /></span>
        <span><b>案内係 {name}</b><small>チャットサポート（自動応答）</small></span>
        <button onClick={() => setOpen(false)} aria-label="閉じる">×</button>
      </div>
      <div className="cb-body" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={`cb-msg ${m.from === "me" ? "me" : ""}`}>
              {m.from === "bot" && <span className="mini"><Avatar url={avatarUrl} name={name} /></span>}
              <div className="txt">{m.text}</div>
            </div>
            {m.choices && i === msgs.length - 1 && (
              <div className="cb-choices mt-1">{m.choices.map((c) => <button key={c.label} onClick={() => choose(c)}>{c.label}</button>)}</div>
            )}
          </div>
        ))}
      </div>
      <form className="cb-input" onSubmit={submit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={form.step === "name" ? "お名前" : form.step === "email" ? "メールアドレス" : form.step === "body" ? "お問い合わせ内容" : "メッセージを入力"} />
        <button type="submit">送信</button>
      </form>
    </div>
  );
}
