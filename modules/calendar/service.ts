import { db, newId, nowIso } from "@/lib/db";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string; // "YYYY-MM-DD HH:mm" local
  end: string;
  category: string;
}

export function listEvents(userId: string, from?: string, to?: string): CalendarEvent[] {
  let sql = "SELECT * FROM events WHERE user_id = ?";
  const params: any[] = [userId];
  if (from) { sql += " AND start >= ?"; params.push(from); }
  if (to) { sql += " AND start < ?"; params.push(to); }
  sql += " ORDER BY start";
  return db.prepare(sql).all(...params) as unknown as CalendarEvent[];
}

export function getEvent(userId: string, id: string): CalendarEvent | null {
  return (db.prepare("SELECT * FROM events WHERE user_id = ? AND id = ?").get(userId, id) as any) ?? null;
}

export interface EventInput {
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  category?: string;
}

export function createEvent(userId: string, input: EventInput): CalendarEvent {
  validate(input);
  const id = newId();
  db.prepare(
    `INSERT INTO events (id, user_id, title, description, location, start, end, category, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, userId, input.title, input.description ?? "", input.location ?? "",
    input.start, input.end, input.category ?? "default", nowIso());
  return getEvent(userId, id)!;
}

export function updateEvent(userId: string, id: string, input: Partial<EventInput>): CalendarEvent | null {
  const existing = getEvent(userId, id);
  if (!existing) return null;
  const merged = { ...existing, ...input } as EventInput;
  validate(merged);
  db.prepare(
    `UPDATE events SET title = ?, description = ?, location = ?, start = ?, end = ?, category = ?
     WHERE user_id = ? AND id = ?`
  ).run(merged.title, merged.description ?? "", merged.location ?? "",
    merged.start, merged.end, merged.category ?? "default", userId, id);
  return getEvent(userId, id);
}

export function deleteEvent(userId: string, id: string): boolean {
  const r = db.prepare("DELETE FROM events WHERE user_id = ? AND id = ?").run(userId, id);
  return r.changes > 0;
}

const DT_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

function validate(e: EventInput) {
  if (!e.title?.trim()) throw new Error("Title is required");
  if (!DT_RE.test(e.start) || !DT_RE.test(e.end)) throw new Error("Dates must be in YYYY-MM-DD HH:mm format");
  if (e.end < e.start) throw new Error("End time must be after start time");
}
