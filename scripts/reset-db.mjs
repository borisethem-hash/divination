// デモデータを初期状態に戻す（次回アクセス時にシードから再生成されます）
// ・ローカル：data/db.json と data/uploads を削除
// ・Upstash Redis の環境変数（.env.local 等でも可）が設定されていれば、Redis 上のデータも削除
import fs from "fs";

for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

fs.rmSync("data/db.json", { force: true });
fs.rmSync("data/uploads", { recursive: true, force: true });
console.log("Local data and uploads reset.");

const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/, "");
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (url && token) {
  const prefix = process.env.STORAGE_PREFIX || "tsukiakari";
  const call = async (cmd) => {
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
    const body = await res.json();
    if (!res.ok || body.error) throw new Error(body.error ?? res.status);
    return body.result;
  };
  let cursor = "0";
  let removed = 0;
  do {
    const [next, keys] = await call(["SCAN", cursor, "MATCH", `${prefix}:*`, "COUNT", 200]);
    if (keys.length) removed += await call(["DEL", ...keys]);
    cursor = String(next);
  } while (cursor !== "0");
  console.log(`Redis data reset (${removed} keys removed).`);
}
console.log("Demo data will be regenerated on the next request.");
