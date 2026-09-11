"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/lib/i18n";
import { wmoLabel } from "@/modules/weather/service";

type Forecast = {
  place: string;
  current: { temp: number; feelsLike: number; code: number; precip: number | null; wind: number | null; humidity: number | null };
  hourly: { time: string; temp: number; precipProb: number | null; precip: number | null; code: number }[];
  daily: { date: string; min: number; max: number; code: number; precipProb: number | null; precip: number | null }[];
};

export default function WeatherPage() {
  const { t } = useTranslations();
  const [data, setData] = useState<Forecast | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(url = "/api/weather") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(url);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
    setBusy(false);
  }

  useEffect(() => { load(); }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/weather/geocode?name=${encodeURIComponent(query.trim())}`);
    const { place } = await res.json();
    setBusy(false);
    if (!place) { setError(`${t("noResults")} "${query}"`); return; }
    setQuery("");
    await load(`/api/weather?lat=${place.lat}&lon=${place.lon}&name=${encodeURIComponent(place.name + ", " + place.country)}`);
    await fetch("/api/user/location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${place.name}, ${place.country}`, lat: place.lat, lon: place.lon }),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="page-title">{t("weatherPageTitle")}</h1>
        <form onSubmit={search} className="ml-auto flex gap-2">
          <input className="input w-48" placeholder={t("searchLocation")} value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="btn-secondary" disabled={busy}>{t("search")}</button>
        </form>
      </div>

      {error && <p className="card text-sm text-red-400">{error}</p>}
      {!data && !error && <p className="card text-sm text-zinc-500">{t("loading")}</p>}

      {data && (
        <>
          <section className="card">
            <p className="text-sm text-zinc-400">{data.place}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-4">
              <span className="text-5xl font-bold tracking-tight">{Math.round(data.current.temp)}°C</span>
              <span className="text-lg text-zinc-300">{wmoLabel(data.current.code)}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-400 sm:grid-cols-4">
              <div>{t("feelsLike")} <b className="text-zinc-200">{Math.round(data.current.feelsLike)}°C</b></div>
              <div>{t("rain")} <b className="text-zinc-200">{data.daily[0]?.precipProb ?? "–"}%</b></div>
              <div>{t("wind")} <b className="text-zinc-200">{data.current.wind != null ? Math.round(data.current.wind) + " km/h" : "–"}</b></div>
              <div>{t("humidity")} <b className="text-zinc-200">{data.current.humidity != null ? Math.round(data.current.humidity) + "%" : "–"}</b></div>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-3 section-title">{t("hourly")}</h2>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {data.hourly.filter((h) => h.time >= new Date().toISOString().slice(0, 13)).slice(0, 24).map((h) => (
                <div key={h.time} className="shrink-0 text-center text-xs">
                  <div className="text-zinc-500">{h.time.slice(11, 16)}</div>
                  <div className="my-1 font-semibold">{Math.round(h.temp)}°</div>
                  <div className="text-neon/70">{h.precipProb != null ? `${h.precipProb}%` : ""}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="mb-3 section-title">{t("forecast7day")}</h2>
            <ul className="divide-y divide-zinc-800">
              {data.daily.map((d) => (
                <li key={d.date} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-10 text-zinc-400">{d.date.slice(5)}</span>
                  <span className="flex-1 text-zinc-300">{wmoLabel(d.code)}</span>
                  <span className="text-neon/70">{d.precipProb != null ? `${d.precipProb}%` : ""}</span>
                  <span className="w-16 text-right"><b>{Math.round(d.max)}°</b> <span className="text-zinc-500">{Math.round(d.min)}°</span></span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
