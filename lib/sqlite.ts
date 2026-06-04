import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const runtimeDir = path.join(process.cwd(), "data", "runtime");
const databasePath = path.join(runtimeDir, "gaodao.sqlite");
const sqliteBin = "/usr/bin/sqlite3";

let initialized = false;

function sqlValue(value: unknown) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? `${value}` : "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sql(values: unknown[]) {
  return values.map(sqlValue).join(", ");
}

export async function runSql(statement: string) {
  await ensureSqliteDatabase();
  await execFileAsync(sqliteBin, [databasePath, statement], { maxBuffer: 1024 * 1024 * 8 });
}

export async function querySql<T>(statement: string): Promise<T[]> {
  await ensureSqliteDatabase();
  const { stdout } = await execFileAsync(sqliteBin, ["-json", databasePath, statement], { maxBuffer: 1024 * 1024 * 32 });
  const output = stdout.trim();
  return output ? JSON.parse(output) as T[] : [];
}

export async function ensureSqliteDatabase() {
  if (initialized) return;
  await mkdir(runtimeDir, { recursive: true });
  const schema = await readFile(path.join(process.cwd(), "data", "schema.sql"), "utf8");
  await execFileAsync(sqliteBin, [databasePath, schema], { maxBuffer: 1024 * 1024 * 8 });
  await execFileAsync(sqliteBin, [
    databasePath,
    "ALTER TABLE divination_records ADD COLUMN question TEXT NOT NULL DEFAULT '';",
  ], { maxBuffer: 1024 * 1024 * 8 }).catch(() => undefined);
  await execFileAsync(sqliteBin, [
    databasePath,
    "ALTER TABLE divination_records ADD COLUMN guidance_json TEXT;",
  ], { maxBuffer: 1024 * 1024 * 8 }).catch(() => undefined);
  await execFileAsync(sqliteBin, [
    databasePath,
    "ALTER TABLE divination_records ADD COLUMN review_json TEXT;",
  ], { maxBuffer: 1024 * 1024 * 8 }).catch(() => undefined);
  await execFileAsync(sqliteBin, [
    databasePath,
    `CREATE TABLE IF NOT EXISTS learning_progress (
      user_id TEXT PRIMARY KEY,
      completed_lesson_ids TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  ], { maxBuffer: 1024 * 1024 * 8 }).catch(() => undefined);
  await execFileAsync(sqliteBin, [
    databasePath,
    `CREATE TABLE IF NOT EXISTS goal_plans (
      user_id TEXT PRIMARY KEY,
      goal_text TEXT NOT NULL,
      framework_id TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      actions_json TEXT NOT NULL,
      notes_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`,
  ], { maxBuffer: 1024 * 1024 * 8 }).catch(() => undefined);

  initialized = true;
  await migrateJsonIfNeeded();
}

async function migrateJsonIfNeeded() {
  const users = await querySql<{ count: number }>("SELECT COUNT(*) AS count FROM users;");
  const records = await querySql<{ count: number }>("SELECT COUNT(*) AS count FROM divination_records;");

  if ((users[0]?.count ?? 0) === 0) {
    const legacyUsersPath = path.join(runtimeDir, "users.json");
    if (existsSync(legacyUsersPath)) {
      const payload = JSON.parse(await readFile(legacyUsersPath, "utf8")) as { users?: unknown[] };
      for (const item of payload.users ?? []) {
        const user = item as {
          id: string;
          name: string;
          email: string;
          role?: string;
          passwordHash: string;
          passwordSalt: string;
          profile: { gender: string; age: number; province: string; city: string; district: string; industry: string };
          createdAt: string;
        };
        await runSql(`
INSERT OR IGNORE INTO users (
  id, name, email, role, password_hash, password_salt, gender, age, province, city, district, industry, created_at
) VALUES (${sql([
          user.id,
          user.name,
          user.email,
          user.role ?? "user",
          user.passwordHash,
          user.passwordSalt,
          user.profile.gender,
          user.profile.age,
          user.profile.province,
          user.profile.city,
          user.profile.district,
          user.profile.industry,
          user.createdAt,
        ])});
`);
      }
    }
  }

  if ((records[0]?.count ?? 0) === 0) {
    const legacyRecordsPath = path.join(runtimeDir, "divination-records.json");
    if (existsSync(legacyRecordsPath)) {
      const payload = JSON.parse(await readFile(legacyRecordsPath, "utf8")) as { records?: unknown[] };
      for (const item of payload.records ?? []) {
        const record = item as {
          id: string;
          userId: string;
          question?: string;
          topic: string;
          result: unknown;
          modelPrompt: string;
          analysis?: unknown;
          savedAt: string;
        };
        await runSql(`
INSERT OR IGNORE INTO divination_records (
  id, user_id, question, topic, result_json, model_prompt, analysis_json, saved_at
) VALUES (${sql([
          record.id,
          record.userId,
          record.question ?? "",
          record.topic,
          JSON.stringify(record.result),
          record.modelPrompt,
          record.analysis ? JSON.stringify(record.analysis) : null,
          record.savedAt,
        ])});
`);
      }
    }
  }
}
