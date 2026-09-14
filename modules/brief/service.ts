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

export async function getBriefData(user: User, lang: "en" | "es" = "en"): Promise<BriefData> {
  const today = todayStr();
  const hour = new Date().getHours();
  const greeting = lang === "es"
    ? (hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches")
    : (hour < 12 ? "Good morning" : hour < 19 ? "Good afternoon" : "Good evening");

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
    date: friendlyDate(today, lang),
    todayEvents,
    upcomingEvents,
    weather,
    place,
    finance: getSummary(user.id),
  };
}

function briefCacheKey(userId: string, lang: "en" | "es" = "en") {
  return `brief:${todayStr()}:${lang}:${userId}`;
}

function cachedBrief(userId: string, lang: "en" | "es" = "en"): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(briefCacheKey(userId, lang)) as any;
  return row?.value ?? null;
}

/** 2-3 sentence natural-language summary of the day. AI costs one call per day (cached until midnight); falls back to a template. */
// ponytail: brief cached until midnight — new events added mid-day won't show until tomorrow; invalidate on event change if it ever matters
export async function generateBriefSummary(user: User, data: BriefData, lang: "en" | "es" = "en"): Promise<string> {
  if (!isAIConfigured()) return templateSummary(data, lang);
  const cached = cachedBrief(user.id, lang);
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
          current: `${data.weather.current.temp}°C, ${wmoLabel(data.weather.current.code, lang)}`,
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
          lang === "es"
            ? "Generas un resumen diario. Con los datos del usuario como JSON, escribe 2-3 frases cortas resumiendo su día: cuánto de ocupado está, el tiempo relevante (menciona la lluvia si es probable) y una nota de dinero si es útil. Sé cálido pero conciso. Sin listas."
            : "You generate a daily brief. Given the user's data as JSON, write 2-3 short sentences summarizing their day: how busy it is, notable weather (mention rain if likely), and one relevant money note if useful. Be warm but concise. No lists.",
      },
      { role: "user", content: JSON.stringify(facts) },
    ]);
    const summary = content || templateSummary(data, lang);
    if (content) {
      db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run(briefCacheKey(user.id, lang), summary);
    }
    return summary;
  } catch {
    return templateSummary(data, lang);
  }
}

function templateSummary(data: BriefData, lang: "en" | "es" = "en"): string {
  const n = data.todayEvents.length;
  const rain = data.weather?.daily?.[0]?.precipProb ?? null;
  const parts = [
    lang === "es"
      ? (n === 0 ? "Tu día está despejado — sin eventos programados." : n === 1 ? `Tienes un evento hoy: ${data.todayEvents[0].title}.` : `Tienes ${n} eventos hoy.`)
      : (n === 0 ? "Your day is clear — no events scheduled." : n === 1 ? `You have one event today: ${data.todayEvents[0].title}.` : `You have ${n} events today.`),
  ];
  if (rain != null && rain >= 40) parts.push(lang === "es" ? `Es probable que llueva (${rain}%).` : `Rain is likely (${rain}%).`);
  else if (data.weather) parts.push(lang === "es" ? `Actualmente ${data.weather.current.temp}°C en ${data.place}.` : `Currently ${data.weather.current.temp}°C in ${data.place}.`);
  parts.push(lang === "es" ? `Has gastado ${fmtCents(data.finance.monthExpensesCents)} este mes.` : `Spent ${fmtCents(data.finance.monthExpensesCents)} this month.`);
  return parts.join(" ");
}
