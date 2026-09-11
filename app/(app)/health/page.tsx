"use client";

import { useCallback, useEffect, useState } from "react";
import { todayStr } from "@/lib/dates";

type Metric = { date: string; sleep_hours: number | null; steps: number | null; weight_kg: number | null; resting_hr: number | null; note: string };
type Averages = { sleep: number | null; steps: number | null; weight: number | null; resting_hr: number | null };

const empty = { date: todayStr(), sleepHours: "", steps: "", weightKg: "", restingHr: "", note: "" };

export default function HealthPage() {
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
      <h1 className="page-title">Health</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg sleep (7d)", value: averages?.sleep != null ? `${averages.sleep} h` : "–" },
          { label: "Avg steps (7d)", value: averages?.steps?.toLocaleString() ?? "–" },
          { label: "Avg weight (7d)", value: averages?.weight != null ? `${averages.weight} kg` : "–" },
          { label: "Avg resting HR (7d)", value: averages?.resting_hr != null ? `${averages.resting_hr} bpm` : "–" },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="section-title">{c.label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">Log metrics</h2>
          <form onSubmit={save} className="space-y-3">
            <input className="input" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" type="number" step="0.1" placeholder="Sleep (h)" value={form.sleepHours} onChange={(e) => setForm({ ...form, sleepHours: e.target.value })} />
              <input className="input" type="number" placeholder="Steps" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
              <input className="input" type="number" step="0.1" placeholder="Weight (kg)" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
              <input className="input" type="number" placeholder="Resting HR" value={form.restingHr} onChange={(e) => setForm({ ...form, restingHr: e.target.value })} />
            </div>
            <input className="input" placeholder="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            <button className="btn" disabled={busy}>Save metrics</button>
          </form>
        </section>

        <section className="card">
          <h2 className="mb-3 section-title">Recent entries</h2>
          <ul className="divide-y divide-zinc-800 text-sm">
            {metrics.map((m) => (
              <li key={m.date} className="flex items-center gap-3 py-2">
                <span className="w-20 shrink-0 text-zinc-400">{m.date.slice(5)}</span>
                <span className="flex-1 text-zinc-300">
                  {m.sleep_hours != null && `${m.sleep_hours}h · `}
                  {m.steps != null && `${m.steps.toLocaleString()} steps · `}
                  {m.weight_kg != null && `${m.weight_kg}kg · `}
                  {m.resting_hr != null && `${m.resting_hr}bpm`}
                  {!m.sleep_hours && !m.steps && !m.weight_kg && !m.resting_hr && (m.note || "—")}
                </span>
                {m.note && <span className="max-w-24 truncate text-xs text-zinc-600">{m.note}</span>}
              </li>
            ))}
            {metrics.length === 0 && <li className="py-2 text-zinc-500">No entries yet.</li>}
          </ul>
        </section>
      </div>

      <p className="text-xs text-zinc-600">
        Manual tracking for now — Garmin / Apple Health / Fitbit / Oura integrations can be added to the health service later.
      </p>
    </div>
  );
}
