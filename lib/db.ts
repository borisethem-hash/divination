import fs from "fs";
import path from "path";
import type { DB } from "./types";
import { createSeed } from "./seed";
import { housekeeping } from "./logic";

export { uid, nowIso } from "./util";

/**
 * シンプルなJSONファイルストア。
 * 開発・デモ用途向け。本番ではPostgreSQL等に置き換えることを想定し、
 * アクセスはすべて readDb / updateDb を経由させています。
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const HOUSEKEEPING_INTERVAL_MS = 10_000;
let lastHousekeeping = 0;

function ensure(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(createSeed(), null, 2), "utf8");
  }
}

function writeDb(db: DB): void {
  const tmp = DB_FILE + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, DB_FILE);
}

export function readDb(): DB {
  ensure();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
  // 期限切れリクエストの失効・放置された通話の精算・スケジュール連動ステータスを定期的に反映
  const now = Date.now();
  if (now - lastHousekeeping > HOUSEKEEPING_INTERVAL_MS) {
    lastHousekeeping = now;
    if (housekeeping(db)) writeDb(db);
  }
  return db;
}

export function updateDb<T>(fn: (db: DB) => T): T {
  const db = readDb();
  const result = fn(db);
  writeDb(db);
  return result;
}
