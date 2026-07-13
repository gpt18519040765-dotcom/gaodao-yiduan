import { pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { querySql, runSql, sql } from "@/lib/sqlite";

export type UserProfile = {
  gender: "男" | "女" | "其他";
  age: number;
  province: string;
  city: string;
  district: string;
  industry: string;
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  passwordHash: string;
  passwordSalt: string;
  profile: UserProfile;
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  password_hash: string;
  password_salt: string;
  gender: "男" | "女" | "其他";
  age: number;
  province: string;
  city: string;
  district: string;
  industry: string;
  created_at: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return { hash, salt };
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role ?? "user",
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    profile: {
      gender: row.gender,
      age: row.age,
      province: row.province,
      city: row.city,
      district: row.district,
      industry: row.industry,
    },
    createdAt: row.created_at,
  };
}

export async function readUserDatabase() {
  const rows = await querySql<UserRow>("SELECT * FROM users ORDER BY created_at ASC;");
  return { users: rows.map(rowToUser) };
}

export async function findUserByEmail(email: string) {
  const rows = await querySql<UserRow>(`SELECT * FROM users WHERE email = ${sql([normalizeEmail(email)])} LIMIT 1;`);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export async function findUserById(id: string) {
  const rows = await querySql<UserRow>(`SELECT * FROM users WHERE id = ${sql([id])} LIMIT 1;`);
  return rows[0] ? rowToUser(rows[0]) : undefined;
}

export function verifyPassword(password: string, user: StoredUser) {
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = Buffer.from(hashPassword(password, user.passwordSalt).hash, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  profile: UserProfile;
}) {
  const email = normalizeEmail(input.email);
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("EMAIL_EXISTS");
  }

  const counts = await querySql<{ count: number }>("SELECT COUNT(*) AS count FROM users;");
  const password = hashPassword(input.password);
  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    role: (counts[0]?.count ?? 0) === 0 ? "admin" : "user",
    passwordHash: password.hash,
    passwordSalt: password.salt,
    profile: input.profile,
    createdAt: new Date().toISOString(),
  };

  await runSql(`
INSERT INTO users (
  id, name, email, role, password_hash, password_salt, gender, age, province, city, district, industry, created_at
) VALUES (${sql([
    user.id,
    user.name,
    user.email,
    user.role,
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

  return user;
}

export function publicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? "user",
    profile: user.profile,
    createdAt: user.createdAt,
  };
}
