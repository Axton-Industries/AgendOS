"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { wmoLabel } from "@/modules/weather/service";
import { useTranslations } from "@/lib/i18n";
import { fmtCents } from "@/lib/format";
import type { BriefData } from "@/modules/brief/service";

export default function BriefPage() {
  const { t, lang } = useTranslations();
  const [data, setData] = useState<(BriefData & { summary: string }) | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/brief?lang=${lang}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((e) => setError(e.message));
  }, [lang]);

  if (!data) return <p className="text-sm text-zinc-500">{t("loading")}</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  const weather = data.weather;
  const today = data.weather?.daily?.[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="pb-2">
        <p className="text-sm text-zinc-500">{data.date}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{t("agendos")}</h1>
      </header>

      <div className="card border-neon/30 bg-neon/[0.06]">
        <p className="text-sm leading-relaxed text-ink-soft">{data.summary}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">{t("weatherLabel")} · {data.place}</h2>
          {weather ? (
            <>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{Math.round(weather.current.temp)}°C</span>
                <span className="text-zinc-400">{wmoLabel(weather.current.code, lang)}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                {t("feelsLike")} {Math.round(weather.current.feelsLike)}°C
                {today?.precipProb != null && <> · {today.precipProb}% {t("chanceOfRain")}</>}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">{t("weatherUnavailable")}</p>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">{t("balanceLabel")}</h2>
          <div className="text-3xl font-bold tracking-tight">{data.finance ? fmtCents(data.finance.balanceCents) : "…"}</div>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="text-emerald-400">+{data.finance ? fmtCents(data.finance.monthIncomeCents) : "0"}</span> ·{" "}
            <span className="text-red-400">-{data.finance ? fmtCents(data.finance.monthExpensesCents) : "0"}</span> {t("thisMonth")}
          </p>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-3 section-title">{t("today")}</h2>
        {data.todayEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("noEventsToday")}</p>
        ) : (
          <ul className="space-y-2">
            {data.todayEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-4 text-sm">
                <span className="w-12 shrink-0 font-mono text-zinc-400">{e.start.slice(11, 16)}</span>
                <span>{e.title}</span>
                {e.location && <span className="truncate text-zinc-500">@ {e.location}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.upcomingEvents.length > 0 && (
        <section className="card">
          <h2 className="mb-3 section-title">{t("upcoming")}</h2>
          <ul className="space-y-2">
            {data.upcomingEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-4 text-sm">
                <span className="w-28 shrink-0 text-zinc-400">{e.start.slice(0, 10)} {e.start.slice(11, 16)}</span>
                <span>{e.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}