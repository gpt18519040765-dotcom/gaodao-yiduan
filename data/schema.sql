PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  industry TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS divination_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  question TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL,
  result_json TEXT NOT NULL,
  model_prompt TEXT NOT NULL,
  analysis_json TEXT,
  guidance_json TEXT,
  review_json TEXT,
  saved_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_divination_records_user_id ON divination_records(user_id);
CREATE INDEX IF NOT EXISTS idx_divination_records_saved_at ON divination_records(saved_at);

CREATE TABLE IF NOT EXISTS consultation_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  issue TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_user_id ON consultation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at);

CREATE TABLE IF NOT EXISTS learning_progress (
  user_id TEXT PRIMARY KEY,
  completed_lesson_ids TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goal_plans (
  user_id TEXT PRIMARY KEY,
  goal_text TEXT NOT NULL,
  framework_id TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  actions_json TEXT NOT NULL,
  notes_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
