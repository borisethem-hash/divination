/**
 * データの保存先。環境に応じて自動で切り替わります。
 *
 * - redis : Upstash Redis（REST API）。Vercel など本番環境での推奨。
 *           KV_REST_API_URL / KV_REST_API_TOKEN（Vercel Marketplace の Upstash 連携で自動設定）
 *           または UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN を設定すると有効になります。
 * - file  : プロジェクト内の data/ フォルダ（ローカル開発用）。
 * - tmp   : サーバーレス環境で Redis が未設定の場合の一時保存（OSの一時フォルダ）。
 *           インスタンスの再起動でデモデータに戻るため、確認用途に限られます。
 */
import fs from "fs";
import os from "os";
import path from "path";

export type StorageMode = "redis" | "file" | "tmp";

const REDIS_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const PREFIX = process.env.STORAGE_PREFIX || "tsukiakari";
export const DOC_KEY = `${PREFIX}:db`;
const uploadKey = (name: string) => `${PREFIX}:upload:${name}`;

const SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

let resolvedDir: { dir: string; mode: "file" | "tmp" } | null = null;

/** 書き込み可能なデータフォルダを決める（読み取り専用の環境では一時フォルダへ） */
function dataDir(): { dir: string; mode: "file" | "tmp" } {
  if (resolvedDir) return resolvedDir;
  const tmp = path.join(os.tmpdir(), "tsukiakari");
  const candidates: { dir: string; mode: "file" | "tmp" }[] = process.env.DATA_DIR
    ? [{ dir: process.env.DATA_DIR, mode: "file" }]
    : SERVERLESS
      ? [{ dir: tmp, mode: "tmp" }]
      : [{ dir: path.join(process.cwd(), "data"), mode: "file" }, { dir: tmp, mode: "tmp" }];
  for (const c of candidates) {
    try {
      fs.mkdirSync(c.dir, { recursive: true });
      fs.accessSync(c.dir, fs.constants.W_OK);
      resolvedDir = c;
      return c;
    } catch {
      /* 次の候補へ */
    }
  }
  throw new Error("書き込み可能な保存先が見つかりません。Upstash Redis の環境変数を設定してください。");
}

export function storageMode(): StorageMode {
  if (REDIS_URL && REDIS_TOKEN) return "redis";
  return dataDir().mode;
}

/* ---------------- Upstash Redis（REST） ---------------- */

export async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  let res: Response;
  try {
    res = await fetch(REDIS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch (e) {
    throw new Error(`Redis に接続できません（${(e as Error).message}）`);
  }
  const body = (await res.json().catch(() => null)) as { result?: T; error?: string } | null;
  if (!res.ok || !body || body.error) throw new Error(`Redis エラー: ${body?.error ?? res.status}`);
  return body.result as T;
}

/** バージョンが一致した場合のみ書き込む（楽観的ロック） */
const CAS_SCRIPT = `local cur = redis.call('HGET', KEYS[1], 'ver')
if cur == false then cur = '' end
if cur ~= ARGV[1] then return 0 end
redis.call('HSET', KEYS[1], 'data', ARGV[2], 'ver', ARGV[3])
return 1`;

/* ---------------- データ本体（JSON ドキュメント） ---------------- */

export interface Doc { ver: string; json: string }

const docFile = () => path.join(dataDir().dir, "db.json");

/** 保存済みのドキュメントを読む。まだ無ければ null */
export async function readDoc(knownVer?: string): Promise<Doc | "unchanged" | null> {
  if (storageMode() === "redis") {
    const ver = await redis<string | null>(["HGET", DOC_KEY, "ver"]);
    if (ver === null) return null;
    if (knownVer && ver === knownVer) return "unchanged";
    const [v, json] = await redis<[string | null, string | null]>(["HMGET", DOC_KEY, "ver", "data"]);
    if (v === null || json === null) return null;
    return { ver: v, json };
  }
  const file = docFile();
  if (!fs.existsSync(file)) return null;
  return { ver: "file", json: fs.readFileSync(file, "utf8") };
}

/** expectedVer のままなら保存して新しいバージョンを返す。他で更新済みなら null */
export async function writeDoc(expectedVer: string, json: string): Promise<string | null> {
  if (storageMode() === "redis") {
    const next = String((Number(expectedVer) || 0) + 1);
    const ok = await redis<number>(["EVAL", CAS_SCRIPT, 1, DOC_KEY, expectedVer, json, next]);
    return ok === 1 ? next : null;
  }
  const file = docFile();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, json, "utf8");
  fs.renameSync(tmp, file);
  return "file";
}

/** データ本体を削除（デモデータの初期化用） */
export async function deleteDoc(): Promise<void> {
  if (storageMode() === "redis") { await redis(["DEL", DOC_KEY]); return; }
  fs.rmSync(docFile(), { force: true });
}

/* ---------------- アップロード画像 ---------------- */

const uploadFile = (name: string) => path.join(dataDir().dir, "uploads", name);

export async function putUpload(name: string, data: Buffer): Promise<void> {
  if (storageMode() === "redis") {
    await redis(["SET", uploadKey(name), data.toString("base64")]);
    return;
  }
  fs.mkdirSync(path.dirname(uploadFile(name)), { recursive: true });
  fs.writeFileSync(uploadFile(name), data);
}

export async function getUpload(name: string): Promise<Buffer | null> {
  if (storageMode() === "redis") {
    const b64 = await redis<string | null>(["GET", uploadKey(name)]);
    return b64 === null ? null : Buffer.from(b64, "base64");
  }
  const f = uploadFile(name);
  return fs.existsSync(f) ? fs.readFileSync(f) : null;
}
