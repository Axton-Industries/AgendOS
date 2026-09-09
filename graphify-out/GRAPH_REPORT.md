# Graph Report - Orgamy  (2026-09-09)

## Corpus Check
- Corpus is ~16,200 words - fits in a single context window. You may not need a graph.

## Summary
- 375 nodes · 798 edges · 22 communities (15 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- API Routes & Services
- Calendar & AI Features
- Weather & Balance Pages
- App Pages (UI)
- Project Config & Layout
- Data Services & DB
- Auth & Layout
- TypeScript Config
- Notifications & Reminders
- README: Core Features
- News Module
- Agent Rules & Docs
- AI Test Scripts
- README: Infrastructure
- README: Maps
- README: Architecture
- Next.js Env Types
- PostCSS Config
- README: News
- README: Health
- README: Notes

## God Nodes (most connected - your core abstractions)
1. `requireUser()` - 51 edges
2. `todayStr()` - 23 edges
3. `badRequest()` - 20 edges
4. `nowIso()` - 19 edges
5. `newId()` - 17 edges
6. `compilerOptions` - 16 edges
7. `addDays()` - 14 edges
8. `react` - 12 edges
9. `CalendarPage()` - 11 edges
10. `wmoLabel()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `EventPill()` --calls--> `timeOf()`  [EXTRACTED]
  app/(app)/calendar/page.tsx → lib/dates.ts
- `BalancePage()` --calls--> `todayStr()`  [EXTRACTED]
  app/(app)/balance/page.tsx → lib/dates.ts
- `Agenda()` --calls--> `addDays()`  [EXTRACTED]
  app/(app)/calendar/page.tsx → lib/dates.ts
- `AppLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/(app)/layout.tsx → modules/auth/service.ts
- `NotificationsPage()` --calls--> `todayStr()`  [EXTRACTED]
  app/(app)/notifications/page.tsx → lib/dates.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Life OS dashboard modules** — readme_life_os, readme_daily_brief, readme_ai_assistant, readme_calendar, readme_weather, readme_balance, readme_notes, readme_health, readme_maps, readme_news, readme_notifications [EXTRACTED 1.00]
- **modules/ service layer** — readme_modules_dir, readme_auth_service, readme_calendar, readme_weather, readme_finance_service, readme_daily_brief, readme_notes, readme_health, readme_maps, readme_news, readme_notifications, readme_ai_service, readme_registry [EXTRACTED 1.00]
- **AI and UI share the same services** — readme_shared_services, readme_ai_service, readme_app_dir, readme_calendar, readme_weather, readme_notes [EXTRACTED 1.00]

## Communities (22 total, 6 thin omitted)

### Community 0 - "API Routes & Services"
Cohesion: 0.08
Nodes (44): maxDuration, POST(), GET(), Ctx, DELETE(), GET(), PATCH(), GET() (+36 more)

### Community 1 - "Calendar & AI Features"
Cohesion: 0.08
Nodes (43): GET(), ByDay, CalendarPage(), openCreate(), CAT_COLOR, CATEGORIES, DayClick, emptyForm (+35 more)

### Community 2 - "Weather & Balance Pages"
Cohesion: 0.09
Nodes (33): GET(), BalancePage(), Summary, Tx, Agenda(), BriefPage(), dynamic, Forecast (+25 more)

### Community 3 - "App Pages (UI)"
Cohesion: 0.05
Nodes (18): AssistantPage(), Msg, Averages, empty, HealthPage(), Metric, MapsPage(), Place (+10 more)

### Community 4 - "Project Config & Layout"
Cohesion: 0.06
Nodes (28): metadata, nextConfig, dependencies, next, react, react-dom, devDependencies, tailwindcss (+20 more)

### Community 5 - "Data Services & DB"
Cohesion: 0.16
Nodes (22): GET(), POST(), GET(), POST(), db, newId(), nowIso(), createEvent() (+14 more)

### Community 6 - "Auth & Layout"
Cohesion: 0.15
Nodes (18): POST(), POST(), POST(), setSession(), AppLayout(), Sidebar(), getCurrentUser(), getUserByToken() (+10 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Notifications & Reminders"
Cohesion: 0.23
Nodes (13): Ctx, DELETE(), PATCH(), GET(), POST(), completeReminder(), createReminder(), deleteReminder() (+5 more)

### Community 9 - "README: Core Features"
Cohesion: 0.16
Nodes (16): AEMET (weather provider stub), AI Assistant, AI Service (provider loop, providers/, tools), scripts/ai-test.mjs (AI tool-calling loop test), app/ (UI pages + API route handlers), Auth Service (sessions, scrypt, cookies), Balance, Calendar (module/service) (+8 more)

### Community 10 - "News Module"
Cohesion: 0.31
Nodes (8): GET(), maxDuration, Article, decode(), DEFAULT_FEEDS, fetchFeed(), getHeadlines(), tag()

### Community 11 - "Agent Rules & Docs"
Cohesion: 0.50
Nodes (4): generate-agent-files.js (next dev agent-file writer), Next.js Agent Rules Block (AGENTS.md), Next.js bundled docs (node_modules/next/dist/docs/), CLAUDE.md @AGENTS.md include

### Community 13 - "README: Infrastructure"
Cohesion: 0.67
Nodes (3): Life OS, SQLite database (data/lifeos.db), Corporate TLS note (--use-system-ca in .npmrc)

### Community 14 - "README: Maps"
Cohesion: 0.67
Nodes (3): Maps (module/service), OpenStreetMap (OSM embed), OSRM routing

### Community 15 - "README: Architecture"
Cohesion: 0.67
Nodes (3): modules/ services directory, Registry (nav config), Shared services principle (AI talks to the same services as the UI)

## Knowledge Gaps
- **108 isolated node(s):** `Msg`, `Tx`, `Summary`, `Event`, `CATEGORIES` (+103 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Pages (UI)` to `Calendar & AI Features`, `Weather & Balance Pages`, `Project Config & Layout`, `Auth & Layout`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **Why does `todayStr()` connect `Calendar & AI Features` to `Notifications & Reminders`, `Weather & Balance Pages`, `App Pages (UI)`, `Data Services & DB`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `requireUser()` connect `API Routes & Services` to `Calendar & AI Features`, `Weather & Balance Pages`, `Data Services & DB`, `Auth & Layout`, `Notifications & Reminders`, `News Module`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **What connects `Msg`, `Tx`, `Summary` to the rest of the system?**
  _108 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `API Routes & Services` be split into smaller, more focused modules?**
  _Cohesion score 0.07656341320864991 - nodes in this community are weakly interconnected._
- **Should `Calendar & AI Features` be split into smaller, more focused modules?**
  _Cohesion score 0.07727272727272727 - nodes in this community are weakly interconnected._
- **Should `Weather & Balance Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.08502415458937199 - nodes in this community are weakly interconnected._