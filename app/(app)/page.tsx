import { getCurrentUser } from "@/modules/auth/service";
import { getBriefData, generateBriefSummary } from "@/modules/brief/service";
import { fmtCents } from "@/lib/format";
import { timeOf, dayName } from "@/lib/dates";
import { wmoLabel } from "@/modules/weather/service";

export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const user = getCurrentUser();
  const data = await getBriefData(user);
  const summary = await generateBriefSummary(user, data);
  const w = data.weather;
  const today = w?.daily?.[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="pb-2">
        <p className="text-sm text-zinc-500">{data.date}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{data.greeting}</h1>
      </header>

      <div className="card border-neon/30 bg-neon/[0.06]">
        <p className="text-sm leading-relaxed text-ink-soft">{summary}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">Weather · {data.place}</h2>
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
          <h2 className="mb-3 section-title">Balance</h2>
          <div className="text-3xl font-bold tracking-tight">{fmtCents(data.finance.balanceCents)}</div>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="text-emerald-400">+{fmtCents(data.finance.monthIncomeCents)}</span> ·{" "}
            <span className="text-red-400">-{fmtCents(data.finance.monthExpensesCents)}</span> this month
          </p>
        </section>
      </div>

      <section className="card">
        <h2 className="mb-3 section-title">Today</h2>
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
          <h2 className="mb-3 section-title">Upcoming</h2>
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
