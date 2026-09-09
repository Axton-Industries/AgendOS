import type { AIToolSchema } from "./provider";
import * as calendar from "@/modules/calendar/service";
import * as weather from "@/modules/weather/service";
import { getForecast } from "@/modules/weather/service";
import * as finance from "@/modules/finance/service";
import * as notes from "@/modules/notes/service";
import * as health from "@/modules/health/service";
import * as maps from "@/modules/maps/service";
import * as news from "@/modules/news/service";
import * as notifications from "@/modules/notifications/service";
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
  {
    type: "function",
    function: {
      name: "notes_createNote",
      description: "Create a note.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notes_searchNotes",
      description: "Search the user's notes by keyword. Omit the query to list recent notes.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "health_logMetric",
      description: "Log health metrics for a day (defaults to today). Only pass the fields the user mentioned.",
      parameters: {
        type: "object",
        properties: {
          date: { type: "string", description: "Date YYYY-MM-DD, defaults to today" },
          sleepHours: { type: "number" },
          steps: { type: "number" },
          weightKg: { type: "number" },
          restingHr: { type: "number" },
          note: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "health_getMetrics",
      description: "Get recent health metrics and 7-day averages (sleep, steps, weight, resting heart rate).",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "maps_route",
      description: "Get distance and travel time between two places, and a link to the route on OpenStreetMap.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Origin place name" },
          to: { type: "string", description: "Destination place name" },
          mode: { type: "string", enum: ["car", "bike", "foot"] },
        },
        required: ["from", "to"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "news_getHeadlines",
      description: "Get current news headlines from RSS feeds. Optional category filter: world, tech, sport.",
      parameters: {
        type: "object",
        properties: { category: { type: "string", enum: ["world", "tech", "sport"] } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reminders_createReminder",
      description: "Create a reminder for the user.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string" },
          due: { type: "string", description: "Due date YYYY-MM-DD, defaults to today" },
        },
        required: ["text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "reminders_getReminders",
      description: "List the user's pending reminders and today's notifications (today's events + due reminders).",
      parameters: {
        type: "object",
        properties: { includeDone: { type: "boolean" } },
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
        const end = args.end ?? (() => { const [d,t] = start.split(" "); const [y,m,day] = d.split("-").map(Number); const dt = new Date(y, m-1, day, t.split(":").map(Number)[0]+1, t.split(":").map(Number)[1]); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")} ${String(dt.getHours()).padStart(2,"0")}:${String(dt.getMinutes()).padStart(2,"0")}`; })();
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
        return JSON.stringify({ place: placeName, current: forecast.current, daily: args.date ? forecast.daily.filter((d: any) => d.date === args.date) : forecast.daily, ...(args.date ? { hourly: forecast.hourly.filter((h: any) => h.time.startsWith(args.date)) } : {}) });
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
      case "notes_createNote":
        return JSON.stringify({ created: notes.createNote(userId, args) });
      case "notes_searchNotes":
        return JSON.stringify(notes.listNotes(userId, args.query).slice(0, 10));
      case "health_logMetric":
        return JSON.stringify({ logged: health.upsertMetrics(userId, args) });
      case "health_getMetrics":
        return JSON.stringify({ averages: health.getAverages(userId), metrics: health.listMetrics(userId, args.limit ?? 7) });
      case "maps_route": {
        const [a, b] = await Promise.all([weather.geocode(args.from), weather.geocode(args.to)]);
        if (!a) return JSON.stringify({ error: `Origin '${args.from}' not found` });
        if (!b) return JSON.stringify({ error: `Destination '${args.to}' not found` });
        return JSON.stringify(await maps.getRoute({ lat: a.lat, lon: a.lon }, { lat: b.lat, lon: b.lon }, args.mode));
      }
      case "news_getHeadlines":
        return JSON.stringify(await news.getHeadlines(args.category));
      case "reminders_createReminder":
        return JSON.stringify({ created: notifications.createReminder(userId, args) });
      case "reminders_getReminders":
        return JSON.stringify({
          reminders: notifications.listReminders(userId, args.includeDone),
          notifications: notifications.getNotifications(userId),
        });
      default:
        return JSON.stringify({ error: `Unknown tool '${name}'` });
    }
  } catch (e: any) {
    return JSON.stringify({ error: e.message });
  }
}
