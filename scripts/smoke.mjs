// E2E smoke test against a running server: node scripts/smoke.mjs [base-url]
const BASE = process.argv[2] ?? "http://localhost:3000";
let passed = 0, failed = 0;

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, data };
}

function check(name, cond, extra = "") {
  if (cond) { passed++; console.log(`  ok  ${name} ${extra}`); }
  else { failed++; console.log(`FAIL  ${name} ${extra}`); }
}

// calendar
let r = await call("POST", "/api/calendar", { title: "Dinner", start: "2026-09-11 20:00", end: "2026-09-11 22:00", location: "Madrid", category: "social" });
const ev = r.data?.event;
check("create event", r.status === 200 && ev?.title === "Dinner", ev?.id?.slice(0, 8));

r = await call("POST", "/api/calendar", { title: "Bad", start: "2026-09-11 22:00", end: "2026-09-11 20:00" });
check("invalid event rejected", r.status === 400, r.data?.error ?? "");

r = await call("PATCH", `/api/calendar/${ev.id}`, { title: "Dinner with Ana" });
check("update event", r.status === 200 && r.data?.event?.title === "Dinner with Ana");

r = await call("GET", "/api/calendar?from=2026-09-11&to=2026-09-12");
check("list events in range", r.status === 200 && r.data?.events?.length === 1);

// finance
await call("POST", "/api/finance/transactions", { type: "expense", amount: "45.30", description: "Groceries", category: "Food", date: "2026-09-09" });
await call("POST", "/api/finance/transactions", { type: "income", amount: "2000", description: "Salary", category: "Work", date: "2026-09-01" });
r = await call("GET", "/api/finance/summary");
const s = r.data?.summary;
check("finance summary", s?.balanceCents === 195470 && s?.monthExpensesCents === 4530 && s?.byCategory?.[0]?.category === "Food",
  `balance=${s?.balanceCents}`);

r = await call("POST", "/api/finance/transactions", { type: "expense", amount: "abc", date: "2026-09-09" });
check("invalid tx rejected", r.status === 400);

// AI graceful without key
r = await call("POST", "/api/ai/chat", { message: "hi" });
check("ai chat responds", r.status === 200 || r.status === 503, `status=${r.status}`);

// notes
r = await call("POST", "/api/notes", { title: "Ideas", content: "build a life os" });
const note = r.data?.note;
check("create note", r.status === 200 && note?.id);
r = await call("GET", "/api/notes?q=life");
check("search notes", r.status === 200 && r.data?.notes?.length === 1);
r = await call("PATCH", `/api/notes/${note.id}`, { content: "build a life os, ship it" });
check("update note", r.status === 200 && r.data?.note?.content.includes("ship"));

// health
r = await call("POST", "/api/health", { sleepHours: 7.5, steps: 8000, weightKg: 70 });
check("log health", r.status === 200 && r.data?.metric?.sleep_hours === 7.5);
r = await call("POST", "/api/health", { sleepHours: 8 }); // upsert same day
check("health upsert merges", r.data?.metric?.sleep_hours === 8 && r.data?.metric?.steps === 8000);
r = await call("GET", "/api/health");
check("health averages", r.status === 200 && r.data?.averages?.sleep === 8);

// maps
r = await call("POST", "/api/maps", { query: "Valladolid" });
check("save place", r.status === 200 && r.data?.place?.name.includes("Valladolid"), r.data?.error ?? "");
r = await call("GET", "/api/maps/route-info?from=Valladolid&to=Salamanca&mode=car");
check("route", r.status === 200 && r.data?.route?.distanceKm > 0, r.data?.error ?? `${r.data?.route?.distanceKm}km ${r.data?.route?.durationMin}min`);

// news
r = await call("GET", "/api/news?category=tech");
check("news headlines", r.status === 200 && r.data?.articles?.length > 0, `${r.data?.articles?.length ?? 0} articles`);

// notifications / reminders
r = await call("POST", "/api/reminders", { text: "Call the dentist" }); // due defaults to today
const rem = r.data?.reminder;
check("create reminder", r.status === 200 && rem?.id);
r = await call("GET", "/api/reminders");
check("notifications derived", r.status === 200 && r.data?.notifications?.some((n) => n.text === "Call the dentist"));
r = await call("PATCH", `/api/reminders/${rem.id}`);
check("complete reminder", r.status === 200);
r = await call("GET", "/api/reminders");
check("done reminder filtered", !r.data?.notifications?.some((n) => n.text === "Call the dentist"));

// weather (needs outbound network)
r = await call("GET", "/api/weather");
check("weather", r.status === 200 && r.data?.current?.temp != null, r.data?.error ?? "");

// cross-module: event weather
r = await call("GET", `/api/weather/event?eventId=${ev.id}`);
check("event weather", r.status === 200 && r.data?.weather, JSON.stringify(r.data?.weather ?? r.data?.error ?? {}).slice(0, 120));

// brief page
const page = await fetch(BASE + "/");
const html = await page.text();
check("brief page", page.status === 200 && /Good (morning|afternoon|evening)/.test(html));

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
