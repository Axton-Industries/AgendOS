import type { AIToolSchema } from "./provider";
import * as calendar from "@/modules/calendar/service";
import * as weather from "@/modules/weather/service";
import { getForecast } from "@/modules/weather/service";
import * as finance from "@/modules/finance/service";
import { addDays, todayStr } from "@/lib/dates";
import type { User } from "@/modules/auth/service";

export const toolSchemas: AIToolSchema[] = [
  {
    type: "function",
    function: {
      name: "calendar_getEvents",
      description: "List the user's calendar events between two dates (inclusive). Omit dates to get the next 7 days.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Start date YYYY-MM-DD" },
          to: { type: "string", description: "End date YYYY-MM-DD (inclusive)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calendar_createEvent",
      description: "Create a calendar event.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          start: { type: "string", description: "Start datetime 'YYYY-MM-DD HH:mm' (24h)" },
          end: { type: "string", description: "End datetime 'YYYY-MM-DD HH:mm' (optional, defaults to start + 1h)" },
          description: { type: "string" },
          location: { type: "string" },
          category: { type: "string", description: "One of: default, work, personal, health, social" },
        },
        required: ["title", "start"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calendar_updateEvent",
      description: "Update an existing event by id. Only pass the fields to change.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          start: { type: "string", description: "'YYYY-MM-DD HH:mm'" },
          end: { type: "string", description: "'YYYY-MM-DD HH:mm'" },
          description: { type: "string" },
          location: { type: "string" },
          category: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calendar_deleteEvent",
      description: "Delete a calendar event by id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weather_getForecast",
      description: "Get weather forecast (current + daily). Optionally filter for a specific location and/or date.",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "Place name, e.g. 'Madrid'. Defaults to the user's saved location." },
          date: { type: "string", description: "Optional date YYYY-MM-DD to focus the forecast on" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weather_forEvent",
      description: "Get the weather forecast for a calendar event, found by matching its title. Use for questions like 'will it rain during my meeting?'.",
      parameters: {
        type: "object",
        properties: {
          eventTitleQuery: { type: "string", description: "Words to match against event titles, e.g. 'dinner'" },
        },
        required: ["eventTitleQuery"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finance_getSummary",
      description: "Get balance, total income/expenses, this month's income/expenses and spending by category.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "finance_getTransactions",
      description: "List transactions (most recent first). Omit dates to get the latest ones.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Start date YYYY-MM-DD" },
          to: { type: "string", description: "End date YYYY-MM-DD (inclusive)" },
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finance_createTransaction",
      description: "Create an income or expense transaction. Amount in euros.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          amount: { type: "number", description: "Amount in euros, e.g. 45.30" },
          description: { type: "string" },
          category: { type: "string" },
          date: { type: "string", description: "Date YYYY-MM-DD, defaults to today" },
        },
        required: ["type", "amount"],
      },
    },
  },
];

/** Executes a tool call against the shared services, scoped to the user. */
export async function executeTool(name: string, args: any, userId: string, user: User): Promise<string> {
  try {
    switch (name) {
      case "calendar_getEvents": {
        const from = args.from ?? todayStr();
        const to = args.to ?? addDays(todayStr(), 7);
        return JSON.stringify(calendar.listEvents(userId, from, addDays(to, 1)));
      }
      case "calendar_createEvent": {
        const start = args.start;
        const end = args.end ?? addHours(start, 1);
        const event = calendar.createEvent(userId, { ...args, start, end });
        return JSON.stringify({ created: event });
      }
      case "calendar_updateEvent": {
        const { id, ...fields } = args;
        const event = calendar.updateEvent(userId, id, fields);
        return event ? JSON.stringify({ updated: event }) : JSON.stringify({ error: "Event not found" });
      }
      case "calendar_deleteEvent": {
        const ok = calendar.deleteEvent(userId, args.id);
        return JSON.stringify({ deleted: ok });
      }
      case "weather_getForecast": {
        let lat = user.lat, lon = user.lon, placeName = user.location_name;
        if (args.location) {
          const place = await weather.geocode(args.location);
          if (!place) return JSON.stringify({ error: `Location '${args.location}' not found` });
          lat = place.lat; lon = place.lon; placeName = `${place.name}, ${place.country}`;
        }
        if (lat == null || lon == null) return JSON.stringify({ error: "No location available" });
        const forecast = await getForecast(lat, lon);
        return JSON.stringify(compactForecast(forecast, args.date, placeName));
      }
      case "weather_forEvent": {
        const query = (args.eventTitleQuery ?? "").toLowerCase();
        const events = calendar.listEvents(userId, todayStr(), addDays(todayStr(), 7));
        const event = events.find((e) => e.title.toLowerCase().includes(query));
        if (!event) return JSON.stringify({ error: `No event found matching '${args.eventTitleQuery}' in the next 7 days` });
        if (!event.location) return JSON.stringify({ error: `Event '${event.title}' has no location` });
        const w = await weather.weatherForEvent(event.location, event.start);
        return JSON.stringify({ event: { title: event.title, start: event.start, location: event.location }, weather: w });
      }
      case "finance_getSummary":
        return JSON.stringify(finance.getSummary(userId));
      case "finance_getTransactions": {
        const to = args.to ? addDays(args.to, 1) : undefined;
        return JSON.stringify(finance.listTransactions(userId, { from: args.from, to, limit: args.limit ?? 20 }));
      }
      case "finance_createTransaction": {
        const t = finance.createTransaction(userId, {
          type: args.type,
          amountCents: Math.round(args.amount * 100),
          description: args.description,
          category: args.category,
          date: args.date ?? todayStr(),
        });
        return JSON.stringify({ created: t });
      }
      default:
        return JSON.stringify({ error: `Unknown tool '${name}'` });
    }
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}

function compactForecast(f: any, date?: string, placeName?: string | null) {
  const out: any = {
    place: placeName,
    current: f.current,
    daily: date ? f.daily.filter((d: any) => d.date === date) : f.daily,
  };
  if (date) {
    out.hourly = f.hourly.filter((h: any) => h.time.startsWith(date));
  }
  return out;
}

function addHours(dt: string, hours: number) {
  const [date, time] = dt.split(" ");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const t = new Date(y, mo - 1, d, h + hours, mi);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
}
