import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, newId, nowIso } from "@/lib/db";

export const SESSION_COOKIE = "lifeos_session";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const SESSION_DAYS = 30;

export interface User {
  id: string;
  email: string;
  location_name: string | null;
  lat: number | null;
  lon: number | null;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

export function register(email: string, password: string): User {
  email = email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Invalid email");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) throw new Error("Email already registered");
  const id = newId();
  db.prepare("INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)").run(
    id, email, hashPassword(password), nowIso()
  );
  return { id, email, location_name: null, lat: null, lon: null };
}

export function login(email: string, password: string): string {
  email = email.trim().toLowerCase();
  const row = db.prepare("SELECT id, password_hash FROM users WHERE email = ?").get(email) as any;
  if (!row || !verifyPassword(password, row.password_hash)) throw new Error("Invalid email or password");
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString();
  db.prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, row.id, expires);
  return token;
}

export function logout(token: string) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

function toUser(row: any): User | null {
  if (!row) return null;
  return { id: row.id, email: row.email, location_name: row.location_name, lat: row.lat, lon: row.lon };
}

/** For server components. Returns null if not logged in. */
export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getUserByToken(token);
}

export function getUserByToken(token?: string): User | null {
  if (!token) return null;
  const row = db.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.expires_at > ?`
  ).get(token, nowIso()) as any;
  return toUser(row);
}

export function setLocation(userId: string, name: string, lat: number, lon: number) {
  db.prepare("UPDATE users SET location_name = ?, lat = ?, lon = ? WHERE id = ?").run(name, lat, lon, userId);
}
