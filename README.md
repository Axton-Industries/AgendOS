# Life OS

Personal dashboard: Daily Brief, AI assistant, Calendar, Weather, Balance,
Notes, Health, Maps, News, and Notifications — the AI talks to the same
services as the UI.

## Run

```
npm install
npm run dev
```

Open http://localhost:3000 and register an account. Data is stored in `data/lifeos.db` (SQLite, gitignored).

## AI assistant (optional)

Copy `.env.example` to `.env.local` and set `AI_API_KEY` (OpenAI, or any
OpenAI-compatible endpoint via `AI_BASE_URL` / `AI_MODEL` — OpenRouter, Ollama,
LM Studio). Without a key, everything else works and the Daily Brief falls back
to a template summary.

## Corporate TLS note

`.npmrc` sets `node-options=--use-system-ca` so Node trusts the machine
certificate store (needed behind TLS-intercepting proxies, e.g. ITACyL). Remove
if not needed.

## Checks

With the dev server running:

```
node scripts/smoke.mjs     # API e2e (auth, calendar, finance, weather, brief)
node scripts/ai-test.mjs   # AI tool-calling loop (needs AI_BASE_URL=fake, see script header)
```

## Architecture

```
modules/
  auth/           service (sessions, scrypt, cookies)
  calendar/       service (events CRUD, user-scoped)
  weather/        service + providers/ (openmeteo, aemet stub)
  finance/        service (transactions, summary)
  brief/          service (aggregates modules + AI summary)
  notes/          service (CRUD + search)
  health/         service (manual metrics, 7-day averages; Garmin/Oura can slot in)
  maps/           service (saved places, OSM embed, OSRM routing)
  news/           service (RSS headlines)
  notifications/  service (reminders + calendar-derived alerts; IMAP later)
  ai/             service (provider loop) + providers/ + tools
  registry        nav config
app/
  (app)/          UI pages
  api/            route handlers — every one enforces session server-side
```

Notes, Maps and News are fully functional (OSM/OSRM/RSS, no keys needed).
Health is manual-entry tracking and Notifications are in-app; real provider
integrations (Garmin, Apple Health, IMAP/Gmail) plug into their services later.
