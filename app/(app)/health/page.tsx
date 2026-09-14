"use client";

import { useCallback, useEffect, useState } from "react";
import { todayStr } from "@/lib/dates";
import { useTranslations } from "@/lib/i18n";

type Metric = { date: string; sleep_hours: number | null; steps: number | null; weight_kg: number | null; resting_hr: number | null; note: string };
type Averages = { sleep: number | null; steps: number | null; weight: number | null; resting_hr: number | null };

const empty = { date: todayStr(), sleepHours: "", steps: "", weightKg: "", restingHr: "", note: "" };

export default function HealthPage() {
  const { t } = useTranslations();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [averages, setAverages] = useState<Averages | null>(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const d = await fetch("/api/health").then((r) => r.json());
    setMetrics(d.metrics);
    setAverages(d.averages);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...empty, date: form.date });
    setBusy(false);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="page-title">{t("healthPageTitle")}</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("avgSleep"), value: averages?.sleep != null ? t("hoursAbbrev", { n: averages.sleep }) : "–" },
          { label: t("avgSteps"), value: averages?.steps?.toLocaleString() ?? "–" },
          { label: t("avgWeight"), value: averages?.weight != null ? t("kgAbbrev", { n: averages.weight }) : "–" },
          { label: t("avgHR"), value: averages?.resting_hr != null ? t("bpmAbbrev", { n: averages.resting_hr }) : "–" },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="section-title">{c.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">{t("logMetrics")}</h2>
          <form onSubmit={save} className="space-y-3">
            <input className="input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" step="0.1" placeholder={t("sleepLabel")} value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} />
              <input className="input" type="number" placeholder={t("stepsLabel")} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
              <input className="input" type="number" step="0.1" placeholder={t("weightLabel")} value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
              <input className="input" type="number" placeholder={t("restingHRLabel")} value={form.restingHr} onChange={(e) => setForm({ ...form, restingHr: e.target.value })} />
            </div>
            <input className="input" placeholder={t("noteOptional")} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button className="btn" disabled={busy}>{t("saveMetrics")}</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">{t("recentEntries")}</h2>
          <ul className="divide-y divide-zinc-800 text-sm">
            {metrics.map((m) => (
              <li key={m.date} className="flex items-center gap-3 py-2">
                <span className="w-20 shrink-0 text-zinc-400">{m.date.slice(5)}</span>
                <span className="flex-1 text-zinc-300">
                  {m.sleep_hours != null && `${t("hoursSuffix", { n: m.sleep_hours })} · `}
                  {m.steps != null && `${t("stepsSuffix", { n: m.steps.toLocaleString() })} · `}
                  {m.weight_kg != null && `${m.weight_kg}kg · `}
                  {m.resting_hr != null && `${m.resting_hr}bpm`}
                  {!m.sleep_hours && !m.steps && !m.weight_kg && !m.resting_hr && (m.note || "—")}
                </span>
                {m.note && <span className="max-w-24 truncate text-xs text-zinc-600">{m.note}</span>}
              </li>
            ))}
            {metrics.length === 0 && <li className="py-2 text-zinc-500">{t("noEntries")}</li>}
          </ul>
        </section>
      </div>

      <p className="text-xs text-zinc-600">
        {t("healthNote")}
      </p>
    </div>
  );
}
