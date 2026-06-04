import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const runtimeDir = path.join(process.cwd(), "data", "runtime");
const databasePath = path.join(runtimeDir, "gaodao.sqlite");
const sqliteBin = "/usr/bin/sqlite3";

await mkdir(runtimeDir, { recursive: true });
const schema = await readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8");
await execFileAsync(sqliteBin, [databasePath, schema], { maxBuffer: 1024 * 1024 * 8 });
await execFileAsync(sqliteBin, [databasePath, "ALTER TABLE divination_records ADD COLUMN question TEXT NOT NULL DEFAULT '';"]).catch(() => undefined);
await execFileAsync(sqliteBin, [databasePath, "ALTER TABLE divination_records ADD COLUMN guidance_json TEXT;"]).catch(() => undefined);
await execFileAsync(sqliteBin, [databasePath, "ALTER TABLE divination_records ADD COLUMN review_json TEXT;"]).catch(() => undefined);

const { stdout } = await execFileAsync(sqliteBin, [
  "-json",
  databasePath,
  `
SELECT name, type FROM sqlite_master
WHERE type IN ('table', 'index')
AND name IN (
  'users',
  'divination_records',
  'idx_divination_records_user_id',
  'idx_divination_records_saved_at',
  'consultation_requests',
  'idx_consultation_requests_user_id',
  'idx_consultation_requests_created_at',
  'learning_progress',
  'goal_plans'
)
ORDER BY name;
`,
]);

const objects = JSON.parse(stdout);
const names = new Set(objects.map((object) => object.name));
const required = [
  "users",
  "divination_records",
  "idx_divination_records_user_id",
  "idx_divination_records_saved_at",
  "consultation_requests",
  "idx_consultation_requests_user_id",
  "idx_consultation_requests_created_at",
  "learning_progress",
  "goal_plans",
];
const missing = required.filter((name) => !names.has(name));

if (missing.length > 0) {
  console.error(`Database validation failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const counts = await execFileAsync(sqliteBin, [
  "-json",
  databasePath,
  "SELECT (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM divination_records) AS records, (SELECT COUNT(*) FROM consultation_requests) AS consultations, (SELECT COUNT(*) FROM learning_progress) AS learningProgress, (SELECT COUNT(*) FROM goal_plans) AS goalPlans;",
]);

const columns = await execFileAsync(sqliteBin, ["-json", databasePath, "PRAGMA table_info(divination_records);"]);
const columnNames = new Set(JSON.parse(columns.stdout).map((column) => column.name));
for (const column of ["question", "guidance_json", "review_json"]) {
  if (columnNames.has(column)) continue;
  console.error(`Database validation failed. Missing divination_records.${column} column.`);
  process.exit(1);
}

console.log("SQLite database validation passed.");
console.log(counts.stdout.trim());
