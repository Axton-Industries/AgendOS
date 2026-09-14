"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";

type Place = { id: string; name: string; lat: number; lon: number };
type RouteInfo = { distanceKm: number; durationMin: number; mode: string; mapUrl: string };

export default function MapsPage() {
  const { t } = useTranslations();
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [query, setQuery] = useState("");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeForm, setRouteForm] = useState({ from: "", to: "", mode: "car" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setPlaces((await fetch("/api/maps").then((r) => r.json())).places);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function savePlace(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/maps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query.trim() }),
    });
    setBusy(false);
    if (!res.ok) { setError((await res.json()).error); return; }
    setQuery("");
    load();
  }

  async function removePlace(id: string) {
    await fetch(`/api/maps?id=${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  }

  async function calcRoute(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setRoute(null);
    const res = await fetch(`/api/maps/route-info?from=${encodeURIComponent(routeForm.from)}&to=${encodeURIComponent(routeForm.to)}&mode=${routeForm.mode}`);
    const d = await res.json();
    setBusy(false);
    if (!res.ok) { setError(d.error); return; }
    setRoute(d.route);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="page-title">{t("mapsPageTitle")}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">{t("savedPlaces")}</h2>
          <form onSubmit={savePlace} className="mb-3 flex gap-2">
            <input className="input" placeholder={t("searchPlaceToSave")} value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="btn-secondary" disabled={busy}>{t("save")}</button>
          </form>
          <ul className="divide-y divide-zinc-800 text-sm">
            {places.map((p) => (
              <li key={p.id} className="group flex items-center gap-2 py-2">
                <button className="flex-1 text-left hover:text-neon" onClick={() => setSelected(p)}>
                  {p.name}
                </button>
                <button className="text-zinc-600 opacity-0 hover:text-red-400 group-hover:opacity-100" onClick={() => removePlace(p.id)}>×</button>
              </li>
            ))}
            {places.length === 0 && <li className="py-2 text-zinc-500">{t("noSavedPlaces")}</li>}
          </ul>
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">{t("directions")}</h2>
          <form onSubmit={calcRoute} className="space-y-3">
            <input className="input" placeholder={t("from")} required value={routeForm.from} onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })} />
            <input className="input" placeholder={t("to")} required value={routeForm.to} onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })} />
            <select className="input" value={routeForm.mode} onChange={(e) => setRouteForm({ ...routeForm, mode: e.target.value })}>
              <option value="car">{t("car")}</option>
              <option value="bike">{t("bike")}</option>
              <option value="foot">{t("onFoot")}</option>
            </select>
            <button className="btn" disabled={busy}>{t("getRoute")}</button>
          </form>
          {route && (
            <div className="mt-4 rounded-lg bg-neon/10 p-3 text-sm">
              <p className="font-semibold">{t("routeInfo", { km: route.distanceKm, min: route.durationMin, mode: t(route.mode === "foot" ? "onFoot" : route.mode === "bike" ? "bike" : "car") })}</p>
              <a className="text-xs text-neon hover:underline" href={route.mapUrl} target="_blank" rel="noreferrer">{t("openDirections")}</a>
            </div>
          )}
        </section>
      </div>

      {error && <p className="card text-sm text-red-400">{error}</p>}

      {selected ? (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold">{selected.name}</h2>
          <iframe title="map" className="h-80 w-full rounded-lg border border-zinc-800"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${selected.lon - 0.05}%2C${selected.lat - 0.05}%2C${selected.lon + 0.05}%2C${selected.lat + 0.05}&layer=mapnik&marker=${selected.lat}%2C${selected.lon}`} />
        </section>
      ) : (
        <p className="card text-sm text-zinc-500">{t("selectPlaceHint")}</p>
      )}
    </div>
  );
}
