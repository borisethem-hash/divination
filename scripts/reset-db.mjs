// デモデータを初期状態に戻す（次回アクセス時にシードから再生成されます）
import fs from "fs";

fs.rmSync("data/db.json", { force: true });
fs.rmSync("data/uploads", { recursive: true, force: true });
console.log("Database and uploads reset. Demo data will be regenerated on the next request.");
