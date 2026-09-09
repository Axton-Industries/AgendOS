import { db, newId, nowIso } from "@/lib/db";
import { geocode } from "@/modules/weather/service";

export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export function listPlaces(userId: string): Place[] {
  return db.prepare("SELECT id, name, lat, lon FROM places WHERE user_id = ? ORDER BY created_at DESC").all(userId) as unknown as Place[];
}

export async function savePlace(userId: string, query: string): Promise<Place> {
  const place = await geocode(query);
  if (!place) throw new Error(`Location '${query}' not found`);
  const id = newId();
  const name = `${place.name}, ${place.country}`;
  db.prepare("INSERT INTO places (id, user_id, name, lat, lon, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    id, userId, name, place.lat, place.lon, nowIso()
  );
  return { id, name, lat: place.lat, lon: place.lon };
}

export function deletePlace(userId: string, id: string): boolean {
  return db.prepare("DELETE FROM places WHERE user_id = ? AND id = ?").run(userId, id).changes > 0;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  mode: string;
  mapUrl: string;
}

const OSRM_PROFILE: Record<string, string> = { car: "driving", bike: "bike", foot: "foot" };

/** Route between two points via the public OSRM demo server. */
export async function getRoute(
  from: { lat: number; lon: number; name?: string },
  to: { lat: number; lon: number; name?: string },
  mode = "car"
): Promise<RouteInfo> {
  const profile = OSRM_PROFILE[mode] ?? "driving";
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Routing request failed");
  const d = await res.json();
  if (d.code !== "Ok" || !d.routes?.[0]) throw new Error("No route found between those points");
  const r = d.routes[0];
  const bbox = [
    Math.min(from.lon, to.lon) - 0.5, Math.min(from.lat, to.lat) - 0.5,
    Math.max(from.lon, to.lon) + 0.5, Math.max(from.lat, to.lat) + 0.5,
  ].join(",");
  return {
    distanceKm: Math.round((r.distance / 1000) * 10) / 10,
    durationMin: Math.round(r.duration / 60),
    mode,
    mapUrl: `https://www.openstreetmap.org/directions?engine=fossgis_osrm_${profile}&route=${from.lat},${from.lon};${to.lat},${to.lon}`,
  };
}

export function embedUrl(lat: number, lon: number, zoom = 12) {
  const d = 0.05;
  const bbox = [lon - d, lat - d, lon + d, lat + d].join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}
