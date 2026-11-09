"use client";
import { useRef, useState } from "react";
import { shrinkImage } from "@/lib/shrink-image";

/** WordPress感覚で使える簡易エディタ：ツールバー＋本文中への画像アップロード */
export default function PostEditor({ defaultValue }: { defaultValue: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);

  const insert = (before: string, after = "", placeholder = "") => {
    const el = ref.current!;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = s + before.length; el.selectionEnd = s + before.length + sel.length; });
  };

  const upload = async (file: File) => {
    setUploading(true);
    const fd = new FormData(); fd.append("file", await shrinkImage(file));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) insert(`\n\n![画像](${j.url})\n\n`); else alert(j.error ?? "アップロードに失敗しました");
  };

  return (
    <div className="field">
      <label>本文</label>
      <div className="flex" style={{ gap: 4, border: "1px solid var(--line-2)", borderBottom: 0, padding: 6, background: "var(--bg-soft)" }}>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => insert("\n\n## ", "\n\n", "見出し")}>見出し</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => insert("**", "**", "太字")}><b>B</b></button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => insert("[", "](https://)", "リンク文字")}>リンク</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => insert("\n\n- ", "\n", "箇条書き")}>箇条書き</button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => insert("\n\n1. ", "\n", "番号付き")}>番号リスト</button>
        <label className="btn btn-sm btn-ghost" style={{ margin: 0 }}>{uploading ? "アップロード中…" : "画像を挿入"}<input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      </div>
      <textarea ref={ref} className="input" name="body" value={value} onChange={(e) => setValue(e.target.value)} style={{ minHeight: 320, fontFamily: "inherit" }} />
      <p className="small muted mb-0 mt-1">空行で段落が分かれます。「## 」で見出し、「**文字**」で太字、「- 」で箇条書きになります。</p>
    </div>
  );
}
