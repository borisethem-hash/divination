import crypto from "crypto";
import { putUpload } from "./storage";

const TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
/** Vercel のリクエスト上限（4.5MB）に収まるサイズ。ブラウザ側で自動縮小してから送信されます */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** 画像を保存して公開URLを返す。ファイル未選択なら undefined */
export async function saveImage(file: FormDataEntryValue | null): Promise<string | undefined> {
  if (!file || typeof file === "string" || file.size === 0) return undefined;
  const ext = TYPES[file.type];
  if (!ext) throw new Error("画像はJPEG / PNG / WebP / GIF形式でアップロードしてください");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("画像サイズは4MB以下にしてください");
  const name = crypto.randomBytes(10).toString("hex") + ext;
  await putUpload(name, Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}
