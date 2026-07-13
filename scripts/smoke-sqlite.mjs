import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const execFileAsync = promisify(execFile);
const runtimeDir = path.join(process.cwd(), "data", "runtime");
const databasePath = path.join(runtimeDir, "gaodao.sqlite");
const sqliteBin = "/usr/bin/sqlite3";

function q(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return `${value}`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function run(statement) {
  await execFileAsync(sqliteBin, [databasePath, statement], { maxBuffer: 1024 * 1024 * 8 });
}

async function query(statement) {
  const { stdout } = await execFileAsync(sqliteBin, ["-json", databasePath, statement], { maxBuffer: 1024 * 1024 * 8 });
  return stdout.trim() ? JSON.parse(stdout) : [];
}

await mkdir(runtimeDir, { recursive: true });
await run(await readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8"));
await run("ALTER TABLE divination_records ADD COLUMN question TEXT NOT NULL DEFAULT '';").catch(() => undefined);

const userId = randomUUID();
const recordId = randomUUID();
const email = `sqlite-smoke-${Date.now()}@example.com`;

await run(`
INSERT INTO users (
  id, name, email, role, password_hash, password_salt, gender, age, province, city, district, industry, created_at
) VALUES (
  ${q(userId)}, ${q("SQLite冒烟测试")}, ${q(email)}, ${q("admin")}, ${q("hash")}, ${q("salt")},
  ${q("男")}, 30, ${q("浙江")}, ${q("杭州")}, ${q("西湖")}, ${q("测试")}, ${q(new Date().toISOString())}
);
`);

await run(`
INSERT INTO divination_records (
  id, user_id, question, topic, result_json, model_prompt, analysis_json, saved_at
) VALUES (
  ${q(recordId)}, ${q(userId)}, ${q("测试所问事项")}, ${q("问占")},
  ${q(JSON.stringify({ hexagramName: "乾为天", movingLine: 1, changedHexagramName: "天风姤" }))},
  ${q("测试上下文")},
  ${q(JSON.stringify({ provider: "rule", summary: "测试", risk: "测试", opportunity: "测试", action: "测试", createdAt: new Date().toISOString() }))},
  ${q(new Date().toISOString())}
);
`);

const rows = await query(`
SELECT users.email, divination_records.question, divination_records.topic
FROM users
JOIN divination_records ON divination_records.user_id = users.id
WHERE users.id = ${q(userId)};
`);

await run(`DELETE FROM divination_records WHERE id = ${q(recordId)};`);
await run(`DELETE FROM users WHERE id = ${q(userId)};`);

if (rows.length !== 1 || rows[0].email !== email || rows[0].question !== "测试所问事项" || rows[0].topic !== "问占") {
  console.error("SQLite smoke test failed.");
  process.exit(1);
}

console.log("SQLite smoke test passed.");
