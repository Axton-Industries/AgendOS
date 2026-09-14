"use client";

import { useCallback, useEffect, useState } from "react";
import { todayStr } from "@/lib/dates";
import { useTranslations } from "@/lib/i18n";

type Reminder = { id: string; text: string; due: string; done: number };
type Notification = { kind: string; text: string; detail: string };

export default function NotificationsPage() {
  const { t, lang } = useTranslations();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [text, setText] = useState("");
  const [due, setDue] = useState(todayStr());
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    const d = await fetch(`/api/reminders?lang=${lang}`).then((r) => r.json());
    setReminders(d.reminders);
    setNotifications(d.notifications);
  }, [lang]);

  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, due }),
    });
    setText("");
    load();
  }

  async function complete(id: string) {
    await fetch(`/api/reminders/${id}`, { method: "PATCH" });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    load();
  }

  const visible = showDone ? reminders : reminders.filter((r) => !r.done);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="page-title">{t("notificationsPageTitle")}</h1>

      <section className="card">
        <h2 className="mb-3 section-title">{t("today")}</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("attentionToday")}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {notifications.map((n, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.kind === "event" ? "bg-blue-500" : "bg-amber-500"}`} />
                <span>
                  <span>{n.text}</span>
                  <span className="block text-xs text-zinc-500">{n.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 section-title">{t("newReminder")}</h2>
          <form onSubmit={add} className="space-y-3">
            <input className="input" placeholder={t("reminderPlaceholder")} required value={text} onChange={(e) => setText(e.target.value)} />
            <input className="input" type="date" required value={due} onChange={(e) => setDue(e.target.value)} />
            <button className="btn">{t("addReminder")}</button>
          </form>
        </section>

        <section className="card">
          <div className="mb-3 flex items-center">
            <h2 className="section-title">{t("reminders")}</h2>
            <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> {t("showDone")}
            </label>
          </div>
          <ul className="divide-y divide-zinc-800 text-sm">
            {visible.map((r) => (
              <li key={r.id} className="group flex items-center gap-2 py-2">
                <input type="checkbox" checked={!!r.done} onChange={() => complete(r.id)} className="accent-neon" />
                <span className={`flex-1 ${r.done ? "text-zinc-600 line-through" : ""}`}>{r.text}</span>
                <span className={`text-xs ${r.due <= todayStr() && !r.done ? "text-amber-400" : "text-zinc-500"}`}>{r.due.slice(5)}</span>
                <button className="text-zinc-600 opacity-0 hover:text-red-400 group-hover:opacity-100" onClick={() => remove(r.id)}>×</button>
              </li>
            ))}
            {visible.length === 0 && <li className="py-2 text-zinc-500">{t("noReminders")}</li>}
          </ul>
        </section>
      </div>

      <p className="text-xs text-zinc-600">
        {t("notificationsFooter")}
      </p>
    </div>
  );
}
