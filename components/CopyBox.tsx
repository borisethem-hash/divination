"use client";
import { useState } from "react";

export default function CopyBox({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard不可の環境 */ }
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="flex" style={{ flexWrap: "nowrap", gap: 0 }}>
        {multiline ? <textarea className="input" readOnly value={value} style={{ minHeight: 80, fontFamily: "monospace", fontSize: 12 }} /> : <input className="input" readOnly value={value} />}
        <button type="button" className="btn" onClick={copy} style={{ alignSelf: "stretch" }}>{copied ? "コピー済" : "コピー"}</button>
      </div>
    </div>
  );
}
