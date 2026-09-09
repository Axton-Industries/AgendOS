import { db, newId, nowIso } from "@/lib/db";
import { todayStr } from "@/lib/dates";

export interface HealthMetric {
  date: string;
  sleep_hours: number | null;
  steps: number | null;
  weight_kg: number | null;
  resting_hr: number | null;
  note: string;
}

export function upsertMetrics(
  userId: string,
  input: { date?: string; sleepHours?: number | null; steps?: number | null; weightKg?: number | null; restingHr?: number | null; note?: string }
): HealthMetric {
  const date = input.date ?? todayStr();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Date must be YYYY-MM-DD");
  const existing = db.prepare("SELECT id FROM health_metrics WHERE user_id = ? AND date = ?").get(userId, date) as any;
  const id = existing?.id ?? newId();
  db.prepare(
    `INSERT INTO health_metrics (id, user_id, date, sleep_hours, steps, weight_kg, resting_hr, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET
       sleep_hours = COALESCE(?, sleep_hours),
       steps = COALESCE(?, steps),
       weight_kg = COALESCE(?, weight_kg),
       resting_hr = COALESCE(?, resting_hr),
       note = COALESCE(?, note)`
  ).run(
    id, userId, date, input.sleepHours ?? null, input.steps ?? null, input.weightKg ?? null, input.restingHr ?? null, input.note ?? null, nowIso(),
    input.sleepHours ?? null, input.steps ?? null, input.weightKg ?? null, input.restingHr ?? null, input.note ?? null
  );
  return db.prepare("SELECT date, sleep_hours, steps, weight_kg, resting_hr, note FROM health_metrics WHERE user_id = ? AND date = ?").get(userId, date) as any;
}

export function listMetrics(userId: string, limit = 30): HealthMetric[] {
  return db.prepare(
    "SELECT date, sleep_hours, steps, weight_kg, resting_hr, note FROM health_metrics WHERE user_id = ? ORDER BY date DESC LIMIT ?"
  ).all(userId, limit) as unknown as HealthMetric[];
}

/** 7-day averages of the tracked metrics (nulls ignored). */
export function getAverages(userId: string) {
  const row = db.prepare(
    `SELECT AVG(sleep_hours) AS sleep, AVG(steps) AS steps, AVG(weight_kg) AS weight, AVG(resting_hr) AS resting_hr
     FROM (SELECT * FROM health_metrics WHERE user_id = ? ORDER BY date DESC LIMIT 7)`
  ).get(userId) as any;
  return {
    sleep: row.sleep != null ? Math.round(row.sleep * 10) / 10 : null,
    steps: row.steps != null ? Math.round(row.steps) : null,
    weight: row.weight != null ? Math.round(row.weight * 10) / 10 : null,
    resting_hr: row.resting_hr != null ? Math.round(row.resting_hr) : null,
  };
}
