import { getCurrentUser } from "@/modules/auth/service";
import { getBriefData, generateBriefSummary } from "@/modules/brief/service";
const fmt = (c: number) => new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(c / 100);
import { timeOf, dayName } from "@/lib/dates";
import { wmoLabel } from "@/modules/weather/provider";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const user = (await getCurrentUser())!;
  const data = await getBriefData(user);
  const summary = await generateBriefSummary(user, data);
  const w = data.weather;
  const today = w?.daily?.[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{data.greeting}</h1>
        <p className="text-zinc-400">{data.date}</p>
      </header>

      <div className="card border-emerald-800/40 bg-emerald-950/20">
        <p className="text-sm leading-relaxed text-emerald-100">{summary}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Weather · {data.place}</h2>
          {w ? (
            <>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{Math.round(w.current.temp)}°C</span>
                <span className="text-zinc-400">{wmoLabel(w.current.code)}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">
                Feels like {Math.round(w.current.feelsLike)}°C
                {today?.precipProb != null && <> · {today.precipProb}% chance of rain</>}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Weather unavailable</p>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Balance</h2>
          <div className="text-3xl font-bold">{fmt(data.finance.balanceCents)}</div>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="text-emerald-400">+{fmt(data.finance.monthIncomeCents)}</span> ·{" "}
            <span className="text-red-400">-{fmt(data.finance.monthExpensesCents)}</span> this month
          </p>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Today</h2>
        {data.todayEvents.length === 0 ? (
          <p className="text-sm text-zinc-500">No events today.</p>
        ) : (
          <ul className="space-y-2">
            {data.todayEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-4 text-sm">
                <span className="w-12 shrink-0 font-mono text-zinc-400">{timeOf(e.start)}</span>
                <span>{e.title}</span>
                {e.location && <span className="truncate text-zinc-500">@ {e.location}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.upcomingEvents.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Upcoming</h2>
          <ul className="space-y-2">
            {data.upcomingEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-4 text-sm">
                <span className="w-28 shrink-0 text-zinc-400">{dayName(e.start.slice(0, 10))} {timeOf(e.start)}</span>
                <span>{e.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
