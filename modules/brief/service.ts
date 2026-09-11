import { getForecast, weatherForEvent, wmoLabel } from "@/modules/weather/service";
import { getSummary, type FinanceSummary } from "@/modules/finance/service";
import { listEvents, type CalendarEvent } from "@/modules/calendar/service";
import { addDays, friendlyDate, nowDateTimeStr, todayStr } from "@/lib/dates";
import { db } from "@/lib/db";
import { fmtCents } from "@/lib/format";
import { complete, isAIConfigured } from "@/modules/ai/service";
import type { User } from "@/modules/auth/service";

export interface BriefData {
  greeting: string;
  date: string;
  todayEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  weather: any | null;
  place: string;
  finance: FinanceSummary;
}

export async function getBriefData(user: User): Promise<BriefData> {
  const today = todayStr();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 19 ? "Good afternoon" : "Good evening";

  const todayEvents = listEvents(user.id, `${today} 00:00`, `${addDays(today, 1)} 00:00`);
  const upcomingEvents = listEvents(user.id, `${addDays(today, 1)} 00:00`, `${addDays(today, 8)} 00:00`).slice(0, 5);

  const lat = user.lat ?? 40.4168;
  const lon = user.lon ?? -3.7038;
  const place = user.location_name ?? "Madrid, Spain";
  let weather = null;
  try {
    weather = await getForecast(lat, lon);
  } catch { /* brief still renders without weather */ }

  return {
    greeting,
    date: friendlyDate(today),
    todayEvents,
    upcomingEvents,
    weather,
    place,
    finance: getSummary(user.id),
  };
}

function briefCacheKey(userId: string) {
  return `brief:${todayStr()}:${userId}`;
}

function cachedBrief(userId: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(briefCacheKey(userId)) as any;
  return row?.value ?? null;
}

/** 2-3 sentence natural-language summary of the day. AI costs one call per day (cached until midnight); falls back to a template. */
// ponytail: brief cached until midnight — new events added mid-day won't show until tomorrow; invalidate on event change if it ever matters
export async function generateBriefSummary(user: User, data: BriefData): Promise<string> {
  if (!isAIConfigured()) return templateSummary(data);
  const cached = cachedBrief(user.id);
  if (cached) return cached;

  const eventsWithWeather = data.todayEvents.filter((e) => e.location).slice(0, 3);
  const weatherNotes = await Promise.all(
    eventsWithWeather.map(async (e) => {
      try {
        const w = await weatherForEvent(e.location, e.start);
        return w.available ? { event: e.title, temp: w.temp, rainChance: w.precipProb } : null;
      } catch { return null; }
    })
  );

  const facts = {
    date: data.date,
    todayEvents: data.todayEvents.map((e) => ({ title: e.title, start: e.start, location: e.location || null })),
    upcoming: data.upcomingEvents.map((e) => ({ title: e.title, start: e.start })),
    weather: data.weather
      ? {
          place: data.place,
          current: `${data.weather.current.temp}°C, ${wmoLabel(data.weather.current.code)}`,
          today: data.weather.daily[0],
        }
      : null,
    eventWeather: weatherNotes.filter(Boolean),
    finance: {
      balance: fmtCents(data.finance.balanceCents),
      spentThisMonth: fmtCents(data.finance.monthExpensesCents),
      earnedThisMonth: fmtCents(data.finance.monthIncomeCents),
    },
  };

  try {
    const { content } = await complete([
      {
        role: "system",
        content:
          "You generate a daily brief. Given the user's data as JSON, write 2-3 short sentences summarizing their day: how busy it is, notable weather (mention rain if likely), and one relevant money note if useful. Be warm but concise. No lists.",
      },
      { role: "user", content: JSON.stringify(facts) },
    ]);
    const summary = content || templateSummary(data);
    if (content) {
      db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(briefCacheKey(user.id), summary);
    }
    return summary;
  } catch {
    return templateSummary(data);
  }
}

function templateSummary(data: BriefData): string {
  const n = data.todayEvents.length;
  const rain = data.weather?.daily?.[0]?.precipProb ?? null;
  const parts = [
    n === 0 ? "Your day is clear — no events scheduled." : n === 1 ? `You have one event today: ${data.todayEvents[0].title}.` : `You have ${n} events today.`,
  ];
  if (rain != null && rain >= 40) parts.push(`Rain is likely (${rain}%).`);
  else if (data.weather) parts.push(`Currently ${data.weather.current.temp}°C in ${data.place}.`);
  parts.push(`Spent ${fmtCents(data.finance.monthExpensesCents)} this month.`);
  return parts.join(" ");
}
