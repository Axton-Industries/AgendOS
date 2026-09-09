# Life OS

Personal dashboard: Daily Brief, Calendar, Weather, Balance, and an AI assistant
that talks to the same services as the UI.

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
  auth/      service (sessions, scrypt, cookies)
  calendar/  service (events CRUD, user-scoped)
  weather/   service + providers/ (openmeteo, aemet stub)
  finance/   service (transactions, summary)
  brief/     service (aggregates modules + AI summary)
  ai/        service (provider loop) + providers/ + tools
  registry   nav config (future modules show "Soon")
app/
  (app)/     UI pages (brief, assistant, calendar, weather, balance)
  api/       route handlers — every one enforces session server-side
```

UI and AI call the same services; the AI only acts through tools bound to the
authenticated user. Future modules (Notes, Health, Maps, News, Email) are
placeholders in the nav — add a folder under `modules/` + a route when building.
