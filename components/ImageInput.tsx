"use client";
import { useState } from "react";
import { shrinkImage } from "@/lib/shrink-image";

/** 画像アップロード欄。選択された写真が大きい場合は、送信前にブラウザで自動的に縮小します。 */
export default function ImageInput({ name }: { name: string }) {
  const [note, setNote] = useState("");
  return (
    <>
      <input
        className="input"
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={async (e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          if (!file) return setNote("");
          setNote("画像を最適化しています…");
          const small = await shrinkImage(file);
          if (small !== file) {
            const dt = new DataTransfer();
            dt.items.add(small);
            input.files = dt.files;
          }
          const kb = Math.round(small.size / 1024);
          setNote(small.size > 4 * 1024 * 1024 ? `画像が大きすぎます（${kb.toLocaleString()}KB）。4MB以下の画像を選んでください。` : `送信サイズ：${kb.toLocaleString()}KB${small !== file ? "（自動で縮小しました）" : ""}`);
        }}
      />
      {note && <small className="muted" style={{ display: "block", marginTop: 4 }}>{note}</small>}
    </>
  );
}
