import { cache } from "react";
import type { DB } from "./types";
import { createSeed, defaultBanners } from "./seed";
import { housekeeping } from "./logic";
import { readDoc, writeDoc, storageMode } from "./storage";

export { uid, nowIso } from "./util";
export { storageMode } from "./storage";

/**
 * データアクセス。保存先（Upstash Redis／ローカルファイル／一時フォルダ）は lib/storage.ts が自動で選びます。
 * 本番で PostgreSQL 等に移行する場合も、アクセスはすべて readDb / updateDb を経由させています。
 */
const HOUSEKEEPING_INTERVAL_MS = 10_000;
let lastHousekeeping = 0;
/** Redis 利用時のインスタンス内キャッシュ（バージョンが変わらない限り本体を再取得しない） */
let memo: { ver: string; json: string } | null = null;

function parse(json: string): DB {
  const db = JSON.parse(json) as DB;
  if (!Array.isArray(db.banners)) db.banners = defaultBanners(); // 旧バージョンのデータを補完
  return db;
}

const serialize = (db: DB) => (storageMode() === "redis" ? JSON.stringify(db) : JSON.stringify(db, null, 2));

async function load(): Promise<{ ver: string; db: DB }> {
  for (let i = 0; i < 5; i++) {
    const doc = await readDoc(memo?.ver);
    if (doc === "unchanged" && memo) return { ver: memo.ver, db: parse(memo.json) };
    if (doc && doc !== "unchanged") {
      if (storageMode() === "redis") memo = doc;
      return { ver: doc.ver, db: parse(doc.json) };
    }
    // 初回アクセス：デモデータを作成（同時に作成された場合は先に保存された方を使う）
    const json = serialize(createSeed());
    const ver = await writeDoc("", json);
    if (ver) {
      if (storageMode() === "redis") memo = { ver, json };
      return { ver, db: parse(json) };
    }
  }
  throw new Error("データの初期化に失敗しました");
}

/** 読み込み時のバージョンのまま保存できたら true（他で更新済みなら false） */
async function commit(ver: string, db: DB): Promise<boolean> {
  const json = serialize(db);
  const next = await writeDoc(ver, json);
  if (next === null) {
    memo = null;
    return false;
  }
  if (storageMode() === "redis") memo = { ver: next, json };
  return true;
}

/** データを読む。1回の画面描画の中では結果を共有します（React cache）。 */
export const readDb = cache(async (): Promise<DB> => {
  const { ver, db } = await load();
  // 期限切れリクエストの失効・放置された通話の精算・スケジュール連動ステータスを定期的に反映
  const now = Date.now();
  if (now - lastHousekeeping > HOUSEKEEPING_INTERVAL_MS) {
    lastHousekeeping = now;
    if (housekeeping(db)) await commit(ver, db).catch(() => false); // 競合した場合は次回に再実行
  }
  return db;
});

/**
 * データを更新する。他のリクエストと同時に更新が重なった場合は、最新データを読み直して fn をやり直します。
 * fn はデータの変更だけを行い、外部への副作用を持たないようにしてください。
 */
export async function updateDb<T>(fn: (db: DB) => T): Promise<T> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const { ver, db } = await load();
    const result = fn(db);
    if (await commit(ver, db)) return result;
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error("アクセスが集中しています。少し時間をおいてから、もう一度お試しください。");
}
