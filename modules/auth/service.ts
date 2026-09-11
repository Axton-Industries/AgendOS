import { db, newId, nowIso } from "@/lib/db";

const LOCAL_USER_ID = "local";

export interface User {
  id: string;
  email: string;
  location_name: string | null;
  lat: number | null;
  lon: number | null;
}

function toUser(row: any): User | null {
  if (!row) return null;
  return { id: row.id, email: row.email, location_name: row.location_name, lat: row.lat, lon: row.lon };
}

/** Returns the single local user, creating it on first call. */
export function getCurrentUser(): User {
  let row = db.prepare("SELECT * FROM users WHERE id = ?").get(LOCAL_USER_ID) as any;
  if (!row) {
    db.prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)").run(
      LOCAL_USER_ID, "local@lifeos", nowIso()
    );
    row = db.prepare("SELECT * FROM users WHERE id = ?").get(LOCAL_USER_ID) as any;
  }
  return toUser(row)!;
}

export function setLocation(userId: string, name: string, lat: number, lon: number) {
  db.prepare("UPDATE users SET location_name = ?, lat = ?, lon = ? WHERE id = ?").run(name, lat, lon, userId);
}
