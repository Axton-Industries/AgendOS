import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

mkdirSync(path.join(process.cwd(), "data"), { recursive: true });

export const db = new DatabaseSync(path.join(process.cwd(), "data", "lifeos.db"));

db.exec("PRAGMA busy_timeout = 5000");

// Schema setup can race between Next.js build workers / multiple processes — retry on lock.
for (let attempt = 1; ; attempt++) {
  try {
    db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    location_name TEXT,
    lat REAL,
    lon REAL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    start TEXT NOT NULL,
    end TEXT NOT NULL,
    category TEXT DEFAULT 'default',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('income','expense')),
    amount_cents INTEGER NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_user_start ON events(user_id, start);
  CREATE INDEX IF NOT EXISTS idx_tx_user_date ON transactions(user_id, date);
  CREATE INDEX IF NOT EXISTS idx_ai_user ON ai_messages(user_id, created_at);
`);
    break;
  } catch (e: any) {
    if (attempt >= 20 || e?.code !== "ERR_SQLITE_ERROR" || !["SQLITE_BUSY", "SQLITE_LOCKED"].includes(e?.errcode)) {
      throw e;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
}

export function newId() {
  return crypto.randomUUID();
}

export function nowIso() {
  return new Date().toISOString();
}
