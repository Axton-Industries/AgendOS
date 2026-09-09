"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays, addMonths, daysInMonth, mondayIndex, monthName, monthStart,
  timeOf, todayStr, weekStart, nowDateTimeStr,
} from "@/lib/dates";
import { wmoLabel } from "@/modules/weather/provider";

type Event = {
  id: string; title: string; description: string; location: string;
  start: string; end: string; category: string;
};

const CATEGORIES = ["default", "work", "personal", "health", "social"] as const;
const CAT_COLOR: Record<string, string> = {
  default: "bg-zinc-600", work: "bg-blue-600", personal: "bg-emerald-600",
  health: "bg-red-600", social: "bg-purple-600",
};

const emptyForm = { title: "", date: todayStr(), start: "09:00", end: "10:00", description: "", location: "", category: "default" };

type ByDay = Map<string, Event[]>;
type DayClick = (date: string) => void;
type EventClick = (e: Event) => void;

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "week" | "agenda">("month");
  const [anchor, setAnchor] = useState(todayStr());
  const [events, setEvents] = useState<Event[]>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const range = useMemo((): [string, string] => {
    if (view === "month") {
      const from = weekStart(monthStart(anchor));
      return [from, addDays(from, 42)];
    }
    if (view === "week") {
      const from = weekStart(anchor);
      return [from, addDays(from, 7)];
    }
    return [todayStr(), addDays(todayStr(), 30)];
  }, [view, anchor]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/calendar?from=${range[0]}&to=${range[1]}`);
    const data = await res.json();
    setEvents(data.events);
  }, [range]);

  useEffect(() => { load(); }, [load]);

  function openCreate(date: string) {
    setForm({ ...emptyForm, date, start: date === todayStr() ? nowDateTimeStr().slice(11, 16) : "09:00" });
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(e: Event) {
    setForm({
      title: e.title, date: e.start.slice(0, 10), start: e.start.slice(11, 16),
      end: e.end.slice(11, 16), description: e.description, location: e.location, category: e.category,
    });
    setEditing(e);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const body = {
      title: form.title, description: form.description, location: form.location, category: form.category,
      start: `${form.date} ${form.start}`, end: `${form.date} ${form.end}`,
    };
    const url = editing ? `/api/calendar/${editing.id}` : "/api/calendar";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) { setShowForm(false); load(); }
    else alert((await res.json()).error);
  }

  async function remove() {
    if (!editing || !confirm(`Delete "${editing.title}"?`)) return;
    await fetch(`/api/calendar/${editing.id}`, { method: "DELETE" });
    setShowForm(false);
    load();
  }

  const byDay: ByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const d = e.start.slice(0, 10);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(e);
    }
    return map;
  }, [events]);

  const shift = (dir: number) => {
    if (view === "month") setAnchor(addMonths(anchor, dir));
    else if (view === "week") setAnchor(addDays(anchor, 7 * dir));
    // agenda is anchored to today
  };

  const title = view === "month"
    ? `${monthName(+anchor.slice(5, 7))} ${anchor.slice(0, 4)}`
    : view === "week" ? `Week of ${anchor}` : "Next 30 days";

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="ml-auto flex items-center gap-2">
          <select className="input w-auto" value={view} onChange={(e) => setView(e.target.value as any)}>
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="agenda">Agenda</option>
          </select>
          {view !== "agenda" && (
            <>
              <button className="btn-secondary" onClick={() => shift(-1)}>←</button>
              <button className="btn-secondary" onClick={() => setAnchor(todayStr())}>Today</button>
              <button className="btn-secondary" onClick={() => shift(1)}>→</button>
            </>
          )}
          <button className="btn" onClick={() => openCreate(todayStr())}>+ Event</button>
        </div>
      </div>

      {view === "month" && <MonthGrid anchor={anchor} byDay={byDay} onDayClick={openCreate} onEventClick={openEdit} />}
      {view === "week" && <WeekGrid anchor={anchor} byDay={byDay} onDayClick={openCreate} onEventClick={openEdit} />}
      {view === "agenda" && <Agenda byDay={byDay} range={range} onEventClick={openEdit} />}

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <form onSubmit={save} className="space-y-3">
            <h2 className="text-lg font-semibold">{editing ? "Edit event" : "New event"}</h2>
            <input className="input" placeholder="Title" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Date</label>
                <input className="input" type="date" required value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <label className="label">Start</label>
                <input className="input" type="time" required value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })} />
              </div>
              <div>
                <label className="label">End</label>
                <input className="input" type="time" required value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })} />
              </div>
            </div>
            <input className="input" placeholder="Location (optional)" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <textarea className="input" placeholder="Description (optional)" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn" disabled={busy}>{editing ? "Save changes" : "Create event"}</button>
              {editing && (
                <button type="button" className="btn-secondary !text-red-400" onClick={remove}>Delete</button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function EventPill({ e, onClick }: { e: Event; onClick: () => void }) {
  return (
    <button onClick={(ev) => { ev.stopPropagation(); onClick(); }}
      className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[11px] hover:bg-zinc-700/50">
      <span className={`h-2 w-2 shrink-0 rounded-full ${CAT_COLOR[e.category] ?? CAT_COLOR.default}`} />
      <span className="truncate">{timeOf(e.start)} {e.title}</span>
    </button>
  );
}

function MonthGrid({ anchor, byDay, onDayClick, onEventClick }: { anchor: string; byDay: ByDay; onDayClick: DayClick; onEventClick: EventClick }) {
  const first = weekStart(monthStart(anchor));
  const [y, m] = [+anchor.slice(0, 4), +anchor.slice(5, 7)];
  const today = todayStr();
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d)));

  return (
    <div>
      <div className="grid grid-cols-7 gap-px pb-1 text-center text-xs font-medium text-zinc-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-zinc-800">
        {weeks.flat().map((date) => {
          const dayEvents = byDay.get(date) ?? [];
          const dim = date.slice(0, 7) !== `${y}-${String(m).padStart(2, "0")}`;
          return (
            <div key={date} onClick={() => onDayClick(date)}
              className={`min-h-24 cursor-pointer bg-zinc-900 p-1 hover:bg-zinc-800/60 ${dim ? "opacity-40" : ""}`}>
              <div className={`mb-1 text-xs ${date === today ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 font-bold text-white" : "text-zinc-400"}`}>
                {+date.slice(8, 10)}
              </div>
              {dayEvents.slice(0, 3).map((e) => <EventPill key={e.id} e={e} onClick={() => onEventClick(e)} />)}
              {dayEvents.length > 3 && <div className="px-1 text-[10px] text-zinc-500">+{dayEvents.length - 3} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekGrid({ anchor, byDay, onDayClick, onEventClick }: { anchor: string; byDay: ByDay; onDayClick: DayClick; onEventClick: EventClick }) {
  const first = weekStart(anchor);
  const today = todayStr();
  const days = Array.from({ length: 7 }, (_, i) => addDays(first, i));

  return (
    <div className="grid gap-2 sm:grid-cols-7">
      {days.map((date) => (
        <div key={date} onClick={() => onDayClick(date)}
          className={`min-h-40 cursor-pointer rounded-lg border p-2 hover:bg-zinc-800/40 ${date === today ? "border-emerald-700" : "border-zinc-800"} bg-zinc-900`}>
          <div className="mb-2 text-xs text-zinc-400">{date.slice(8, 10)} {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][mondayIndex(date)]}</div>
          {(byDay.get(date) ?? []).map((e) => <EventPill key={e.id} e={e} onClick={() => onEventClick(e)} />)}
        </div>
      ))}
    </div>
  );
}

function Agenda({ byDay, range, onEventClick }: { byDay: ByDay; range: [string, string]; onEventClick: EventClick }) {
  const days = Array.from({ length: 30 }, (_, i) => addDays(range[0], i)).filter((d) => (byDay.get(d) ?? []).length > 0);
  const [weather, setWeather] = useState<Record<string, any>>({});

  useEffect(() => {
    const withLocation = days.flatMap((d) => byDay.get(d) ?? []).filter((e) => e.location);
    for (const e of withLocation) {
      fetch(`/api/weather/event?eventId=${e.id}`)
        .then((r) => r.json())
        .then((d) => d.weather && setWeather((w) => ({ ...w, [e.id]: d.weather })))
        .catch(() => {});
    }
  }, [byDay]);

  if (days.length === 0) return <p className="card text-sm text-zinc-500">No events in the next 30 days.</p>;

  return (
    <div className="space-y-4">
      {days.map((date) => (
        <div key={date} className="card">
          <h3 className="mb-2 text-sm font-semibold text-zinc-300">{date}</h3>
          <ul className="space-y-3">
            {(byDay.get(date) ?? []).map((e: Event) => {
              const w = weather[e.id];
              return (
                <li key={e.id}>
                  <button onClick={() => onEventClick(e)} className="flex w-full items-start gap-3 text-left text-sm hover:opacity-80">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CAT_COLOR[e.category] ?? CAT_COLOR.default}`} />
                    <span className="w-11 shrink-0 font-mono text-zinc-400">{timeOf(e.start)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block">{e.title}</span>
                      {e.location && <span className="block text-xs text-zinc-500">{e.location}</span>}
                      {e.description && <span className="block text-xs text-zinc-600">{e.description}</span>}
                    </span>
                    {w?.available && (
                      <span className="shrink-0 rounded-lg bg-zinc-800 px-2 py-1 text-right text-xs text-zinc-300">
                        {Math.round(w.temp)}°C · {w.precipProb ?? "?"}% rain
                        <span className="block text-[10px] text-zinc-500">{wmoLabel(w.code)}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
