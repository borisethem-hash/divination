"use client";
import { useState } from "react";

const CATEGORIES = ["ご利用方法について", "ポイント・お支払いについて", "通話・接続トラブル", "占い師として登録したい", "取材・提携のご相談", "その他"];

export default function ContactForm({ defaultCategory }: { defaultCategory?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const res = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, source: "form" }) });
    if (res.ok) setState("done");
    else { setState("error"); setMsg((await res.json().catch(() => ({}))).error ?? "送信に失敗しました"); }
  }

  if (state === "done") {
    return <div className="card center"><h3>お問い合わせを受け付けました</h3><p className="mb-0">ご入力のメールアドレス宛に受付メールをお送りしました。担当者より改めてご連絡いたします。</p></div>;
  }
  return (
    <form className="form card" onSubmit={onSubmit}>
      {state === "error" && <div className="alert alert-err">{msg}</div>}
      <div className="field"><label>お問い合わせ種別<span className="req">必須</span></label>
        <select className="input" name="category" defaultValue={CATEGORIES.includes(defaultCategory ?? "") ? defaultCategory : CATEGORIES[0]}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      <div className="field"><label>お名前<span className="req">必須</span></label><input className="input" name="name" required maxLength={60} /></div>
      <div className="field"><label>メールアドレス<span className="req">必須</span></label><input className="input" type="email" name="email" required /></div>
      <div className="field"><label>お問い合わせ内容<span className="req">必須</span></label><textarea className="input" name="body" required maxLength={3000} /></div>
      <button className="btn btn-shu btn-lg" disabled={state === "sending"}>{state === "sending" ? "送信中…" : "送信する"}</button>
    </form>
  );
}
