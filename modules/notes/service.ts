import { db, newId, nowIso } from "@/lib/db";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function createNote(userId: string, input: { title: string; content?: string }): Note {
  if (!input.title?.trim()) throw new Error("Title is required");
  const id = newId();
  const now = nowIso();
  db.prepare("INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id, userId, input.title.trim(), input.content ?? "", now, now
  );
  return getNote(userId, id)!;
}

export function getNote(userId: string, id: string): Note | null {
  return (db.prepare("SELECT * FROM notes WHERE user_id = ? AND id = ?").get(userId, id) as any) ?? null;
}

export function listNotes(userId: string, query?: string): Note[] {
  if (query?.trim()) {
    const q = `%${query.trim()}%`;
    return db.prepare(
      "SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) ORDER BY updated_at DESC"
    ).all(userId, q, q) as unknown as Note[];
  }
  return db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC").all(userId) as unknown as Note[];
}

export function updateNote(userId: string, id: string, input: { title?: string; content?: string }): Note | null {
  const existing = getNote(userId, id);
  if (!existing) return null;
  const title = input.title?.trim() ?? existing.title;
  if (!title) throw new Error("Title is required");
  const content = input.content ?? existing.content;
  db.prepare("UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE user_id = ? AND id = ?").run(
    title, content, nowIso(), userId, id
  );
  return getNote(userId, id);
}

export function deleteNote(userId: string, id: string): boolean {
  return db.prepare("DELETE FROM notes WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}
