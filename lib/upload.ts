import fs from "fs";
import path from "path";
import crypto from "crypto";

export const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");
const TYPES: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };

/** 画像を保存して公開URLを返す。ファイル未選択なら undefined */
export async function saveImage(file: FormDataEntryValue | null): Promise<string | undefined> {
  if (!file || typeof file === "string" || file.size === 0) return undefined;
  const ext = TYPES[file.type];
  if (!ext) throw new Error("画像はJPEG / PNG / WebP / GIF形式でアップロードしてください");
  if (file.size > 5 * 1024 * 1024) throw new Error("画像サイズは5MB以下にしてください");
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = crypto.randomBytes(10).toString("hex") + ext;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}
