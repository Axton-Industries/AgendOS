import { db, newId, nowIso } from "@/lib/db";
import { listEvents } from "@/modules/calendar/service";
import { todayStr, addDays, timeOf } from "@/lib/dates";

export interface Reminder {
  id: string;
  text: string;
  due: string; // YYYY-MM-DD
  done: number;
}

export function createReminder(userId: string, input: { text: string; due?: string }): Reminder {
  if (!input.text?.trim()) throw new Error("Text is required");
  const due = input.due ?? todayStr();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) throw new Error("Due date must be YYYY-MM-DD");
  const id = newId();
  db.prepare("INSERT INTO reminders (id, user_id, text, due, created_at) VALUES (?, ?, ?, ?, ?)").run(
    id, userId, input.text.trim(), due, nowIso()
  );
  return getReminder(userId, id)!;
}

export function getReminder(userId: string, id: string): Reminder | null {
  return (db.prepare("SELECT id, text, due, done FROM reminders WHERE user_id = ? AND id = ?").get(userId, id) as any) ?? null;
}

export function listReminders(userId: string, includeDone = false): Reminder[] {
  const sql = includeDone
    ? "SELECT id, text, due, done FROM reminders WHERE user_id = ? ORDER BY due, created_at DESC"
    : "SELECT id, text, due, done FROM reminders WHERE user_id = ? AND done = 0 ORDER BY due, created_at DESC";
  return db.prepare(sql).all(userId) as unknown as Reminder[];
}

export function completeReminder(userId: string, id: string): boolean {
  return db.prepare("UPDATE reminders SET done = 1 WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}

export function deleteReminder(userId: string, id: string): boolean {
  return db.prepare("DELETE FROM reminders WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}

export interface Notification {
  kind: "event" | "reminder";
  text: string;
  detail: string;
}

/** Notifications = today's calendar events + due/overdue reminders. Derived, nothing stored. */
export function getNotifications(userId: string, lang: "en" | "es" = "en"): Notification[] {
  const today = todayStr();
  const notifications: Notification[] = [];

  const todayEvents = listEvents(userId, `${today} 00:00`, `${addDays(today, 1)} 00:00`);
  for (const e of todayEvents) {
    if (e.location) {
      notifications.push({ kind: "event", text: `${timeOf(e.start)} · ${e.title}`, detail: e.location });
    } else {
      notifications.push({ kind: "event", text: `${timeOf(e.start)} · ${e.title}`, detail: lang === "es" ? "Evento hoy" : "Event today" });
    }
  }

  const reminders = listReminders(userId);
  for (const r of reminders) {
    if (r.due <= today) {
      notifications.push({
        kind: "reminder",
        text: r.text,
        detail: r.due < today
          ? lang === "es" ? `Atrasado — debía hacerse el ${r.due}` : `Overdue — was due ${r.due}`
          : lang === "es" ? "Vence hoy" : "Due today",
      });
    }
  }
  return notifications;
}
